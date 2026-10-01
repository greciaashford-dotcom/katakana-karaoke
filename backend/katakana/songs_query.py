"""Búsqueda del catálogo compartida por la web pública y el panel."""

import re
import time

from .catalog import LANG_LABEL, LANGUAGES, OTHER_LANG, search_text, search_tokens
from .common import clean, to_int

SORTS = {
    "artist": {"artistKey": 1, "titleKey": 1},
    "title": {"titleKey": 1, "artistKey": 1},
    "new": {"sourceId": -1},
}
PROJECTION = {"_id": 0, "search": 0, "artistKey": 0, "titleKey": 0, "codeKey": 0}


def build_criteria(params, *, include_lang: bool = True) -> tuple[dict, str]:
    q = clean(params.get("q"), 120)
    artist = clean(params.get("artist"), 160)
    lang = clean(params.get("lang"), 4).lower()
    criteria: dict = {}
    if artist:
        criteria["artistKey"] = search_text(artist)
    tokens = search_tokens(q)
    if tokens:
        criteria["$and"] = [{"search": {"$regex": re.escape(token)}} for token in tokens]
    if include_lang and (lang in LANG_LABEL or lang == OTHER_LANG[0]):
        criteria["lang"] = lang
    return criteria, " ".join(tokens)


def relevance_stage(normalized: str) -> dict:
    compact = normalized.replace(" ", "")
    prefix = f"^{re.escape(normalized)}"
    return {"$addFields": {"_score": {"$add": [
        {"$cond": [{"$eq": ["$codeKey", compact]}, 8, 0]},
        {"$cond": [{"$eq": ["$artistKey", normalized]}, 5, 0]},
        {"$cond": [{"$eq": ["$titleKey", normalized]}, 4, 0]},
        {"$cond": [{"$regexMatch": {"input": "$artistKey", "regex": prefix}}, 2, 0]},
        {"$cond": [{"$regexMatch": {"input": "$titleKey", "regex": prefix}}, 1, 0]},
    ]}}}


async def search_songs(db, params, *, default_limit: int = 30, max_limit: int = 60, with_facets: bool = True) -> dict:
    criteria, normalized = build_criteria(params)
    page = max(1, to_int(params.get("page"), 1) or 1)
    limit = min(max_limit, max(6, to_int(params.get("limit"), default_limit) or default_limit))
    sort_key = clean(params.get("sort"), 12)
    if sort_key not in SORTS and sort_key != "relevance":
        sort_key = "relevance" if normalized else "artist"
    if sort_key == "relevance" and not normalized:
        sort_key = "artist"
    pipeline: list[dict] = [{"$match": criteria}]
    if sort_key == "relevance":
        pipeline += [relevance_stage(normalized), {"$sort": {"_score": -1, "artistKey": 1, "titleKey": 1}}]
    else:
        pipeline.append({"$sort": SORTS[sort_key]})
    pipeline += [{"$skip": (page - 1) * limit}, {"$limit": limit}, {"$project": {**PROJECTION, "_score": 0}}]
    items = await db.songs.aggregate(pipeline).to_list(length=limit)
    total = await db.songs.count_documents(criteria)
    result = {"items": items, "total": total, "page": page, "pages": max(1, -(-total // limit)), "limit": limit, "sort": sort_key}
    if with_facets:
        facet_criteria, _ = build_criteria(params, include_lang=False)
        counts = {row["_id"]: row["count"] async for row in db.songs.aggregate([{"$match": facet_criteria}, {"$group": {"_id": "$lang", "count": {"$sum": 1}}}])}
        result["languages"] = language_rows(counts)
    return result


def language_rows(counts: dict) -> list[dict]:
    rows = [{"lang": key, "label": label, "count": counts.get(key, 0)} for key, label, _ in LANGUAGES]
    if counts.get(OTHER_LANG[0]):
        rows.append({"lang": OTHER_LANG[0], "label": OTHER_LANG[1], "count": counts[OTHER_LANG[0]]})
    return rows


# ---- Estadísticas del catálogo (cacheadas; se invalidan al editar desde el panel) ----
_stats_cache: dict = {"value": None, "at": 0.0}


def invalidate_catalog_stats() -> None:
    _stats_cache["value"] = None


async def catalog_stats(db) -> dict:
    cached = _stats_cache["value"]
    if cached and time.monotonic() - _stats_cache["at"] < 600:
        return cached
    counts = {row["_id"]: row["count"] async for row in db.songs.aggregate([{"$group": {"_id": "$lang", "count": {"$sum": 1}}}])}
    artists = len(await db.songs.distinct("artistKey"))
    total = sum(counts.values())
    value = {"songs": total, "artists": artists, "languages": [row for row in language_rows(counts) if row["count"] > 0]}
    if total:
        _stats_cache.update(value=value, at=time.monotonic())
    return value
