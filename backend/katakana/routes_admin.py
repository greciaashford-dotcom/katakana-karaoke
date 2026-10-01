import asyncio
import logging
import re
import uuid

from fastapi import APIRouter, Depends, File, Form, Request, Response, UploadFile
from fastapi.responses import JSONResponse
from pymongo import InsertOne, ReturnDocument, UpdateOne

from .auth import require_admin
from .catalog import build_catalog_workbook, parse_catalog_workbook, search_text, song_document
from .common import ApiError, clean, is_email, madrid_date_key, now_iso, read_json, to_int
from .database import get_db
from .defaults import DEFAULT_HOURS
from .emails import build_client, next_followup_iso, send_campaign_email
from .excel_utils import build_clients_workbook, parse_clients_workbook
from .songs_query import invalidate_catalog_stats, search_songs

log = logging.getLogger("katakana.admin")
router = APIRouter(dependencies=[Depends(require_admin)])
ALLOWED_STATUS = {"pending", "confirmed", "completed", "cancelled"}
XLSX_TYPE = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
MAX_UPLOAD = 8 * 1024 * 1024
MAX_CATALOG_UPLOAD = 20 * 1024 * 1024
TIME_RE = re.compile(r"^([01]\d|2[0-3]):[0-5]\d$")
SUGGESTION_STATUS = {"pending", "added", "rejected"}


def no_content() -> Response:
    return Response(status_code=204)


def clients_filter(params) -> dict:
    criteria: dict = {}
    q = clean(params.get("q"), 120)
    if q:
        pattern = {"$regex": re.escape(q), "$options": "i"}
        criteria["$or"] = [{"email": pattern}, {"name": pattern}, {"phone": pattern}]
    source = clean(params.get("source"), 40)
    if source:
        criteria["source"] = source
    if params.get("subscribed") == "true":
        criteria["subscribed"] = True
    if params.get("subscribed") == "false":
        criteria["subscribed"] = False
    return criteria


@router.get("/stats")
async def stats():
    db = get_db()
    today = madrid_date_key()
    reservations, pending, artists, songs, clients, requests_today, suggestions = await asyncio.gather(
        db.reservations.count_documents({}), db.reservations.count_documents({"status": "pending"}),
        db.artists.count_documents({}), db.songs.estimated_document_count(),
        db.clients.count_documents({}), db.songRequests.count_documents({"dateKey": today, "status": "queued"}),
        db.songSuggestions.count_documents({"status": "pending"}),
    )
    return {"reservations": reservations, "pending": pending, "artists": artists, "songs": songs, "clients": clients, "requestsToday": requests_today, "suggestionsPending": suggestions}


def clean_hours(value) -> list[dict]:
    by_day = {h.get("day"): h for h in value if isinstance(h, dict)} if isinstance(value, list) else {}
    hours = []
    for default in DEFAULT_HOURS:
        row = by_day.get(default["day"], {})
        closed = row.get("closed") is True
        open_at, close_at = clean(row.get("open"), 5), clean(row.get("close"), 5)
        if not closed and (not TIME_RE.match(open_at) or not TIME_RE.match(close_at)):
            raise ApiError(400, f"Revisa el horario del {default['label'].lower()} (formato HH:MM)")
        hours.append({"day": default["day"], "label": default["label"], "open": "" if closed else open_at, "close": "" if closed else close_at, "closed": closed})
    return hours


