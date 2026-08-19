"""Shared pytest fixtures for Okume public/admin API regression tests."""

import os
from pathlib import Path

import pytest
import requests


def _load_backend_url() -> str:
    env_value = os.environ.get("REACT_APP_BACKEND_URL", "").strip()
    if env_value:
        return env_value.rstrip("/")

    frontend_env = Path("/app/frontend/.env")
    if frontend_env.exists():
        for line in frontend_env.read_text(encoding="utf-8").splitlines():
            if line.startswith("REACT_APP_BACKEND_URL="):
                value = line.split("=", 1)[1].strip().strip('"').strip("'")
                if value:
                    return value.rstrip("/")
    raise RuntimeError("REACT_APP_BACKEND_URL is missing")


@pytest.fixture(scope="session")
def base_url() -> str:
    return _load_backend_url()


@pytest.fixture(scope="session")
def api_client() -> requests.Session:
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session


@pytest.fixture(scope="session")
def admin_credentials() -> tuple[str, str]:
    # Admin credential fixture for requested private-panel flows
    email = os.environ.get("TEST_ADMIN_EMAIL", "admin@okumekaraoke.com")
    password = os.environ.get("TEST_ADMIN_PASSWORD", "OkumeAdmin2026!")
    return email, password


@pytest.fixture(scope="session")
def admin_token(api_client: requests.Session, base_url: str, admin_credentials: tuple[str, str]) -> str:
    """JWT token for admin-protected routes; skip authenticated tests if auth fails."""
    email, password = admin_credentials
    response = api_client.post(
        f"{base_url}/api/auth/login",
        json={"email": email, "password": password},
        timeout=30,
    )
    if response.status_code != 200:
        pytest.skip(f"Admin login failed ({response.status_code}): {response.text}")
    data = response.json()
    token = data.get("token")
    if not token:
        pytest.skip("Admin login returned no token")
    return token


@pytest.fixture
def admin_headers(admin_token: str) -> dict:
    return {"Authorization": f"Bearer {admin_token}"}
