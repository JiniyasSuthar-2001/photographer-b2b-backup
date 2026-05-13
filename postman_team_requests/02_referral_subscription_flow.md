# Team Referral & Subscription Testing Flow

This file demonstrates how the referral reward system integrates with team building — the recommended end-to-end test sequence.

---

## Scenario: Elite Studio Refers Aman, Aman Makes First Purchase

### Step 1: Get Elite Studio's Referral Code
**GET** `http://192.168.1.13:8000/api/referral/info`
**Auth:** Bearer Token (elite_studio)

**Response will include:**
```json
{
  "referral_code": "ZTAB23MK",
  "total_referrals": 0,
  "earned_days": 0
}
```
> Note down the `referral_code` value.

---

### Step 2: Aman Signs Up
**POST** `http://192.168.1.13:8000/api/auth/signup`
```json
{
  "username": "aman_sharma",
  "email": "aman.sharma@example.com",
  "phone": "+919876543211",
  "password": "Password123!",
  "confirm_password": "Password123!"
}
```

---

### Step 2.5: Aman Applies Elite Studio's Referral Code
**POST** `http://192.168.1.13:8000/api/referral/apply`
**Auth:** Bearer Token (Aman)
```json
{
  "referral_code": "ZTAB23MK"
}
```
> This registers `referred_by = "ZTAB23MK"` on Aman's profile. No reward is given yet.

---

### Step 3: Aman Logs In
**POST** `http://192.168.1.13:8000/api/auth/login`
```json
{
  "username": "aman_sharma",
  "password": "Password123!"
}
```
> Save Aman's token as `{{aman_token}}`.

---

### Step 4: Aman Makes His First Purchase
**POST** `http://192.168.1.13:8000/api/subscription/purchase`
**Auth:** Bearer Token (Aman)
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
  "transaction_id": "txn_abc123def456",
  "new_expiry": "2026-06-09T10:00:00",
  "reward_given": true
}
```

> `reward_given: true` confirms Elite Studio received +15 days.

---

### Step 5: Verify Elite Studio Got Reward
**GET** `http://192.168.1.13:8000/api/referral/info`
**Auth:** Bearer Token (elite_studio)

**Expected change:**
```json
{
  "total_referrals": 1,
  "earned_days": 15
}
```

**GET** `http://192.168.1.13:8000/api/subscription/status`
**Auth:** Bearer Token (elite_studio)
> `days_left` should have increased by 15.

---

### Step 6: Aman Tries to Apply Another Code (Should Fail)
**POST** `http://192.168.1.13:8000/api/referral/apply`
**Auth:** Bearer Token (Aman)
```json
{
  "referral_code": "WXYZ9999"
}
```
**Expected:** `400 Bad Request — "Referral code cannot be applied after first purchase."`

---

### Step 7: Aman's Subscription Status
**GET** `http://192.168.1.13:8000/api/subscription/status`
**Auth:** Bearer Token (Aman)

**Expected:**
```json
{
  "plan": "Pro",
  "is_pro": true,
  "days_left": 30
}
```
