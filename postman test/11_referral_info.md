### GET /api/referral/info + POST /api/referral/apply

---

#### GET My Referral Info
**URL:** `http://192.168.1.13:8000/api/referral/info`
**Auth:** Bearer Token required
*(No body)*

**Expected Response:**
```json
{
  "referral_code": "ZTAB23MK",
  "total_referrals": 1,
  "earned_days": 15,
  "history": [
    {"date": "2026-05-09T10:00:00", "days": 15}
  ]
}
```

---

#### POST Apply a Referral Code (Before First Purchase Only)
**URL:** `http://192.168.1.13:8000/api/referral/apply`
**Auth:** Bearer Token required

**Raw JSON:**
```json
{
  "referral_code": "ABCD1234"
}
```

**Rules:**
- ❌ Cannot apply after first purchase → `400 Referral code cannot be applied after first purchase.`
- ❌ Cannot apply your own code → `400 You cannot use your own referral code.`
- ❌ Invalid code → `404 Invalid referral code.`
- ❌ Already applied → `400 Referral code already applied.`
- ✅ Success → `{"status": "success", "message": "Referral code applied successfully."}`