@router.put("/settings")
async def update_settings(request: Request):
    body = await read_json(request)
    update = {
        "heroTitle": clean(body.get("heroTitle"), 140), "heroDescription": clean(body.get("heroDescription"), 260),
        "heroVideoUrl": clean(body.get("heroVideoUrl"), 1000), "heroImageUrl": clean(body.get("heroImageUrl"), 1000),
        "logoUrl": clean(body.get("logoUrl"), 1000), "hours": clean_hours(body.get("hours")),
        "hoursNote": clean(body.get("hoursNote"), 200), "reservationHours": clean(body.get("reservationHours"), 200),
        "notice": clean(body.get("notice"), 240), "googleRating": clean(body.get("googleRating"), 4),
        "googleReviewCount": clean(body.get("googleReviewCount"), 8), "googleReviewsUrl": clean(body.get("googleReviewsUrl"), 1000),
        "elfsightWidgetId": clean(body.get("elfsightWidgetId"), 80), "updatedAt": now_iso(),
    }
    if not update["heroTitle"] or not update["heroDescription"] or not update["heroImageUrl"] or not update["logoUrl"]:
        raise ApiError(400, "Completa los campos obligatorios")
    if update["googleRating"]:
        try:
            rating = float(update["googleRating"].replace(",", "."))
        except ValueError:
            raise ApiError(400, "La valoración de Google debe ser un número entre 1 y 5")
        if not 1 <= rating <= 5:
            raise ApiError(400, "La valoración de Google debe ser un número entre 1 y 5")
        update["googleRating"] = f"{rating:.1f}"
    if update["elfsightWidgetId"] and not re.fullmatch(r"[a-zA-Z0-9-]{8,80}", update["elfsightWidgetId"]):
        raise ApiError(400, "El ID del widget de Elfsight no es válido")
    db = get_db()
    await db.settings.update_one({"id": "main"}, {"$set": update})
    return {"settings": await db.settings.find_one({"id": "main"}, {"_id": 0})}


# ---- Artistas ----
def artist_payload(body: dict) -> dict:
    artist = clean(body.get("artist"), 120)
    return {
        "artist": artist, "catalogArtist": search_text(clean(body.get("catalogArtist"), 160) or artist), "song": clean(body.get("song"), 160),
        "description": clean(body.get("description"), 400), "imageUrl": clean(body.get("imageUrl"), 1000), "order": to_int(body.get("order"), 0) or 0,
    }


@router.get("/artists")
async def list_artists():
    return {"items": await get_db().artists.find({}, {"_id": 0}).sort("order", 1).to_list(length=None)}


@router.post("/artists", status_code=201)
async def create_artist(request: Request):
    artist = {"id": str(uuid.uuid4()), **artist_payload(await read_json(request))}
    if not artist["artist"] or not artist["song"] or not artist["imageUrl"]:
        raise ApiError(400, "Artista, canción e imagen son obligatorios")
    await get_db().artists.insert_one(dict(artist))
    return {"artist": artist}


@router.put("/artists/{artist_id}")
async def update_artist(artist_id: str, request: Request):
    result = await get_db().artists.find_one_and_update({"id": artist_id}, {"$set": artist_payload(await read_json(request))}, projection={"_id": 0}, return_document=ReturnDocument.AFTER)
    if not result:
        raise ApiError(404, "Artista no encontrado")
    return {"artist": result}


@router.delete("/artists/{artist_id}")
async def delete_artist(artist_id: str):
    if not (await get_db().artists.delete_one({"id": artist_id})).deleted_count:
        raise ApiError(404, "Artista no encontrado")
    return no_content()


# ---- Galería ----
def gallery_payload(body: dict) -> dict:
    return {"imageUrl": clean(body.get("imageUrl"), 1000), "alt": clean(body.get("alt"), 160), "order": to_int(body.get("order"), 0) or 0}


@router.get("/gallery")
async def list_gallery():
    return {"items": await get_db().gallery.find({}, {"_id": 0}).sort("order", 1).to_list(length=None)}


@router.post("/gallery", status_code=201)
async def create_gallery_item(request: Request):
    item = {"id": str(uuid.uuid4()), **gallery_payload(await read_json(request))}
    if not item["imageUrl"]:
        raise ApiError(400, "La URL es obligatoria")
    await get_db().gallery.insert_one(dict(item))
    return {"item": item}


@router.put("/gallery/{item_id}")
async def update_gallery_item(item_id: str, request: Request):
    result = await get_db().gallery.find_one_and_update({"id": item_id}, {"$set": gallery_payload(await read_json(request))}, projection={"_id": 0}, return_document=ReturnDocument.AFTER)
    if not result:
        raise ApiError(404, "Imagen no encontrada")
    return {"item": result}


@router.delete("/gallery/{item_id}")
async def delete_gallery_item(item_id: str):
    if not (await get_db().gallery.delete_one({"id": item_id})).deleted_count:
        raise ApiError(404, "Imagen no encontrada")
    return no_content()


# ---- Reservas ----
@router.get("/reservations")
async def list_reservations(request: Request):
    status = request.query_params.get("status")
    criteria = {"status": status} if status in ALLOWED_STATUS else {}
    return {"items": await get_db().reservations.find(criteria, {"_id": 0}).sort("createdAt", -1).to_list(length=None)}


