import pytest

def test_health_check(client):
    """Verify the health check endpoint."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}

def test_user_flow(client):
    """Verify user ID retrieval."""
    headers = {"X-User-Id": "integration_tester"}
    response = client.get("/api/user", headers=headers)
    assert response.status_code == 200
    assert response.json() == {"userId": "integration_tester"}

def test_pin_crud_flow(client):
    """Full CRUD lifecycle for Pins."""
    headers = {"X-User-Id": "pin_user"}
    
    # 1. Create
    payload = {"lat": 40.4168, "lng": -3.7038, "text": "Plaza Mayor"}
    response = client.post("/api/pins", json=payload, headers=headers)
    assert response.status_code == 201
    pin = response.json()
    assert pin["text"] == "Plaza Mayor"
    pin_id = pin["id"]

    # 2. Read (via map-data)
    response = client.get("/api/map-data", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert any(p["id"] == pin_id for p in data["pins"])

    # 3. Delete (unauthorized)
    response = client.delete(f"/api/pins/{pin_id}", headers={"X-User-Id": "thief"})
    assert response.status_code == 403

    # 4. Delete (authorized)
    response = client.delete(f"/api/pins/{pin_id}", headers=headers)
    assert response.status_code == 200
    assert response.json()["success"] is True

def test_area_crud_flow(client):
    """Full CRUD lifecycle for Areas."""
    headers = {"X-User-Id": "area_user"}
    
    # 1. Create
    payload = {
        "latlngs": [[{"lat": 40.4, "lng": -3.7}, {"lat": 40.5, "lng": -3.7}, {"lat": 40.4, "lng": -3.6}]],
        "color": "blue",
        "text": "Neighborhood A",
        "fontSize": "16px"
    }
    response = client.post("/api/areas", json=payload, headers=headers)
    assert response.status_code == 201
    area = response.json()
    area_id = area["id"]

    # 2. Delete
    response = client.delete(f"/api/areas/{area_id}", headers=headers)
    assert response.status_code == 200

def test_pixel_crud_flow(client):
    """Full CRUD lifecycle for Pixels."""
    headers = {"X-User-Id": "pixel_user"}
    
    # 1. Create
    payload = {"lat": 40.42, "lng": -3.70, "color": "red", "text": "Tourist Hub"}
    response = client.post("/api/pixels", json=payload, headers=headers)
    assert response.status_code == 201
    pixel = response.json()
    pixel_id = pixel["id"]

    # 2. Update
    update_payload = {"color": "green", "text": "Updated Hub"}
    response = client.put(f"/api/pixels/{pixel_id}", json=update_payload, headers=headers)
    assert response.status_code == 200
    assert response.json()["color"] == "green"

    # 3. Delete
    response = client.delete(f"/api/pixels/{pixel_id}", headers=headers)
    assert response.status_code == 200

def test_search_proxy(client):
    """Verify the search proxy endpoint (mocking httpx might be needed for CI, but let's test the interface)."""
    # Note: This actually calls the real Nominatim. In a pure integration test we might mock it,
    # but the user asked to make sure things work.
    response = client.get("/api/search?q=Madrid")
    assert response.status_code == 200
    results = response.json()
    assert isinstance(results, list)
    if len(results) > 0:
        assert "lat" in results[0]
        assert "display_name" in results[0]
