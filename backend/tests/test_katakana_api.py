"""Backend regression tests for Karaoke Katakana API (iteration 5)."""
import io
import os
import uuid

import pytest
import requests

def _load_url():
    v = os.environ.get("REACT_APP_BACKEND_URL", "").strip()
    if v:
        return v.rstrip("/")
    for line in open("/app/frontend/.env").read().splitlines():
        if line.startswith("REACT_APP_BACKEND_URL="):
            return line.split("=", 1)[1].strip().rstrip("/")
    raise RuntimeError("no backend url")

BASE_URL = _load_url()
API = f"{BASE_URL}/api"
ADMIN_EMAIL = "admin@karaokekatakana.com"
ADMIN_PASSWORD = "KatakanaAdmin2026!"


@pytest.fixture(scope="session")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def admin_token(session):
    r = session.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, r.text
    return r.json()["token"]


@pytest.fixture(scope="session")
def admin(admin_token):
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json", "Authorization": f"Bearer {admin_token}"})
    return s


# ---- Public endpoints ----
class TestPublic:
    def test_health(self, session):
        r = session.get(f"{API}/health")
        assert r.status_code == 200
        assert r.json().get("ok") is True

    def test_site(self, session):
        r = session.get(f"{API}/site")
        assert r.status_code == 200
        data = r.json()
        assert "settings" in data and data["settings"]
        assert "songCount" in data
        # Expected catalog size around 20,714
        assert data["songCount"] > 20000

    def test_songs_search(self, session):
        r = session.get(f"{API}/songs", params={"q": "queen", "limit": 10})
        assert r.status_code == 200
        data = r.json()
        assert "items" in data
        assert len(data["items"]) > 0

    def test_songs_accent_insensitive(self, session):
        r = session.get(f"{API}/songs", params={"q": "rocio jurado", "limit": 5})
        assert r.status_code == 200
        items = r.json().get("items", [])
        # Should match Rocío Jurado (accent-insensitive)
        assert any("ROC" in (i.get("artist") or "").upper() for i in items), items[:3]

    def test_login_bad(self, session):
        r = session.post(f"{API}/auth/login", json={"email": "x@x.com", "password": "nope"})
        assert r.status_code == 401

    def test_login_ok(self, session):
        r = session.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        assert r.status_code == 200
        assert "token" in r.json()


# ---- Reservations ----
class TestReservations:
    def test_create_reservation(self, session):
        payload = {
            "name": "TEST_User", "people": 4, "date": "2026-12-20", "time": "22:00",
            "contact": "+34600000000", "email": "test_reserva@example.com",
            "notes": "TEST", "eventType": "cumpleanos", "consent": True,
        }
        r = session.post(f"{API}/reservations", json=payload)
        assert r.status_code == 201, r.text
        res = r.json()["reservation"]
        assert res["eventType"] == "cumpleanos"
        assert res["status"] == "pending"
        return res["id"]

    def test_reservation_requires_consent(self, session):
        r = session.post(f"{API}/reservations", json={
            "name": "TEST", "people": 2, "date": "2026-12-20", "time": "22:00",
            "contact": "+34600000000", "consent": False,
        })
        assert r.status_code == 400


# ---- Song requests + suggestions ----
class TestSongRequests:
    def test_song_request_requires_email(self, session):
        r = session.post(f"{API}/song-requests", json={"title": "Test", "artist": "A"})
        assert r.status_code == 400

    def test_song_request_create(self, session):
        r = session.post(f"{API}/song-requests", json={
            "email": "test_req@example.com", "name": "TEST", "title": "Bohemian Rhapsody", "artist": "Queen",
        })
        assert r.status_code == 201
        assert r.json()["request"]["title"]

    def test_song_suggestion_create(self, session):
        r = session.post(f"{API}/song-suggestions", json={
            "title": "TEST_Suggestion_" + uuid.uuid4().hex[:6], "artist": "TEST_Artist",
            "email": "test_sug@example.com", "name": "TEST",
        })
        assert r.status_code == 201
        return r.json()["suggestion"]["id"]


