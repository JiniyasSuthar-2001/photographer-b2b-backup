### POST /api/subscription/purchase + GET /api/referral/info

---

#### GET Referral Info (Before Upgrade)
**URL:** `http://192.168.1.13:8000/api/referral/info`
**Auth:** Bearer Token required
*(No body — note down your referral_code to share with others)*

---

#### POST Purchase Subscription
**URL:** `http://192.168.1.13:8000/api/subscription/purchase`
**Auth:** Bearer Token required

**Raw JSON:**
```json
{
  "amount": 1499,
  "currency": "INR",
  "plan_name": "Pro"
}
```

**Expected Response:**
```json
{
  "status": "success",
  "transaction_id": "txn_abc123",
  "new_expiry": "2026-06-09T10:00:00",
  "reward_given": false
}
```

> `reward_given: true` only when this is the user's **first purchase** AND they have a `referred_by` code set. The referrer receives +15 days via WebSocket (`referral_reward_received` event).

---

#### GET Subscription Status
**URL:** `http://192.168.1.13:8000/api/subscription/status`
**Auth:** Bearer Token required
*(No body — returns plan, is_pro, expiry_date, days_left)*
