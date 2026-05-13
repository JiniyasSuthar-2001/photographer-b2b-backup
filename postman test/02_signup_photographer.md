### POST /api/auth/signup (Freelance Photographer)
**URL:** `http://192.168.1.13:8000/api/auth/signup`

**Raw JSON:**
```json
{
  "username": "photographer_ravi",
  "email": "ravi.mehta@example.com",
  "phone": "+919876500001",
  "password": "Password123!",
  "confirm_password": "Password123!"
}
```

> **Note:** The system now only requires core identity and security fields at signup. Additional profile details (City, Category, Full Name) can be updated later in the Profile page.