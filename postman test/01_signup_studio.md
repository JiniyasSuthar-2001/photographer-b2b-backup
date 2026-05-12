### POST /api/auth/signup (Studio Owner / Photographer)
**URL:** `http://192.168.1.13:8000/api/auth/signup`

**Raw JSON:**
```json
{
  "username": "studio_vision",
  "password": "StudioPassword!2026",
  "phone": "+919811122233",
  "full_name": "Vision Studios Mumbai",
  "city": "Mumbai",
  "category": "Wedding",
  "user_type": "photographer",
  "referral_code_applied": ""
}
```

> **Note:** `user_type` must be `"photographer"` (not `"studio_owner"`). The `referral_code_applied` field is optional — leave blank or omit.