@router.patch("/reservations/{reservation_id}")
async def update_reservation(reservation_id: str, request: Request):
    body = await read_json(request)
    if body.get("status") not in ALLOWED_STATUS:
        raise ApiError(400, "Estado no válido")
    result = await get_db().reservations.find_one_and_update({"id": reservation_id}, {"$set": {"status": body["status"], "updatedAt": now_iso()}}, projection={"_id": 0}, return_document=ReturnDocument.AFTER)
    if not result:
        raise ApiError(404, "Reserva no encontrada")
    return {"reservation": result}


@router.delete("/reservations/{reservation_id}")
async def delete_reservation(reservation_id: str):
    if not (await get_db().reservations.delete_one({"id": reservation_id})).deleted_count:
        raise ApiError(404, "Reserva no encontrada")
    return no_content()


# ---- Clientes ----
@router.get("/clients")
async def list_clients(request: Request):
    db = get_db()
    items, total, subscribed = await asyncio.gather(
        db.clients.find(clients_filter(request.query_params), {"_id": 0}).sort("createdAt", -1).limit(5000).to_list(length=5000),
        db.clients.count_documents({}), db.clients.count_documents({"subscribed": True}),
    )
    return {"items": items, "total": total, "subscribed": subscribed, "unsubscribed": total - subscribed}


@router.get("/clients/export")
async def export_clients(request: Request):
    items = await get_db().clients.find(clients_filter(request.query_params), {"_id": 0}).sort("createdAt", -1).to_list(length=None)
    content = await asyncio.to_thread(build_clients_workbook, items)
    return Response(content=content, media_type=XLSX_TYPE, headers={"Content-Disposition": f'attachment; filename="katakana-clientes-{madrid_date_key()}.xlsx"'})


@router.post("/clients/import")
async def import_clients(file: UploadFile | None = File(None)):
    if file is None:
        raise ApiError(400, "Adjunta un archivo Excel (.xlsx)")
    data = await file.read()
    if len(data) > MAX_UPLOAD:
        raise ApiError(400, "Archivo no válido o demasiado grande (máx. 8 MB)")
    try:
        rows = await asyncio.to_thread(parse_clients_workbook, data)
    except Exception:
        raise ApiError(400, "No se pudo leer el Excel. Usa el formato .xlsx")
    db = get_db()
    summary = {"total": len(rows), "created": 0, "updated": 0, "skipped": 0}
    for row in rows:
        email = clean(row.get("email")).lower()
        if not is_email(email):
            summary["skipped"] += 1
            continue
        existing = await db.clients.find_one({"email": email})
        if existing:
            patch = {}
            if row.get("name") and not existing.get("name"):
                patch["name"] = clean(row["name"], 80)
            if row.get("phone") and not existing.get("phone"):
                patch["phone"] = clean(row["phone"], 40)
            if row.get("notes") and not existing.get("notes"):
                patch["notes"] = clean(row["notes"], 300)
            if isinstance(row.get("subscribed"), bool) and row["subscribed"] != (existing.get("subscribed") is not False):
                patch.update({"subscribed": row["subscribed"], "nextFollowupAt": next_followup_iso() if row["subscribed"] else None, "unsubscribedAt": None if row["subscribed"] else now_iso()})
            if patch:
                await db.clients.update_one({"email": email}, {"$set": patch})
                summary["updated"] += 1
            else:
                summary["skipped"] += 1
            continue
        client = build_client(email=email, name=row.get("name", ""), phone=row.get("phone", ""), notes=row.get("notes", ""), source=clean(row.get("source"), 40) or "importado", subscribed=row["subscribed"] if isinstance(row.get("subscribed"), bool) else True)
        await db.clients.insert_one(client)
        summary["created"] += 1
    return summary


@router.post("/clients", status_code=201)
async def create_client(request: Request):
    body = await read_json(request)
    email = clean(body.get("email")).lower()
    if not is_email(email):
        raise ApiError(400, "Introduce un correo válido")
    db = get_db()
    if await db.clients.find_one({"email": email}):
        raise ApiError(409, "Este cliente ya existe")
    client = build_client(email=email, name=body.get("name", ""), phone=body.get("phone", ""), notes=body.get("notes", ""), source="manual", subscribed=body.get("subscribed") is not False)
    await db.clients.insert_one(dict(client))
    return {"client": client}


