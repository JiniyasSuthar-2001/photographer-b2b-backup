# Scenario 5: System Operations & Admin

Admin-level checks, subscription management, and referral validation.

---

### Step 1: Add Arjun as a Helper
**POST** `http://192.168.1.13:8000/api/team/request`
**Auth:** Bearer Token (Studio Owner)
**Raw JSON:**
```json
{
  "phone": "+919876543219",
  "display_name": "Arjun Kapoor",
  "display_category": "Helper",
  "display_city": "Pune"
}
```

---

### Step 2: Check Referral Stats (Before Upgrade)
**GET** `http://192.168.1.13:8000/api/referral/info`
**Auth:** Bearer Token (Studio Owner)
*(No body — shows referral_code, total_referrals, earned_days)*

---

### Step 3: Upgrade Studio Subscription
**POST** `http://192.168.1.13:8000/api/subscription/purchase`
**Auth:** Bearer Token (Studio Owner)
**Raw JSON:**
```json
{
  "amount": 1499,
  "currency": "INR",
  "plan_name": "Pro"
}
```
> **Changed**: endpoint is now `/purchase` (not `/upgrade`). Payload uses `plan_name` not `plan`.

---

### Step 4: Check Subscription Status
**GET** `http://192.168.1.13:8000/api/subscription/status`
**Auth:** Bearer Token
*(No body — returns plan, is_pro, expiry_date, days_left)*

---

### Step 5: Check Analytics
**GET** `http://192.168.1.13:8000/api/analytics/stats`
**Auth:** Bearer Token
*(No body)*

**GET** `http://192.168.1.13:8000/api/analytics/trends?timeframe=1M`
*(timeframe options: `1M`, `3M`, `6M`, `1Y`)*

**GET** `http://192.168.1.13:8000/api/analytics/categories`

---

### Step 6: Simulate Payment Success Webhook
**POST** `http://192.168.1.13:8000/api/webhooks/external-event`
**Raw JSON:**
```json
{
  "event": "payment_success",
  "data": {
    "amount": 1499,
    "user_email": "studio_owner@example.com"
  }
}
```

---

### Step 7: Force Frontend Refresh via Webhook
**POST** `http://192.168.1.13:8000/api/webhooks/trigger-refresh`
**Raw JSON:**
```json
{
  "page": "projects",
  "user_id": 1
}
```
