from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from .config import DB_NAME, MONGO_URL

_client: AsyncIOMotorClient | None = None


def connect() -> AsyncIOMotorDatabase:
    global _client
    _client = AsyncIOMotorClient(MONGO_URL)
    return _client[DB_NAME]


def get_db() -> AsyncIOMotorDatabase:
    if _client is None:
        raise RuntimeError("Base de datos no inicializada")
    return _client[DB_NAME]


def close() -> None:
    if _client is not None:
        _client.close()