@router.put("/clients/{client_id}")
async def update_client(client_id: str, request: Request):
    db = get_db()
    existing = await db.clients.find_one({"id": client_id})
    if not existing:
        raise ApiError(404, "Cliente no encontrado")
    body = await read_json(request)
    subscribed = body.get("subscribed") is not False
    update = {"name": clean(body.get("name"), 80), "phone": clean(body.get("phone"), 40), "notes": clean(body.get("notes"), 300), "subscribed": subscribed}
    if subscribed != (existing.get("subscribed") is not False):
        update.update({"nextFollowupAt": next_followup_iso() if subscribed else None, "unsubscribedAt": None if subscribed else now_iso()})
    result = await db.clients.find_one_and_update({"id": client_id}, {"$set": update}, projection={"_id": 0}, return_document=ReturnDocument.AFTER)
    return {"client": result}


@router.delete("/clients/{client_id}")
async def delete_client(client_id: str):
    if not (await get_db().clients.delete_one({"id": client_id})).deleted_count:
        raise ApiError(404, "Cliente no encontrado")
    return no_content()


# ---- Campañas ----
def campaign_payload(body: dict) -> dict:
    return {"subject": clean(body.get("subject"), 160), "message": clean(body.get("message"), 5000), "ctaText": clean(body.get("ctaText"), 60), "ctaUrl": clean(body.get("ctaUrl"), 500)}


@router.get("/campaigns")
async def list_campaigns():
    return {"items": await get_db().campaigns.find({}, {"_id": 0}).sort("createdAt", -1).limit(50).to_list(length=50)}


@router.post("/campaigns/test")
async def test_campaign(request: Request, user: dict = Depends(require_admin)):
    body = await read_json(request)
    payload = campaign_payload(body)
    if not payload["subject"] or not payload["message"]:
        raise ApiError(400, "Asunto y mensaje son obligatorios")
    to = clean(body.get("email")).lower() or user["email"]
    if not is_email(to):
        raise ApiError(400, "Correo de prueba no válido")
    if not await send_campaign_email(get_db(), {"email": to, "name": "Equipo Katakana"}, payload):
        raise ApiError(502, "Resend no pudo entregar la prueba")
    return {"ok": True, "to": to}


async def run_campaign(campaign_id: str, recipients: list[dict], payload: dict) -> None:
    db = get_db()
    for contact in recipients:
        try:
            ok = await send_campaign_email(db, contact, payload)
        except Exception as error:
            log.error("[campaign] envío falló: %s", error)
            ok = False
        await db.campaigns.update_one({"id": campaign_id}, {"$inc": {"sent": 1} if ok else {"failed": 1}})
        if ok:
            await db.clients.update_one({"id": contact["id"]}, {"$set": {"lastEmailAt": now_iso()}})
        await asyncio.sleep(0.6)
    await db.campaigns.update_one({"id": campaign_id}, {"$set": {"status": "done", "finishedAt": now_iso()}})


@router.post("/campaigns")
async def create_campaign(request: Request):
    body = await read_json(request)
    payload = campaign_payload(body)
    if not payload["subject"] or not payload["message"]:
        raise ApiError(400, "Asunto y mensaje son obligatorios")
    source = clean(body.get("source"), 40)
    criteria = {"subscribed": True, **({"source": source} if source else {})}
    db = get_db()
    recipients = await db.clients.find(criteria, {"_id": 0, "id": 1, "email": 1, "name": 1, "unsubscribeToken": 1}).to_list(length=None)
    if not recipients:
        raise ApiError(400, "No hay clientes suscritos para esa audiencia")
    campaign = {"id": str(uuid.uuid4()), **payload, "source": source, "total": len(recipients), "sent": 0, "failed": 0, "status": "sending", "createdAt": now_iso(), "finishedAt": None}
    await db.campaigns.insert_one(dict(campaign))
    asyncio.create_task(run_campaign(campaign["id"], recipients, payload))
    return JSONResponse({"campaign": campaign}, status_code=202)


# ---- Cola de canciones ----
@router.get("/song-requests")
async def list_song_requests(request: Request):
    requested = request.query_params.get("date") or ""
    date = requested if re.fullmatch(r"\d{4}-\d{2}-\d{2}", requested) else madrid_date_key()
    items = await get_db().songRequests.find({"dateKey": date}, {"_id": 0}).sort([("status", 1), ("createdAt", 1)]).to_list(length=None)
    return {"items": items, "date": date}


