import asyncio
import logging
import re
import uuid

from fastapi import APIRouter, Depends, File, Request, Response, UploadFile
from fastapi.responses import JSONResponse
from pymongo import ReturnDocument

from .auth import require_admin
from .common import ApiError, clean, is_email, madrid_date_key, now_iso, read_json, to_int
from .database import get_db
from .emails import build_client, next_followup_iso, send_campaign_email
from .excel_utils import build_clients_workbook, parse_clients_workbook

log = logging.getLogger("okume.admin")
router = APIRouter(dependencies=[Depends(require_admin)])
ALLOWED_STATUS = {"pending", "confirmed", "completed", "cancelled"}
XLSX_TYPE = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
MAX_UPLOAD = 8 * 1024 * 1024


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
    reservations, pending, artists, songs, clients, requests_today = await asyncio.gather(
        db.reservations.count_documents({}), db.reservations.count_documents({"status": "pending"}),
        db.artists.count_documents({}), db.songs.estimated_document_count(),
        db.clients.count_documents({}), db.songRequests.count_documents({"dateKey": today, "status": "queued"}),
    )
    return {"reservations": reservations, "pending": pending, "artists": artists, "songs": songs, "clients": clients, "requestsToday": requests_today}


@router.put("/settings")
async def update_settings(request: Request):
    body = await read_json(request)
    update = {
        "heroTitle": clean(body.get("heroTitle"), 140), "heroDescription": clean(body.get("heroDescription"), 240),
        "heroVideoUrl": clean(body.get("heroVideoUrl"), 1000), "heroImageUrl": clean(body.get("heroImageUrl"), 1000),
        "logoUrl": clean(body.get("logoUrl"), 1000), "updatedAt": now_iso(),
    }
    if not update["heroTitle"] or not update["heroDescription"] or not update["heroImageUrl"] or not update["logoUrl"]:
        raise ApiError(400, "Completa los campos obligatorios")
    db = get_db()
    await db.settings.update_one({"id": "main"}, {"$set": update})
    return {"settings": await db.settings.find_one({"id": "main"}, {"_id": 0})}


# ---- Artistas ----
def artist_payload(body: dict) -> dict:
    return {"artist": clean(body.get("artist"), 120), "song": clean(body.get("song"), 160), "description": clean(body.get("description"), 400), "imageUrl": clean(body.get("imageUrl"), 1000), "order": to_int(body.get("order"), 0) or 0}


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
    return Response(content=content, media_type=XLSX_TYPE, headers={"Content-Disposition": f'attachment; filename="okume-clientes-{madrid_date_key()}.xlsx"'})


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
    if not await send_campaign_email(get_db(), {"email": to, "name": "Equipo Okume"}, payload):
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
