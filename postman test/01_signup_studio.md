### POST /api/auth/signup (Studio Owner / Photographer)
**URL:** `http://192.168.1.13:8000/api/auth/signup`

**Raw JSON:**
```json
{
  "username": "studio_vision",
  "email": "studio@vision.example",
  "phone": "+919811122233",
  "password": "StudioPassword!2026",
  "confirm_password": "StudioPassword!2026"
}
```

> **Note:** The system now only requires core identity and security fields at signup. Additional profile details (City, Category, Full Name) can be updated later in the Profile page.