@router.patch("/song-requests/{request_id}")
async def update_song_request(request_id: str, request: Request):
    body = await read_json(request)
    status = "played" if body.get("status") == "played" else "queued"
    result = await get_db().songRequests.find_one_and_update({"id": request_id}, {"$set": {"status": status, "playedAt": now_iso() if status == "played" else None}}, projection={"_id": 0}, return_document=ReturnDocument.AFTER)
    if not result:
        raise ApiError(404, "Petición no encontrada")
    return {"request": result}


@router.delete("/song-requests/{request_id}")
async def delete_song_request(request_id: str):
    if not (await get_db().songRequests.delete_one({"id": request_id})).deleted_count:
        raise ApiError(404, "Petición no encontrada")
    return no_content()


# ---- Catálogo de canciones ----
async def mark_catalog_managed(db) -> None:
    invalidate_catalog_stats()
    await db.meta.update_one({"id": "catalog"}, {"$set": {"managed": True, "updatedAt": now_iso()}}, upsert=True)


async def next_source_id(db) -> int:
    last = await db.songs.find_one({"sourceId": {"$ne": None}}, {"_id": 0, "sourceId": 1}, sort=[("sourceId", -1)])
    return int((last or {}).get("sourceId") or 0) + 1


def song_input(body: dict) -> dict:
    return {"artist": clean(body.get("artist"), 200), "title": clean(body.get("title"), 200), "code": clean(body.get("code"), 60), "lang": clean(body.get("lang"), 12)}


@router.get("/songs")
async def admin_list_songs(request: Request):
    params = dict(request.query_params)
    params.setdefault("sort", "new")
    result = await search_songs(get_db(), params, default_limit=25, max_limit=100)
    return result


@router.get("/songs/export")
async def export_songs():
    items = await get_db().songs.find({}, {"_id": 0}).sort([("artistKey", 1), ("titleKey", 1)]).to_list(length=None)
    content = await asyncio.to_thread(build_catalog_workbook, items)
    return Response(content=content, media_type=XLSX_TYPE, headers={"Content-Disposition": f'attachment; filename="katakana-canciones-{madrid_date_key()}.xlsx"'})


@router.post("/songs", status_code=201)
async def create_song(request: Request):
    db = get_db()
    data = song_input(await read_json(request))
    doc = song_document({**data, "sourceId": await next_source_id(db)})
    if not doc:
        raise ApiError(400, "Artista y título son obligatorios")
    doc["id"] = str(uuid.uuid4())
    doc["createdAt"] = now_iso()
    await db.songs.insert_one(dict(doc))
    await mark_catalog_managed(db)
    doc.pop("_id", None)
    return {"song": doc}


@router.put("/songs/{song_id}")
async def update_song(song_id: str, request: Request):
    db = get_db()
    existing = await db.songs.find_one({"id": song_id}, {"_id": 0})
    if not existing:
        raise ApiError(404, "Canción no encontrada")
    data = song_input(await read_json(request))
    doc = song_document({**data, "sourceId": existing.get("sourceId")}, song_id=song_id)
    if not doc:
        raise ApiError(400, "Artista y título son obligatorios")
    doc["updatedAt"] = now_iso()
    await db.songs.update_one({"id": song_id}, {"$set": doc})
    await mark_catalog_managed(db)
    return {"song": {**existing, **doc}}


@router.delete("/songs/{song_id}")
async def delete_song(song_id: str):
    db = get_db()
    if not (await db.songs.delete_one({"id": song_id})).deleted_count:
        raise ApiError(404, "Canción no encontrada")
    await mark_catalog_managed(db)
    return no_content()


def song_changed(existing: dict, doc: dict) -> bool:
    return any(existing.get(key) != doc.get(key) for key in ("artist", "title", "code", "lang"))


