import asyncio
import json
import logging
import uuid
from datetime import timedelta

from pymongo import ASCENDING, DESCENDING
from pymongo.errors import BulkWriteError

from .catalog import CATALOG_VERSION
from .common import now_iso, parse_iso, to_iso
from .config import ADMIN_EMAIL, ADMIN_PASSWORD_HASH, DATA_DIR, OWNER_EMAIL
from .defaults import ARTISTS, GALLERY, default_settings
from .emails import FOLLOWUP_HOURS
from .songs_query import invalidate_catalog_stats

log = logging.getLogger("katakana.seed")


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


async def seed_settings(db) -> None:
    defaults = default_settings()
    current = await db.settings.find_one({"id": "main"}, {"_id": 0})
    if not current:
        await db.settings.insert_one(dict(defaults))
        return
    missing = {key: value for key, value in defaults.items() if key not in current}
    if missing:
        await db.settings.update_one({"id": "main"}, {"$set": missing})


async def seed_songs(db) -> None:
    """Carga el catálogo de Katakana. Si el panel ya gestiona el catálogo, nunca se sobrescribe."""
    meta = await db.meta.find_one({"id": "catalog"}, {"_id": 0})
    count = await db.songs.estimated_document_count()
    if meta and (meta.get("managed") or (meta.get("version") == CATALOG_VERSION and count > 0)):
        return
    log.info("[seed] cargando catálogo de canciones Katakana…")
    songs = json.loads((DATA_DIR / "songs.json").read_text(encoding="utf-8"))
    if count:
        await db.songs.delete_many({})
    for index in range(0, len(songs), 5000):
        try:
            await db.songs.insert_many(songs[index:index + 5000], ordered=False)
        except BulkWriteError as error:
            log.warning("[seed] lote de canciones con avisos: %s", error.details.get("nInserted"))
    await db.meta.update_one({"id": "catalog"}, {"$set": {"version": CATALOG_VERSION, "managed": False, "loadedAt": now_iso()}}, upsert=True)
    invalidate_catalog_stats()
    log.info("[seed] catálogo cargado: %s canciones", len(songs))


async def seed_database(db) -> None:
    await asyncio.gather(
        db.users.create_index([("email", ASCENDING)], unique=True),
        db.songs.create_index([("id", ASCENDING)], unique=True),
        db.songs.create_index([("artistKey", ASCENDING), ("titleKey", ASCENDING)]),
        db.songs.create_index([("titleKey", ASCENDING)]),
        db.songs.create_index([("lang", ASCENDING)]),
        db.songs.create_index([("sourceId", DESCENDING)]),
        db.songs.create_index([("codeKey", ASCENDING)]),
        db.reservations.create_index([("createdAt", DESCENDING)]),
        db.clients.create_index([("email", ASCENDING)], unique=True),
        db.clients.create_index([("unsubscribeToken", ASCENDING)]),
        db.clients.create_index([("subscribed", ASCENDING), ("nextFollowupAt", ASCENDING)]),
        db.songRequests.create_index([("dateKey", ASCENDING), ("createdAt", ASCENDING)]),
        db.songSuggestions.create_index([("createdAt", DESCENDING)]),
    )
    await migrate_clients(db)
    await seed_admin(db, "admin-primary", ADMIN_EMAIL)
    if OWNER_EMAIL and OWNER_EMAIL != ADMIN_EMAIL:
        await seed_admin(db, "admin-owner", OWNER_EMAIL)
    await seed_settings(db)
    if await db.artists.estimated_document_count() == 0:
        await db.artists.insert_many([dict(a) for a in ARTISTS])
    if await db.gallery.estimated_document_count() == 0:
        await db.gallery.insert_many([{"id": f"gallery-{order + 1}", "imageUrl": url, "alt": alt, "order": order} for order, (url, alt) in enumerate(GALLERY)])
    # El catálogo es grande: se carga en segundo plano para que la API esté lista al instante.
    asyncio.create_task(seed_songs(db))