# ---- Admin ----
class TestAdmin:
    def test_stats(self, admin):
        r = admin.get(f"{API}/admin/stats")
        assert r.status_code == 200
        data = r.json()
        assert data["songs"] > 20000
        assert "suggestionsPending" in data

    def test_admin_requires_auth(self, session):
        r = session.get(f"{API}/admin/stats")
        assert r.status_code in (401, 403)

    def test_songs_crud(self, admin):
        # CREATE
        unique = uuid.uuid4().hex[:8].upper()
        payload = {"artist": f"TEST_ARTIST_{unique}", "title": f"TEST_SONG_{unique}", "code": f"T{unique}", "lang": "es"}
        r = admin.post(f"{API}/admin/songs", json=payload)
        assert r.status_code == 201, r.text
        song = r.json()["song"]
        sid = song["id"]
        # GET via admin list
        r = admin.get(f"{API}/admin/songs", params={"q": unique})
        assert r.status_code == 200
        assert any(s["id"] == sid for s in r.json()["items"])
        # UPDATE
        r = admin.put(f"{API}/admin/songs/{sid}", json={**payload, "title": f"TEST_SONG_UPD_{unique}"})
        assert r.status_code == 200
        assert "UPD" in r.json()["song"]["title"]
        # DELETE
        r = admin.delete(f"{API}/admin/songs/{sid}")
        assert r.status_code == 204
        # Verify gone
        r = admin.put(f"{API}/admin/songs/{sid}", json=payload)
        assert r.status_code == 404

    def test_songs_export(self, admin):
        r = admin.get(f"{API}/admin/songs/export")
        assert r.status_code == 200
        assert "spreadsheetml" in r.headers.get("content-type", "")
        assert len(r.content) > 1000

    def test_songs_import_merge(self, admin):
        # Build a minimal xlsx using openpyxl
        from openpyxl import Workbook
        wb = Workbook()
        ws = wb.active
        ws.append(["Artista", "Título", "Código", "Idioma"])
        unique = uuid.uuid4().hex[:8].upper()
        ws.append([f"TEST_IMP_{unique}", f"TEST_T_{unique}", f"C{unique}", "es"])
        buf = io.BytesIO(); wb.save(buf); buf.seek(0)
        # Multipart form; strip the json content-type
        headers = {k: v for k, v in admin.headers.items() if k.lower() != "content-type"}
        r = requests.post(
            f"{API}/admin/songs/import",
            headers=headers,
            data={"mode": "merge"},
            files={"file": ("import.xlsx", buf.read(), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")},
        )
        assert r.status_code == 200, r.text
        summary = r.json()
        assert summary["mode"] == "merge"
        assert summary["created"] + summary["updated"] + summary["unchanged"] >= 1
        # Cleanup imported song
        r2 = admin.get(f"{API}/admin/songs", params={"q": unique})
        for s in r2.json().get("items", []):
            if unique in (s.get("artist") or "") or unique in (s.get("title") or ""):
                admin.delete(f"{API}/admin/songs/{s['id']}")

    def test_settings_get_and_restore(self, admin, session):
        # Fetch current settings
        site = session.get(f"{API}/site").json()
        s = site["settings"]
        # Build update preserving current values
        payload = {
            "heroTitle": s.get("heroTitle") or "Karaoke Katakana",
            "heroDescription": s.get("heroDescription") or "Karaoke en Madrid",
            "heroVideoUrl": s.get("heroVideoUrl") or "",
            "heroImageUrl": s.get("heroImageUrl") or "https://example.com/img.jpg",
            "logoUrl": s.get("logoUrl") or "https://example.com/logo.png",
            "hours": s.get("hours") or [],
            "hoursNote": s.get("hoursNote") or "",
            "reservationHours": s.get("reservationHours") or "",
            "notice": s.get("notice") or "",
            "googleRating": s.get("googleRating") or "",
            "googleReviewCount": s.get("googleReviewCount") or "",
            "googleReviewsUrl": s.get("googleReviewsUrl") or "",
            "elfsightWidgetId": s.get("elfsightWidgetId") or "",
        }
        r = admin.put(f"{API}/admin/settings", json=payload)
        assert r.status_code == 200, r.text

    def test_suggestions_list(self, admin):
        r = admin.get(f"{API}/admin/song-suggestions", params={"status": "pending"})
        assert r.status_code == 200
        assert "items" in r.json()

    def test_reservations_list(self, admin):
        r = admin.get(f"{API}/admin/reservations")
        assert r.status_code == 200


# ---- Cleanup fixture ----
@pytest.fixture(scope="session", autouse=True)
def cleanup(request, admin_token):
    yield
    try:
        s = requests.Session()
        s.headers.update({"Authorization": f"Bearer {admin_token}"})
        # Cleanup TEST reservations
        r = s.get(f"{API}/admin/reservations")
        if r.ok:
            for res in r.json().get("items", []):
                if (res.get("name") or "").startswith("TEST"):
                    s.delete(f"{API}/admin/reservations/{res['id']}")
        # Cleanup TEST suggestions
        r = s.get(f"{API}/admin/song-suggestions")
        if r.ok:
            for sug in r.json().get("items", []):
                if "TEST" in (sug.get("title") or "") or "TEST" in (sug.get("artist") or ""):
                    s.delete(f"{API}/admin/song-suggestions/{sug['id']}")
    except Exception as e:
        print(f"cleanup error: {e}")
