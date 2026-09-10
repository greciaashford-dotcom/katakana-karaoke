"""Regression tests for iteration 2 features: clients, song-requests queue, campaigns, cron."""

import uuid
from datetime import datetime
from zoneinfo import ZoneInfo


def _madrid_today() -> str:
    return datetime.now(ZoneInfo("Europe/Madrid")).strftime("%Y-%m-%d")


# Public: POST /api/song-requests (validation + create + client upsert)
def test_song_request_invalid_email_rejected(api_client, base_url):
    resp = api_client.post(
        f"{base_url}/api/song-requests",
        json={"email": "not-an-email", "title": "Foo", "artist": "Bar"},
        timeout=30,
    )
    assert resp.status_code == 400


def test_song_request_missing_title_rejected(api_client, base_url):
    resp = api_client.post(
        f"{base_url}/api/song-requests",
        json={"email": f"TEST_{uuid.uuid4().hex[:8]}@example.com", "title": ""},
        timeout=30,
    )
    assert resp.status_code == 400


def test_song_request_creates_and_upserts_client(api_client, base_url, admin_headers):
    email = f"test_sr_{uuid.uuid4().hex[:10]}@example.com"
    payload = {"email": email, "name": "TEST User", "title": "Bohemian Rhapsody", "artist": "Queen", "songId": "abc"}
    resp = api_client.post(f"{base_url}/api/song-requests", json=payload, timeout=30)
    assert resp.status_code == 201
    data = resp.json()["request"]
    assert data["email"] == email
    assert data["title"] == "Bohemian Rhapsody"
    assert data["status"] == "queued"
    assert data["dateKey"] == _madrid_today()
    assert "_id" not in data
    request_id = data["id"]

    # Verify it appears in admin song-requests today
    q = api_client.get(f"{base_url}/api/admin/song-requests", headers=admin_headers, timeout=30)
    assert q.status_code == 200
    items = q.json()["items"]
    assert any(it["id"] == request_id for it in items)
    assert all("_id" not in it for it in items)

    # Verify client upsert
    c = api_client.get(f"{base_url}/api/admin/clients", headers=admin_headers, timeout=30)
    assert c.status_code == 200
    clients = c.json()["items"]
    match = next((cl for cl in clients if cl["email"] == email), None)
    assert match is not None
    assert "_id" not in match

    # Cleanup: mark played + undo, then delete; also delete client
    p = api_client.patch(
        f"{base_url}/api/admin/song-requests/{request_id}",
        headers=admin_headers,
        json={"status": "played"},
        timeout=30,
    )
    assert p.status_code == 200
    assert p.json()["request"]["status"] == "played"
    assert p.json()["request"]["playedAt"] is not None
    p2 = api_client.patch(
        f"{base_url}/api/admin/song-requests/{request_id}",
        headers=admin_headers,
        json={"status": "queued"},
        timeout=30,
    )
    assert p2.status_code == 200
    assert p2.json()["request"]["status"] == "queued"
    d = api_client.delete(f"{base_url}/api/admin/song-requests/{request_id}", headers=admin_headers, timeout=30)
    assert d.status_code == 204
    api_client.delete(f"{base_url}/api/admin/clients/{match['id']}", headers=admin_headers, timeout=30)


# Admin: stats now includes clients + requestsToday
def test_admin_stats_includes_new_fields(api_client, base_url, admin_headers):
    resp = api_client.get(f"{base_url}/api/admin/stats", headers=admin_headers, timeout=30)
    assert resp.status_code == 200
    data = resp.json()
    for key in ("reservations", "pending", "artists", "songs", "clients", "requestsToday"):
        assert key in data, f"stat {key} missing"
        assert isinstance(data[key], int)


# Admin: song-requests date filter
def test_admin_song_requests_date_filter(api_client, base_url, admin_headers):
    resp = api_client.get(
        f"{base_url}/api/admin/song-requests",
        params={"date": "2020-01-01"},
        headers=admin_headers,
        timeout=30,
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["date"] == "2020-01-01"
    assert isinstance(data["items"], list)


# Admin: campaigns are covered by test_iteration3_features.py (202 + async status poll, source-filtered audience)


def test_admin_campaign_requires_subject_and_message(api_client, base_url, admin_headers):
    resp = api_client.post(
        f"{base_url}/api/admin/campaigns",
        headers=admin_headers,
        json={"subject": "", "message": ""},
        timeout=30,
    )
    assert resp.status_code == 400


# Cron follow-up requires bearer secret
def test_cron_followup_unauthorized_without_bearer(api_client, base_url):
    resp = api_client.post(f"{base_url}/api/cron/followup", timeout=30)
    assert resp.status_code == 401


# Reservation with email upserts client
def test_reservation_with_email_upserts_client(api_client, base_url, admin_headers):
    email = f"test_res_{uuid.uuid4().hex[:10]}@example.com"
    payload = {
        "name": "TEST Reserva",
        "people": 2,
        "date": "2030-12-31",
        "time": "22:00",
        "contact": "600000000",
        "email": email,
        "notes": "TEST",
    }
    resp = api_client.post(f"{base_url}/api/reservations", json=payload, timeout=30)
    assert resp.status_code == 201
    reservation = resp.json()["reservation"]
    assert reservation["email"] == email
    assert "_id" not in reservation

    c = api_client.get(f"{base_url}/api/admin/clients", headers=admin_headers, timeout=30)
    clients = c.json()["items"]
    match = next((cl for cl in clients if cl["email"] == email), None)
    assert match is not None

    # cleanup
    api_client.delete(f"{base_url}/api/admin/reservations/{reservation['id']}", headers=admin_headers, timeout=30)
    api_client.delete(f"{base_url}/api/admin/clients/{match['id']}", headers=admin_headers, timeout=30)
