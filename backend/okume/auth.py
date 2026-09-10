import time
from collections import defaultdict, deque
from datetime import datetime, timedelta, timezone

import bcrypt
import jwt
from fastapi import Depends, Request

from .common import ApiError
from .config import JWT_SECRET
from .database import get_db

ISSUER = "okume-karaoke"


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except ValueError:
        return False


def create_token(user_id: str) -> str:
    now = datetime.now(timezone.utc)
    return jwt.encode({"sub": user_id, "iat": now, "exp": now + timedelta(hours=8), "iss": ISSUER}, JWT_SECRET, algorithm="HS256")


def client_ip(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for", "")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


class LoginLimiter:
    def __init__(self, limit: int = 12, window_seconds: int = 15 * 60):
        self.limit, self.window, self.hits = limit, window_seconds, defaultdict(deque)

    def check(self, key: str) -> None:
        now = time.monotonic()
        bucket = self.hits[key]
        while bucket and now - bucket[0] > self.window:
            bucket.popleft()
        if len(bucket) >= self.limit:
            raise ApiError(429, "Demasiados intentos. Inténtalo de nuevo en unos minutos")
        bucket.append(now)


login_limiter = LoginLimiter()


async def authenticate(request: Request) -> dict:
    header = request.headers.get("authorization", "")
    token = header[7:] if header.startswith("Bearer ") else ""
    if not token:
        raise ApiError(401, "Sesión requerida")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"], issuer=ISSUER)
    except jwt.PyJWTError:
        raise ApiError(401, "Sesión caducada o no válida")
    user = await get_db().users.find_one({"id": payload.get("sub"), "active": True}, {"_id": 0, "passwordHash": 0})
    if not user:
        raise ApiError(401, "Sesión no válida")
    return user


async def require_admin(user: dict = Depends(authenticate)) -> dict:
    if user.get("role") != "admin":
        raise ApiError(403, "Acceso denegado")
    return user
