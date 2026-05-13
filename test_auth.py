import os
import requests

# Allow overriding the backend base URL via environment variable so teammates
# can point tests to a LAN-accessible backend (e.g. http://192.168.1.13:8000).
BASE_HOST = os.getenv("BASE_HOST", "http://localhost:8000")
BASE_URL = f"{BASE_HOST}/api/auth"

def test_auth():
    print("Testing Signup...")
    signup_data = {
        "username": "testuser_abc", 
        "password": "password123",
        "phone": "1234567890",
        "full_name": "Test User ABC"
    }
    res = requests.post(f"{BASE_URL}/signup", json=signup_data)
    print("Signup Status:", res.status_code)
    print("Signup Response:", res.json())
    
    if res.status_code == 400 and "already exists" in res.text:
        print("User already exists, continuing to login...")
    elif res.status_code != 200:
        print("Signup failed.")
        return

    print("\nTesting Login...")
    res = requests.post(f"{BASE_URL}/login", json=signup_data)
    print("Login Status:", res.status_code)
    print("Login Response:", res.json())

    if res.status_code == 200:
        token = res.json().get("access_token")
        print("\nGot Token:", token)
    else:
        print("Login failed.")

if __name__ == "__main__":
    test_auth()
