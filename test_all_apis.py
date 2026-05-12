import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), "backend"))

from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_apis():
    print("--- Starting API Tests ---")
    
    # 1. Test unauthenticated routes
    res = client.get("/")
    print(f"GET / -> {res.status_code}")
    
    # 2. Login to get token (assume admin/admin@001 exists from seed)
    login_data = {
        "username": "admin",
        "password": "admin@001"
    }
    res = client.post("/api/auth/login", json=login_data)
    
    token = None
    if res.status_code == 200:
        token = res.json().get("access_token")
        print(f"POST /api/auth/login -> {res.status_code} (Success)")
    else:
        print(f"POST /api/auth/login -> {res.status_code} (Failed, trying generic user)")
        # Try generic user
        res = client.post("/api/auth/login", json={"username": "freelancer1", "password": "password123"})
        if res.status_code == 200:
            token = res.json().get("access_token")
            print(f"POST /api/auth/login (freelancer1) -> {res.status_code} (Success)")
        else:
            print("Could not login. Endpoints requiring auth will fail.")

    headers = {"Authorization": f"Bearer {token}"} if token else {}
    
    # 3. Test GET routes that require auth
    endpoints = [
        "/api/dashboard/summary?role=photographer",
        "/api/team/",
        "/api/team/discover",
        "/api/requests/",
        "/api/projects/",
        "/api/analytics/",
        "/api/tasks/",
        "/api/subscription/status",
        "/api/referral/info",
        "/api/calendar/roster?date=2026-05-15"
    ]

    for ep in endpoints:
        res = client.get(ep, headers=headers)
        if res.status_code == 200:
            print(f"GET {ep} -> 200 OK")
        else:
            print(f"GET {ep} -> {res.status_code} FAIL: {res.text}")

if __name__ == "__main__":
    test_apis()
