import json
import re
import unicodedata
from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo

from fastapi import Request

EMAIL_RE = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")
MADRID = ZoneInfo("Europe/Madrid")


class ApiError(Exception):
    def __init__(self, status: int, message: str):
        super().__init__(message)
        self.status = status
        self.message = message


def clean(value, limit: int | None = None) -> str:
    text = "" if value is None else str(value).strip()
    return text[:limit] if limit else text


def is_email(value: str) -> bool:
    return bool(EMAIL_RE.match(value or ""))


def to_iso(dt: datetime) -> str:
    dt = dt.astimezone(timezone.utc)
    return dt.strftime("%Y-%m-%dT%H:%M:%S.") + f"{dt.microsecond // 1000:03d}Z"


def now_iso() -> str:
    return to_iso(datetime.now(timezone.utc))


def iso_after(hours: float, start: datetime | None = None) -> str:
    return to_iso((start or datetime.now(timezone.utc)) + timedelta(hours=hours))


def parse_iso(value: str) -> datetime:
    return datetime.fromisoformat(value.replace("Z", "+00:00"))


def madrid_date_key(dt: datetime | None = None) -> str:
    return (dt or datetime.now(timezone.utc)).astimezone(MADRID).strftime("%Y-%m-%d")


def normalize(value: str) -> str:
    decomposed = unicodedata.normalize("NFKD", value)
    return "".join(ch for ch in decomposed if not unicodedata.combining(ch)).lower()


def to_int(value, default=None):
    try:
        return int(value)
    except (TypeError, ValueError):
        return default


async def read_json(request: Request) -> dict:
    try:
        data = await request.json()
    except (json.JSONDecodeError, ValueError):
        return {}
    return data if isinstance(data, dict) else {}


def mask_email(email: str) -> str:
    user, _, domain = email.partition("@")
    return f"{user[:2]}{'•' * max(2, len(user) - 2)}@{domain}"
