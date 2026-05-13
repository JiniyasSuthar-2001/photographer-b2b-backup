# Test File: Sneha Gupta

This file contains all requests related to Sneha Gupta, including account creation, team joining, job acceptance, referral, and subscription flows.

---

## 1. Signup (Sneha Gupta)
**URL:** `http://192.168.1.13:8000/api/auth/signup`
**Method:** `POST`
**Raw JSON:**
```json
{
  "username": "sneha_gupta",
  "email": "sneha.gupta@example.com",
  "phone": "+919876543214",
  "password": "Password123!",
  "confirm_password": "Password123!"
}
```
> Optionally fill `referral_code_applied` with a friend's code to register the referral relationship.

---

## 2. Login (Sneha Gupta)
**URL:** `http://192.168.1.13:8000/api/auth/login`
**Method:** `POST`
**Raw JSON:**
```json
{
  "username": "sneha_gupta",
  "password": "Password123!"
}
```

**Postman "Tests" Script (Automatic Token Capture):**
```javascript
var jsonData = pm.response.json();
pm.collectionVariables.set("token", jsonData.access_token);
```

---

## 3. Get Referral Info
**URL:** `http://192.168.1.13:8000/api/referral/info`
**Method:** `GET`
**Auth:** Bearer Token required
*(No body — returns referral_code, total_referrals, earned_days)*

---

## 4. Apply a Referral Code (Before First Purchase)
**URL:** `http://192.168.1.13:8000/api/referral/apply`
**Method:** `POST`
**Auth:** Bearer Token required
**Raw JSON:**
```json
{
  "referral_code": "ABCD1234"
}
```
> Only works before first purchase. Skip if already applied at signup.

---

## 5. Add to Team (By Studio Owner)
**URL:** `http://192.168.1.13:8000/api/team/request`
**Method:** `POST`
**Auth:** Bearer Token of the Studio Owner
**Raw JSON:**
```json
{
  "phone": "+919876543214",
  "display_name": "Sneha Gupta",
  "display_category": "Traditional",
  "display_city": "Delhi"
}
```

---

## 6. Check Pending Team Invites
**URL:** `http://192.168.1.13:8000/api/team/requests/pending`
**Method:** `GET`
**Auth:** Bearer Token required
*(No body)*

---

## 7. Accept Team Invitation
**URL:** `http://192.168.1.13:8000/api/team/request/{request_id}?status=accepted`
**Method:** `PATCH`
**Auth:** Bearer Token required
*(No body)*

---

## 8. Check Notifications
**URL:** `http://192.168.1.13:8000/api/notifications/`
**Method:** `GET`
**Auth:** Bearer Token required
*(No body)*

---

## 9. Check Incoming Job Invites
**URL:** `http://192.168.1.13:8000/api/requests/?role=receiver&status=pending`
**Method:** `GET`
**Auth:** Bearer Token required
*(No body)*

---

## 10. Accept Job Invite
**URL:** `http://192.168.1.13:8000/api/requests/{job_request_id}?status=accepted`
**Method:** `PATCH`
**Auth:** Bearer Token required
*(No body)*

---

## 11. Check Accepted Jobs
**URL:** `http://192.168.1.13:8000/api/requests/accepted-jobs`
**Method:** `GET`
**Auth:** Bearer Token required
*(No body)*

---

## 12. Verify Joined Team
**URL:** `http://192.168.1.13:8000/api/team/joined`
**Method:** `GET`
**Auth:** Bearer Token required
*(No body)*

---

## 13. Check Subscription Status
**URL:** `http://192.168.1.13:8000/api/subscription/status`
**Method:** `GET`
**Auth:** Bearer Token required
*(No body)*

---

## 14. Purchase Subscription / Upgrade
**URL:** `http://192.168.1.13:8000/api/subscription/purchase`
**Method:** `POST`
**Auth:** Bearer Token required
**Raw JSON:**
```json
{
  "amount": 1499,
  "currency": "INR",
  "plan_name": "Pro"
}
```
> If a referral code was applied, this triggers +15 days for the referrer via WebSocket.
