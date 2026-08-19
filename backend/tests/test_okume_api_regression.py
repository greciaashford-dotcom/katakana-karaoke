"""Regression tests for critical public/admin flows in Okume Karaoke API."""

import uuid


# Public module checks: health, site payload, songs, reservation create/delete
def test_health_ok(api_client, base_url):
    response = api_client.get(f"{base_url}/api/health", timeout=30)
    assert response.status_code == 200
    data = response.json()
    assert data == {"ok": True, "service": "okume-express"}


def test_site_payload_and_no_mongo_id_fields(api_client, base_url):
    response = api_client.get(f"{base_url}/api/site", timeout=30)
    assert response.status_code == 200
    data = response.json()

    assert data["settings"]["heroTitle"] == "El karaoke más exclusivo de Madrid te espera"
    assert data["settings"]["heroDescription"] == "Brilla como una estrella en Okume"
    assert len(data["artists"]) == 25
    assert len(data["gallery"]) == 9
    assert data["songCount"] >= 88770
    assert "_id" not in data["settings"]
    assert all("_id" not in item for item in data["artists"])
    assert all("_id" not in item for item in data["gallery"])


def test_songs_search_queen_bohemian(api_client, base_url):
    response = api_client.get(
        f"{base_url}/api/songs",
        params={"q": "Queen Bohemian Rhapsody", "page": 1, "limit": 30},
        timeout=30,
    )
    assert response.status_code == 200
    data = response.json()
    assert data["total"] > 0
    assert isinstance(data["items"], list)
    match_found = any(item["artist"] == "Queen" and "Bohemian Rhapsody" in item["title"] for item in data["items"])
    assert match_found


def test_songs_pagination_structure(api_client, base_url):
    response = api_client.get(
        f"{base_url}/api/songs",
        params={"q": "", "page": 2, "limit": 30},
        timeout=30,
    )
    assert response.status_code == 200
    data = response.json()
    assert data["page"] == 2
    assert data["pages"] >= 2
    assert len(data["items"]) > 0
    assert all("_id" not in item for item in data["items"])


# Auth/admin module checks: login valid/invalid, admin protection and CRUD controls
def test_admin_route_denies_anonymous(api_client, base_url):
    response = api_client.get(f"{base_url}/api/admin/stats", timeout=30)
    assert response.status_code == 401
    assert "error" in response.json()


def test_login_invalid_credentials(api_client, base_url):
    response = api_client.post(
        f"{base_url}/api/auth/login",
        json={"email": "admin@okumekaraoke.com", "password": "wrong-password"},
        timeout=30,
    )
    assert response.status_code == 401
    assert "error" in response.json()


def test_login_valid_and_auth_me(api_client, base_url, admin_token):
    me_response = api_client.get(
        f"{base_url}/api/auth/me",
        headers={"Authorization": f"Bearer {admin_token}"},
        timeout=30,
    )
    assert me_response.status_code == 200
    data = me_response.json()
    assert data["user"]["email"] == "admin@okumekaraoke.com"
    assert data["user"]["role"] == "admin"
    assert "_id" not in data["user"]


def test_admin_stats_structure(api_client, base_url, admin_headers):
    response = api_client.get(f"{base_url}/api/admin/stats", headers=admin_headers, timeout=30)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data["reservations"], int)
    assert isinstance(data["pending"], int)
    assert isinstance(data["artists"], int)
    assert isinstance(data["songs"], int)


def test_admin_settings_update_and_revert(api_client, base_url, admin_headers):
    site_before = api_client.get(f"{base_url}/api/site", timeout=30).json()["settings"]
    marker = f" TEST {uuid.uuid4().hex[:6]}"
    update_payload = {
        "heroTitle": site_before["heroTitle"],
        "heroDescription": f"{site_before['heroDescription']}{marker}",
        "heroVideoUrl": site_before.get("heroVideoUrl", ""),
        "heroImageUrl": site_before["heroImageUrl"],
        "logoUrl": site_before["logoUrl"],
    }
    update_response = api_client.put(
        f"{base_url}/api/admin/settings",
        json=update_payload,
        headers=admin_headers,
        timeout=30,
    )
    assert update_response.status_code == 200
    updated_settings = update_response.json()["settings"]
    assert updated_settings["heroDescription"].endswith(marker)

    revert_response = api_client.put(
        f"{base_url}/api/admin/settings",
        json={
            "heroTitle": site_before["heroTitle"],
            "heroDescription": site_before["heroDescription"],
            "heroVideoUrl": site_before.get("heroVideoUrl", ""),
            "heroImageUrl": site_before["heroImageUrl"],
            "logoUrl": site_before["logoUrl"],
        },
        headers=admin_headers,
        timeout=30,
    )
    assert revert_response.status_code == 200
    reverted = revert_response.json()["settings"]
    assert reverted["heroDescription"] == site_before["heroDescription"]


