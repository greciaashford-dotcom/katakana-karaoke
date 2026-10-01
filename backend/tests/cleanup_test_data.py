"""Cleanup utility for test-created admin data in preview environment."""

import os
from pathlib import Path

import requests


def load_base_url() -> str:
    env_value = os.environ.get("REACT_APP_BACKEND_URL", "").strip()
    if env_value:
        return env_value.rstrip("/")
    env_file = Path("/app/frontend/.env")
    for line in env_file.read_text(encoding="utf-8").splitlines():
        if line.startswith("REACT_APP_BACKEND_URL="):
            return line.split("=", 1)[1].strip().strip('"').rstrip("/")
    raise RuntimeError("REACT_APP_BACKEND_URL missing")


def main() -> None:
    base_url = load_base_url()
    session = requests.Session()
    login = session.post(
        f"{base_url}/api/auth/login",
        json={"email": "admin@karaokekatakana.com", "password": "KatakanaAdmin2026!"},
        timeout=30,
    )
    login.raise_for_status()
    token = login.json()["token"]
    headers = {"Authorization": f"Bearer {token}"}

    artists = session.get(f"{base_url}/api/admin/artists", headers=headers, timeout=30).json().get("items", [])
    for item in artists:
        if str(item.get("artist", "")).startswith("TEST Artist") or str(item.get("artist", "")).startswith("UI TEST ART"):
            session.delete(f"{base_url}/api/admin/artists/{item['id']}", headers=headers, timeout=30)

    gallery = session.get(f"{base_url}/api/admin/gallery", headers=headers, timeout=30).json().get("items", [])
    for item in gallery:
        url = str(item.get("imageUrl", ""))
        alt = str(item.get("alt", ""))
        if "example.com/test-" in url or "example.com/ui-test-" in url or alt.startswith("TEST") or alt.startswith("UI TEST"):
            session.delete(f"{base_url}/api/admin/gallery/{item['id']}", headers=headers, timeout=30)

    reservations = session.get(f"{base_url}/api/admin/reservations", headers=headers, timeout=30).json().get("items", [])
    for item in reservations:
        name = str(item.get("name", ""))
        if name.startswith("TEST Reserva") or name.startswith("UI TEST RES"):
            session.delete(f"{base_url}/api/admin/reservations/{item['id']}", headers=headers, timeout=30)

    print("Cleanup complete")


if __name__ == "__main__":
    main()
