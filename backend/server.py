"""Okume Karaoke API — FastAPI + MongoDB (single Python process, no Node runtime required)."""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from okume import database
from okume.common import ApiError
from okume.config import CORS_ORIGINS
from okume.routes_admin import router as admin_router
from okume.routes_public import router as public_router
from okume.seed import seed_database

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(name)s: %(message)s")
log = logging.getLogger("okume")


@asynccontextmanager
async def lifespan(_app: FastAPI):
    db = database.connect()
    await seed_database(db)
    log.info("Okume API lista")
    yield
    database.close()


app = FastAPI(title="Okume Karaoke API", lifespan=lifespan, docs_url=None, redoc_url=None, openapi_url=None)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if CORS_ORIGINS == "*" else [origin.strip() for origin in CORS_ORIGINS.split(",")],
    allow_credentials=False, allow_methods=["*"], allow_headers=["*"],
)
app.include_router(public_router, prefix="/api")
app.include_router(admin_router, prefix="/api/admin")


@app.get("/health")
async def root_health():
    return {"ok": True, "service": "okume-api"}


@app.exception_handler(ApiError)
async def api_error_handler(_request: Request, error: ApiError):
    return JSONResponse({"error": error.message}, status_code=error.status)


@app.exception_handler(StarletteHTTPException)
async def http_error_handler(_request: Request, error: StarletteHTTPException):
    return JSONResponse({"error": error.detail if isinstance(error.detail, str) else "Recurso no encontrado"}, status_code=error.status_code)


@app.exception_handler(RequestValidationError)
async def validation_error_handler(_request: Request, _error: RequestValidationError):
    return JSONResponse({"error": "Datos no válidos"}, status_code=400)


@app.exception_handler(Exception)
async def unexpected_error_handler(_request: Request, error: Exception):
    log.exception("Error inesperado: %s", error)
    return JSONResponse({"error": "Ha ocurrido un error inesperado"}, status_code=500)
