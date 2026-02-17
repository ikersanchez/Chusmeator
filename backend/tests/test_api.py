import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.database import Base, get_db

# Use SQLite for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}

def test_get_user_id():
    user_id = "test_user_123"
    response = client.get("/api/user", headers={"X-User-Id": user_id})
    assert response.status_code == 200
    assert response.json() == {"userId": user_id}

def test_pin_crud():
    user_id = "test_user_pin"
    headers = {"X-User-Id": user_id}
    
    # Create pin
    pin_data = {"lat": 40.0, "lng": -3.0, "text": "Test Pin"}
    response = client.post("/api/pins", json=pin_data, headers=headers)
    assert response.status_code == 201
    pin = response.json()
    assert pin["text"] == "Test Pin"
    assert pin["userId"] == user_id
    pin_id = pin["id"]
    
    # Get map data
    response = client.get("/api/map-data", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data["pins"]) == 1
    assert data["pins"][0]["id"] == pin_id
    
    # Delete pin (unauthorized)
    response = client.delete(f"/api/pins/{pin_id}", headers={"X-User-Id": "other_user"})
    assert response.status_code == 403
    
    # Delete pin (authorized)
    response = client.delete(f"/api/pins/{pin_id}", headers=headers)
    assert response.status_code == 200
    assert response.json() == {"success": True}

def test_pixel_crud():
    user_id = "test_user_pixel"
    headers = {"X-User-Id": user_id}
    
    # Create pixel
    pixel_data = {"lat": 40.1, "lng": -3.1, "color": "red", "text": "Test Pixel"}
    response = client.post("/api/pixels", json=pixel_data, headers=headers)
    assert response.status_code == 201
    pixel = response.json()
    pixel_id = pixel["id"]
    
    # Update pixel
    update_data = {"color": "green", "text": "Updated"}
    response = client.put(f"/api/pixels/{pixel_id}", json=update_data, headers=headers)
    assert response.status_code == 200
    updated = response.json()
    assert updated["color"] == "green"
    assert updated["text"] == "Updated"
    
    # Delete pixel
    response = client.delete(f"/api/pixels/{pixel_id}", headers=headers)
    assert response.status_code == 200

def test_vote_on_pin():
    user_id = "test_user_vote"
    headers = {"X-User-Id": user_id}

    # Create a pin to vote on
    pin_data = {"lat": 40.0, "lng": -3.0, "text": "Votable Pin"}
    response = client.post("/api/pins", json=pin_data, headers=headers)
    assert response.status_code == 201
    pin_id = response.json()["id"]

    # Vote on pin
    vote_data = {"targetType": "pin", "targetId": pin_id}
    response = client.post("/api/votes", json=vote_data, headers=headers)
    assert response.status_code == 201
    vote = response.json()
    assert vote["targetType"] == "pin"
    assert vote["targetId"] == pin_id
    assert vote["userId"] == user_id

    # Verify vote count in map-data
    response = client.get("/api/map-data", headers=headers)
    assert response.status_code == 200
    data = response.json()
    voted_pin = next(p for p in data["pins"] if p["id"] == pin_id)
    assert voted_pin["votes"] == 1
    assert voted_pin["userVoted"] is True

    # Duplicate vote should fail with 409
    response = client.post("/api/votes", json=vote_data, headers=headers)
    assert response.status_code == 409

    # Another user should see userVoted=False
    other_headers = {"X-User-Id": "other_user_vote"}
    response = client.get("/api/map-data", headers=other_headers)
    data = response.json()
    voted_pin = next(p for p in data["pins"] if p["id"] == pin_id)
    assert voted_pin["votes"] == 1
    assert voted_pin["userVoted"] is False

    # Unvote
    response = client.delete(f"/api/votes/pin/{pin_id}", headers=headers)
    assert response.status_code == 200

    # Verify vote removed
    response = client.get("/api/map-data", headers=headers)
    data = response.json()
    voted_pin = next(p for p in data["pins"] if p["id"] == pin_id)
    assert voted_pin["votes"] == 0
    assert voted_pin["userVoted"] is False

def test_vote_on_area():
    user_id = "test_user_area_vote"
    headers = {"X-User-Id": user_id}

    # Create an area
    area_data = {
        "latlngs": [[40.0, -3.0], [40.01, -3.0], [40.01, -2.99]],
        "color": "blue",
        "text": "Test Area",
        "fontSize": "14px"
    }
    response = client.post("/api/areas", json=area_data, headers=headers)
    assert response.status_code == 201
    area_id = response.json()["id"]

    # Vote
    response = client.post("/api/votes", json={"targetType": "area", "targetId": area_id}, headers=headers)
    assert response.status_code == 201

    # Check map-data
    response = client.get("/api/map-data", headers=headers)
    data = response.json()
    area = next(a for a in data["areas"] if a["id"] == area_id)
    assert area["votes"] == 1
    assert area["userVoted"] is True

def test_vote_on_nonexistent_target():
    headers = {"X-User-Id": "test_user_nonexist"}
    response = client.post("/api/votes", json={"targetType": "pin", "targetId": 999999999}, headers=headers)
    assert response.status_code == 404

