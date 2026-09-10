import asyncio
import json
import logging
import uuid
from datetime import timedelta

from pymongo import ASCENDING, DESCENDING
from pymongo.errors import BulkWriteError

from .common import now_iso, parse_iso, to_iso
from .config import ADMIN_EMAIL, ADMIN_PASSWORD_HASH, DATA_DIR, OWNER_EMAIL
from .defaults import ARTISTS, GALLERY_URLS, default_settings
from .emails import FOLLOWUP_HOURS

log = logging.getLogger("okume.seed")


async def migrate_clients(db) -> None:
    clients = db.clients
    await clients.update_many({"subscribed": {"$exists": False}}, {"$set": {"subscribed": True, "unsubscribedAt": None}})
    legacy = await clients.find({"$or": [{"unsubscribeToken": {"$exists": False}}, {"nextFollowupAt": {"$exists": False}}]}).to_list(length=None)
    for c in legacy:
        base = c.get("followupSentAt") or c.get("welcomeSentAt") or c.get("createdAt") or now_iso()
        next_followup = None if c.get("subscribed") is False else to_iso(parse_iso(base) + timedelta(hours=FOLLOWUP_HOURS))
        await clients.update_one({"id": c["id"]}, {"$set": {
            "unsubscribeToken": c.get("unsubscribeToken") or str(uuid.uuid4()),
            "nextFollowupAt": c.get("nextFollowupAt") or next_followup,
            "lastFollowupAt": c.get("lastFollowupAt") or c.get("followupSentAt"), "lastEmailAt": c.get("lastEmailAt") or c.get("followupSentAt") or c.get("welcomeSentAt"),
            "followupCount": c.get("followupCount") or (1 if c.get("followupSentAt") else 0), "phone": c.get("phone") or "", "notes": c.get("notes") or "",
        }})


async def seed_admin(db, user_id: str, email: str) -> None:
    await db.users.update_one(
        {"email": email},
        {"$setOnInsert": {"id": user_id, "email": email, "passwordHash": ADMIN_PASSWORD_HASH, "role": "admin", "active": True, "createdAt": now_iso()}},
        upsert=True,
    )


async def seed_songs(db) -> None:
    if await db.songs.estimated_document_count() > 0:
        return
    log.info("[seed] cargando catálogo de canciones…")
    songs = json.loads((DATA_DIR / "songs.json").read_text(encoding="utf-8"))
    for index in range(0, len(songs), 5000):
        try:
            await db.songs.insert_many(songs[index:index + 5000], ordered=False)
        except BulkWriteError as error:
            log.warning("[seed] lote de canciones con avisos: %s", error.details.get("nInserted"))
    log.info("[seed] catálogo cargado: %s canciones", len(songs))


async def seed_database(db) -> None:
    await asyncio.gather(
        db.users.create_index([("email", ASCENDING)], unique=True),
        db.songs.create_index([("search", ASCENDING)]),
        db.reservations.create_index([("createdAt", DESCENDING)]),
        db.clients.create_index([("email", ASCENDING)], unique=True),
        db.clients.create_index([("unsubscribeToken", ASCENDING)]),
        db.clients.create_index([("subscribed", ASCENDING), ("nextFollowupAt", ASCENDING)]),
        db.songRequests.create_index([("dateKey", ASCENDING), ("createdAt", ASCENDING)]),
    )
    await migrate_clients(db)
    await seed_admin(db, "admin-primary", ADMIN_EMAIL)
    if OWNER_EMAIL and OWNER_EMAIL != ADMIN_EMAIL:
        await seed_admin(db, "admin-owner", OWNER_EMAIL)
    await db.settings.update_one({"id": "main"}, {"$setOnInsert": default_settings()}, upsert=True)
    if await db.artists.estimated_document_count() == 0:
        await db.artists.insert_many([dict(a) for a in ARTISTS])
    if await db.gallery.estimated_document_count() == 0:
        await db.gallery.insert_many([{"id": f"gallery-{order + 1}", "imageUrl": url, "alt": f"Noche en Okume Karaoke {order + 1}", "order": order} for order, url in enumerate(GALLERY_URLS)])
    # Song catalogue is large: load it in the background so the API becomes ready immediately.
    asyncio.create_task(seed_songs(db))
