### POST /api/auth/signup (Freelance Photographer)
**URL:** `http://192.168.1.13:8000/api/auth/signup`

**Raw JSON:**
```json
{
  "username": "photographer_ravi",
  "password": "Password123!",
  "phone": "+919876500001",
  "full_name": "Ravi Mehta",
  "city": "Ahmedabad",
  "category": "Candid",
  "user_type": "photographer",
  "referral_code_applied": ""
}
```

> **Note:** All users use `"user_type": "photographer"`. Role differentiation is handled by platform logic (team owners vs. members), not the `user_type` field itself.
