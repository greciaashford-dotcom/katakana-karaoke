import os
from pathlib import Path

from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parent.parent
load_dotenv(ROOT / ".env")


def required(name: str) -> str:
    value = os.environ.get(name)
    if not value:
        raise RuntimeError(f"Falta la variable {name}")
    return value


MONGO_URL = required("MONGO_URL")
DB_NAME = required("DB_NAME")
JWT_SECRET = required("JWT_SECRET")
ADMIN_EMAIL = required("ADMIN_EMAIL").lower()
ADMIN_PASSWORD_HASH = required("ADMIN_PASSWORD_HASH")
CORS_ORIGINS = required("CORS_ORIGINS")
PUBLIC_SITE_URL = required("PUBLIC_SITE_URL").rstrip("/")
OWNER_EMAIL = os.environ.get("OWNER_EMAIL", "").strip().lower()
RESEND_API_KEY = os.environ.get("RESEND_API_KEY", "").strip()
SENDER_EMAIL = required("SENDER_EMAIL") if RESEND_API_KEY else ""
WEBHOOK_CRON_SECRET = os.environ.get("WEBHOOK_CRON_SECRET", "").strip()
DATA_DIR = ROOT / "data"
