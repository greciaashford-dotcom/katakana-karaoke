import asyncio
import hmac
import logging
import uuid
from datetime import timedelta

from fastapi import APIRouter, Depends, Request
from fastapi.responses import JSONResponse
from pymongo import ReturnDocument

from .auth import authenticate, client_ip, create_token, login_limiter, verify_password
from .common import ApiError, clean, is_email, iso_after, madrid_date_key, mask_email, now_iso, read_json, to_int
from .config import WEBHOOK_CRON_SECRET
from .database import get_db
from .emails import next_followup_iso, send_followup_email, upsert_client
from .songs_query import catalog_stats, search_songs

EVENT_TYPES = {"karaoke", "cumpleanos", "despedida", "empresa", "afterwork", "infantil", "privada", "micro"}

log = logging.getLogger("katakana.public")
router = APIRouter()


@router.get("/health")
async def health():
    return {"ok": True, "service": "katakana-api"}


@router.post("/auth/login")
async def login(request: Request):
    login_limiter.check(client_ip(request))
    body = await read_json(request)
    email = clean(body.get("email")).lower()
    password = clean(body.get("password"))
    user = await get_db().users.find_one({"email": email, "active": True})
    if not user or not verify_password(password, user.get("passwordHash", "")):
        raise ApiError(401, "Credenciales incorrectas")
    return {"token": create_token(user["id"]), "user": {"id": user["id"], "email": user["email"], "role": user["role"]}}


@router.get("/auth/me")
async def me(user: dict = Depends(authenticate)):
    return {"user": user}


@router.get("/site")
async def site():
    db = get_db()
    settings, artists, gallery, stats = await asyncio.gather(
        db.settings.find_one({"id": "main"}, {"_id": 0}),
        db.artists.find({}, {"_id": 0}).sort("order", 1).to_list(length=None),
        db.gallery.find({}, {"_id": 0}).sort("order", 1).to_list(length=None),
        catalog_stats(db),
    )
    return {"settings": settings, "artists": artists, "gallery": gallery, "songCount": stats["songs"], "catalog": stats}


@router.get("/songs")
async def songs(request: Request):
    return await search_songs(get_db(), request.query_params)


@router.post("/reservations", status_code=201)
async def create_reservation(request: Request):
    body = await read_json(request)
    people = to_int(body.get("people"))
    event_type = clean(body.get("eventType"), 20)
    reservation = {
        "id": str(uuid.uuid4()), "name": clean(body.get("name"), 80), "people": people,
        "date": clean(body.get("date")), "time": clean(body.get("time")), "contact": clean(body.get("contact"), 120),
        "email": clean(body.get("email")).lower()[:160], "notes": clean(body.get("notes"), 500),
        "eventType": event_type if event_type in EVENT_TYPES else "karaoke", "consent": body.get("consent") is True,
        "status": "pending", "createdAt": now_iso(),
    }
    if not reservation["name"] or not reservation["date"] or not reservation["time"] or not reservation["contact"] or people is None or people < 1 or people > 120:
        raise ApiError(400, "Revisa los datos de la reserva")
    if not reservation["consent"]:
        raise ApiError(400, "Debes aceptar la política de privacidad para enviar la reserva")
    await get_db().reservations.insert_one(dict(reservation))
    contact_lower = reservation["contact"].lower()
    marketing_email = reservation["email"] if is_email(reservation["email"]) else (contact_lower if is_email(contact_lower) else "")
    phone = "" if "@" in reservation["contact"] else reservation["contact"]
    if marketing_email:
        asyncio.create_task(upsert_client(get_db(), email=marketing_email, name=reservation["name"], phone=phone, source="reserva"))
    return {"reservation": reservation}