@router.post("/songs/import")
async def import_songs(file: UploadFile | None = File(None), mode: str = Form("merge")):
    if file is None:
        raise ApiError(400, "Adjunta un archivo Excel (.xlsx)")
    data = await file.read()
    if not data or len(data) > MAX_CATALOG_UPLOAD:
        raise ApiError(400, "Archivo no válido o demasiado grande (máx. 20 MB)")
    try:
        rows = await asyncio.to_thread(parse_catalog_workbook, data)
    except Exception:
        raise ApiError(400, "No se pudo leer el Excel. Usa el formato .xlsx")
    if not rows:
        raise ApiError(400, "No encontramos columnas de Artista y Título en el Excel")
    db = get_db()
    mode = "replace" if mode == "replace" else "merge"
    summary = {"mode": mode, "total": len(rows), "created": 0, "updated": 0, "unchanged": 0, "skipped": 0}
    if mode == "replace":
        docs, seen = [], set()
        numeric = [int(r["sourceId"]) for r in rows if str(r.get("sourceId") or "").isdigit()]
        next_id = (max(numeric) if numeric else 0) + 1
        for row in rows:
            source = int(row["sourceId"]) if str(row.get("sourceId") or "").isdigit() else None
            if source is None or source in seen:
                source, next_id = next_id, next_id + 1
            doc = song_document({**row, "sourceId": source})
            if not doc:
                summary["skipped"] += 1
                continue
            seen.add(source)
            docs.append(doc)
        await db.songs.delete_many({})
        for index in range(0, len(docs), 5000):
            await db.songs.insert_many(docs[index:index + 5000], ordered=False)
        summary["created"] = len(docs)
    else:
        existing = await db.songs.find({}, {"_id": 0, "search": 0}).to_list(length=None)
        by_source = {s["sourceId"]: s for s in existing if s.get("sourceId") is not None}
        by_key = {(s.get("artistKey"), s.get("titleKey"), s.get("codeKey")): s for s in existing}
        next_id = (max(by_source) if by_source else 0) + 1
        inserts, updates = [], []
        for row in rows:
            source = int(row["sourceId"]) if str(row.get("sourceId") or "").isdigit() else None
            match = by_source.get(source) if source is not None else None
            probe = song_document({**row, "sourceId": source or 0})
            if not probe:
                summary["skipped"] += 1
                continue
            if match is None:
                match = by_key.get((probe["artistKey"], probe["titleKey"], probe["codeKey"]))
            if match:
                doc = song_document({**row, "sourceId": match.get("sourceId")}, song_id=match["id"])
                if song_changed(match, doc):
                    updates.append(UpdateOne({"id": match["id"]}, {"$set": {**doc, "updatedAt": now_iso()}}))
                    summary["updated"] += 1
                else:
                    summary["unchanged"] += 1
                continue
            if source is None or source in by_source:
                source, next_id = next_id, next_id + 1
            doc = song_document({**row, "sourceId": source})
            by_source[source] = doc
            by_key[(doc["artistKey"], doc["titleKey"], doc["codeKey"])] = doc
            inserts.append(InsertOne(doc))
            summary["created"] += 1
        ops = updates + inserts
        for index in range(0, len(ops), 2000):
            await db.songs.bulk_write(ops[index:index + 2000], ordered=False)
    await mark_catalog_managed(db)
    return summary


# ---- Sugerencias de canciones nuevas ----
@router.get("/song-suggestions")
async def list_song_suggestions(request: Request):
    status = request.query_params.get("status") or ""
    criteria = {"status": status} if status in SUGGESTION_STATUS else {}
    items = await get_db().songSuggestions.find(criteria, {"_id": 0}).sort("createdAt", -1).limit(500).to_list(length=500)
    return {"items": items}


@router.patch("/song-suggestions/{suggestion_id}")
async def update_song_suggestion(suggestion_id: str, request: Request):
    body = await read_json(request)
    status = clean(body.get("status"), 12)
    if status not in SUGGESTION_STATUS:
        raise ApiError(400, "Estado no válido")
    result = await get_db().songSuggestions.find_one_and_update({"id": suggestion_id}, {"$set": {"status": status, "updatedAt": now_iso()}}, projection={"_id": 0}, return_document=ReturnDocument.AFTER)
    if not result:
        raise ApiError(404, "Sugerencia no encontrada")
    return {"suggestion": result}


@router.delete("/song-suggestions/{suggestion_id}")
async def delete_song_suggestion(suggestion_id: str):
    if not (await get_db().songSuggestions.delete_one({"id": suggestion_id})).deleted_count:
        raise ApiError(404, "Sugerencia no encontrada")
    return no_content()
