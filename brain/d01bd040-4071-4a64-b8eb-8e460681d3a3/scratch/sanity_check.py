import requests
import json

BASE_URL = "http://localhost:8000/api"

def test_apis():
    # Login as admin
    login_data = {"username": "admin", "password": "admin@001"}
    r = requests.post(f"{BASE_URL}/auth/login", json=login_data)
    if r.status_code != 200:
        print(f"Login failed: {r.status_code} {r.text}")
        return
    
    token = r.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("Login successful")

    # 1. Check Profile (including phone)
    r = requests.get(f"{BASE_URL}/auth/profile", headers=headers)
    print(f"Profile: {r.status_code}")
    if r.status_code == 200:
        print(f"  Phone: {r.json().get('phone')}")

    # 2. Check Dashboard
    r = requests.get(f"{BASE_URL}/dashboard/summary?role=studio_owner", headers=headers)
    print(f"Dashboard: {r.status_code}")

    # 3. Check Team
    r = requests.get(f"{BASE_URL}/team/", headers=headers)
    print(f"Team: {r.status_code}")

    # 4. Search user by phone (Studio Partner: 9998887776)
    r = requests.get(f"{BASE_URL}/team/users/search?phone=9998887776", headers=headers)
    print(f"Search Studio Partner: {r.status_code}")
    if r.status_code == 200:
        print(f"  Found: {r.json()['full_name']}")

    # 5. Check Projects
    r = requests.get(f"{BASE_URL}/projects/", headers=headers)
    print(f"Projects: {r.status_code}")

if __name__ == "__main__":
    try:
        test_apis()
    except Exception as e:
        print(f"Error: {e}")
