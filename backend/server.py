"""Preview adapter: forwards the platform's port 8001 to the Express backend."""

from contextlib import asynccontextmanager
import asyncio
import os
from pathlib import Path
import subprocess

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, Request, Response


ROOT = Path(__file__).parent
load_dotenv(ROOT / ".env")
NODE_PORT = os.environ["NODE_PORT"]
NODE_URL = f"http://127.0.0.1:{NODE_PORT}"


@asynccontextmanager
async def lifespan(app: FastAPI):
    process = subprocess.Popen(["node", "server.js"], cwd=ROOT)
    app.state.node_process = process
    for _ in range(60):
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(f"{NODE_URL}/api/health", timeout=1)
                if response.status_code == 200:
                    break
        except httpx.HTTPError:
            await asyncio.sleep(0.25)
    yield
    process.terminate()
    try:
        process.wait(timeout=5)
    except subprocess.TimeoutExpired:
        process.kill()


app = FastAPI(lifespan=lifespan)


@app.api_route("/api/{path:path}", methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"])
async def proxy_api(path: str, request: Request):
    body = await request.body()
    headers = {key: value for key, value in request.headers.items() if key.lower() not in {"host", "content-length"}}
    async with httpx.AsyncClient(follow_redirects=True) as client:
        upstream = await client.request(
            request.method,
            f"{NODE_URL}/api/{path}",
            params=request.query_params,
            content=body,
            headers=headers,
            timeout=30,
        )
    response_headers = {
        key: value
        for key, value in upstream.headers.items()
        if key.lower() not in {"content-encoding", "content-length", "transfer-encoding", "connection"}
    }
    return Response(upstream.content, status_code=upstream.status_code, headers=response_headers)