@router.post("/song-requests", status_code=201)
async def create_song_request(request: Request):
    body = await read_json(request)
    email = clean(body.get("email")).lower()[:160]
    title = clean(body.get("title"), 200)
    artist = clean(body.get("artist"), 200)
    name = clean(body.get("name"), 80)
    if not is_email(email) or not title:
        raise ApiError(400, "Introduce un correo válido y una canción")
    db = get_db()
    song_id = clean(body.get("songId"), 80)
    song = await db.songs.find_one({"id": song_id}, {"_id": 0, "title": 1, "artist": 1, "code": 1, "language": 1}) if song_id else None
    song_request = {
        "id": str(uuid.uuid4()), "email": email, "name": name, "title": (song or {}).get("title") or title, "artist": (song or {}).get("artist") or artist,
        "code": (song or {}).get("code") or clean(body.get("code"), 60), "language": (song or {}).get("language") or "", "songId": song_id,
        "status": "queued", "playedAt": None, "dateKey": madrid_date_key(), "createdAt": now_iso(),
    }
    await db.songRequests.insert_one(dict(song_request))
    try:
        client = await upsert_client(db, email=email, name=name, source="cancion")
    except Exception as error:
        log.error("[song-request] upsert client failed: %s", error)
        client = None
    return {"request": song_request, "client": {"email": client["email"], "name": client.get("name") or name} if client else None}


@router.post("/song-suggestions", status_code=201)
async def create_song_suggestion(request: Request):
    body = await read_json(request)
    title = clean(body.get("title"), 200)
    artist = clean(body.get("artist"), 200)
    email = clean(body.get("email")).lower()[:160]
    name = clean(body.get("name"), 80)
    if not title or not artist:
        raise ApiError(400, "Indica el título y el artista de la canción")
    if email and not is_email(email):
        raise ApiError(400, "Introduce un correo válido o déjalo vacío")
    suggestion = {
        "id": str(uuid.uuid4()), "title": title, "artist": artist, "email": email, "name": name, "notes": clean(body.get("notes"), 400),
        "status": "pending", "createdAt": now_iso(),
    }
    db = get_db()
    await db.songSuggestions.insert_one(dict(suggestion))
    if email:
        asyncio.create_task(upsert_client(db, email=email, name=name, source="sugerencia"))
    return {"suggestion": suggestion}


@router.get("/unsubscribe/{token}")
async def unsubscribe_status(token: str):
    client = await get_db().clients.find_one({"unsubscribeToken": clean(token, 80)}, {"_id": 0, "email": 1, "subscribed": 1})
    if not client:
        raise ApiError(404, "Enlace no válido")
    return {"email": mask_email(client["email"]), "subscribed": client.get("subscribed") is not False}


@router.post("/unsubscribe/{token}")
async def unsubscribe_update(token: str, request: Request):
    body = await read_json(request)
    subscribed = body.get("subscribed") is True
    result = await get_db().clients.find_one_and_update(
        {"unsubscribeToken": clean(token, 80)},
        {"$set": {"subscribed": subscribed, "unsubscribedAt": None if subscribed else now_iso(), "nextFollowupAt": next_followup_iso() if subscribed else None}},
        projection={"_id": 0, "email": 1, "subscribed": 1}, return_document=ReturnDocument.AFTER,
    )
    if not result:
        raise ApiError(404, "Enlace no válido")
    return {"email": mask_email(result["email"]), "subscribed": result["subscribed"]}


async def process_followups() -> None:
    db = get_db()
    try:
        due = await db.clients.find({"subscribed": True, "nextFollowupAt": {"$ne": None, "$lte": now_iso()}}).limit(200).to_list(length=200)
        for client in due:
            ok = await send_followup_email(db, client)
            sent_at = now_iso()
            update = (
                {"$set": {"lastFollowupAt": sent_at, "lastEmailAt": sent_at, "nextFollowupAt": next_followup_iso()}, "$inc": {"followupCount": 1}}
                if ok else {"$set": {"nextFollowupAt": iso_after(6)}}
            )
            await db.clients.update_one({"id": client["id"]}, update)
            await asyncio.sleep(0.6)
    except Exception as error:
        log.error("[cron] followup error: %s", error)


@router.post("/cron/followup")
async def cron_followup(request: Request):
    # Cron endpoints must ack 2xx immediately; the actual work runs in the background.
    header = request.headers.get("authorization", "")
    token = header[7:] if header.startswith("Bearer ") else ""
    if not WEBHOOK_CRON_SECRET or not hmac.compare_digest(token.encode(), WEBHOOK_CRON_SECRET.encode()):
        raise ApiError(401, "No autorizado")
    asyncio.create_task(process_followups())
    return JSONResponse({"ok": True}, status_code=202)