def test_admin_gallery_add_and_delete(api_client, base_url, admin_headers):
    image_url = f"https://example.com/test-{uuid.uuid4().hex[:8]}.jpg"
    create_response = api_client.post(
        f"{base_url}/api/admin/gallery",
        json={"imageUrl": image_url, "alt": "TEST image", "order": 999},
        headers=admin_headers,
        timeout=30,
    )
    assert create_response.status_code == 201
    created = create_response.json()["item"]
    item_id = created["id"]
    assert created["imageUrl"] == image_url
    assert "_id" not in created

    list_response = api_client.get(f"{base_url}/api/admin/gallery", headers=admin_headers, timeout=30)
    assert list_response.status_code == 200
    listed = list_response.json()["items"]
    assert any(item["id"] == item_id for item in listed)

    delete_response = api_client.delete(f"{base_url}/api/admin/gallery/{item_id}", headers=admin_headers, timeout=30)
    assert delete_response.status_code == 204


def test_admin_artist_add_edit_delete(api_client, base_url, admin_headers):
    create_payload = {
        "artist": f"TEST Artist {uuid.uuid4().hex[:6]}",
        "song": "TEST Song",
        "description": "TEST Description",
        "imageUrl": "https://example.com/test-cover.jpg",
        "order": 999,
    }
    create_response = api_client.post(
        f"{base_url}/api/admin/artists",
        json=create_payload,
        headers=admin_headers,
        timeout=30,
    )
    assert create_response.status_code == 201
    created = create_response.json()["artist"]
    artist_id = created["id"]
    assert created["artist"] == create_payload["artist"]
    assert "_id" not in created

    update_response = api_client.put(
        f"{base_url}/api/admin/artists/{artist_id}",
        json={**create_payload, "artist": f"{create_payload['artist']} Updated"},
        headers=admin_headers,
        timeout=30,
    )
    assert update_response.status_code == 200
    updated = update_response.json()["artist"]
    assert updated["artist"].endswith("Updated")

    delete_response = api_client.delete(f"{base_url}/api/admin/artists/{artist_id}", headers=admin_headers, timeout=30)
    assert delete_response.status_code == 204


def test_reservation_create_update_status_and_delete(api_client, base_url, admin_headers):
    reservation_payload = {
        "name": f"TEST Reserva {uuid.uuid4().hex[:6]}",
        "people": 4,
        "date": "2026-12-20",
        "time": "22:00",
        "contact": "test@example.com",
        "notes": "Reserva de prueba",
    }
    create_response = api_client.post(f"{base_url}/api/reservations", json=reservation_payload, timeout=30)
    assert create_response.status_code == 201
    created = create_response.json()["reservation"]
    reservation_id = created["id"]
    assert created["name"] == reservation_payload["name"]
    assert created["status"] == "pending"
    assert "_id" not in created

    patch_response = api_client.patch(
        f"{base_url}/api/admin/reservations/{reservation_id}",
        json={"status": "confirmed"},
        headers=admin_headers,
        timeout=30,
    )
    assert patch_response.status_code == 200
    patched = patch_response.json()["reservation"]
    assert patched["status"] == "confirmed"

    delete_response = api_client.delete(
        f"{base_url}/api/admin/reservations/{reservation_id}",
        headers=admin_headers,
        timeout=30,
    )
    assert delete_response.status_code == 204

    list_response = api_client.get(f"{base_url}/api/admin/reservations", headers=admin_headers, timeout=30)
    assert list_response.status_code == 200
    items = list_response.json()["items"]
    assert all(item["id"] != reservation_id for item in items)
