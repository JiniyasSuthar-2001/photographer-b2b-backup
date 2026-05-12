# Postman Raw JSON Requests (Dev)

This file contains ready-to-copy JSON bodies and example URLs for Postman testing. Each section is grouped by API name.

**Base URLs:**
- Frontend (dev): `http://192.168.1.13:5173/`
- Backend (dev): `http://192.168.1.13:8000/`
- WebSocket: `ws://192.168.1.13:8000/ws?token=<JWT>`

---

## 1. Auth

### POST /api/auth/signup
**URL:** `http://192.168.1.13:8000/api/auth/signup`
**Raw JSON:**
```json
{
  "username": "test_user_1",
  "password": "Password123!",
  "phone": "+919999988888",
  "full_name": "Test User One",
  "city": "Mumbai",
  "category": "Wedding",
  "user_type": "photographer",
  "referral_code_applied": ""
}
```
> `user_type` must be `"photographer"` (not `"studio_owner"` or `"freelancer"`). `referral_code_applied` is optional.

### POST /api/auth/login
**URL:** `http://192.168.1.13:8000/api/auth/login`
**Raw JSON:**
```json
{
  "username": "test_user_1",
  "password": "Password123!"
}
```
> **Postman Test Script** (paste in Tests tab to auto-save token):
> ```javascript
> var jsonData = pm.response.json();
> pm.collectionVariables.set("token", jsonData.access_token);
> ```

### POST /api/auth/forgot-password
**URL:** `http://192.168.1.13:8000/api/auth/forgot-password`
**Raw JSON:**
```json
{
  "username": "test_user_1"
}
```

### POST /api/auth/logout
**URL:** `http://192.168.1.13:8000/api/auth/logout`
*(No body required — Auth: Bearer Token)*

---

## 2. Referral

### GET /api/referral/info
**URL:** `http://192.168.1.13:8000/api/referral/info`
**Auth:** Bearer Token required
*(No body — returns referral_code, total_referrals, earned_days, history)*

### POST /api/referral/apply
**URL:** `http://192.168.1.13:8000/api/referral/apply`
**Auth:** Bearer Token required
**Raw JSON:**
```json
{
  "referral_code": "ABCD1234"
}
```
> Can only be applied **before** the user's first purchase. Self-referral and reuse are blocked.

---

## 3. Subscription

### GET /api/subscription/status
**URL:** `http://192.168.1.13:8000/api/subscription/status`
**Auth:** Bearer Token required
*(No body required)*

### POST /api/subscription/purchase
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
> Triggers `payment_success` WebSocket event to the buyer. Triggers `referral_reward_received` to the referrer if this is the buyer's first purchase.

---

## 4. Team

### GET /api/team/
**URL:** `http://192.168.1.13:8000/api/team/`
*(No body — returns all team members)*

### POST /api/team/request
**URL:** `http://192.168.1.13:8000/api/team/request`
**Raw JSON:**
```json
{
  "phone": "+919876543210",
  "display_name": "Lead Photographer",
  "display_category": "Lead",
  "display_city": "Mumbai"
}
```

### GET /api/team/requests/pending
**URL:** `http://192.168.1.13:8000/api/team/requests/pending`
*(No body — returns pending team invites sent TO current user)*

### PATCH /api/team/request/{id} (Accept/Decline)
**URL:** `http://192.168.1.13:8000/api/team/request/1?status=accepted`
*(status is a query param: `accepted` or `declined`)*
**Raw JSON:** `{}`

### GET /api/team/joined
**URL:** `http://192.168.1.13:8000/api/team/joined`
*(No body — returns studios where current user is a member)*

### PATCH /api/team/{member_id} (Update Display Info)
**URL:** `http://192.168.1.13:8000/api/team/12`
**Raw JSON:**
```json
{
  "display_name": "Master Cinematographer",
  "display_category": "Cinematographer",
  "display_city": "Pune"
}
```

### DELETE /api/team/{member_id}
**URL:** `http://192.168.1.13:8000/api/team/12`
*(No body)*

### GET /api/team/collaborations/{member_id}
**URL:** `http://192.168.1.13:8000/api/team/collaborations/5?page=1&limit=10`
*(No body)*

### GET /api/team/discover
**URL:** `http://192.168.1.13:8000/api/team/discover?city=Ahmedabad&category=Wedding`
*(No body)*

---

## 5. Projects (Jobs)

### POST /api/projects/
**URL:** `http://192.168.1.13:8000/api/projects/`
**Raw JSON:**
```json
{
  "title": "Grand Wedding - Mehta Family",
  "client": "Rajesh Mehta",
  "venue": "JW Marriott, Pune",
  "budget": 55000,
  "category": "Wedding",
  "date": "2026-12-20T10:00:00",
  "roles": ["Lead", "Candid", "Cinematographer"]
}
```

### GET /api/projects/
**URL:** `http://192.168.1.13:8000/api/projects/`
*(No body — returns all jobs owned by current user)*

### GET /api/projects/{job_id}
**URL:** `http://192.168.1.13:8000/api/projects/1`
*(No body)*

### PUT /api/projects/{job_id}
**URL:** `http://192.168.1.13:8000/api/projects/1`
**Raw JSON:**
```json
{
  "title": "Updated Wedding Title",
  "budget": 60000,
  "venue": "New Location, Mumbai"
}
```

### DELETE /api/projects/{job_id}
**URL:** `http://192.168.1.13:8000/api/projects/1`
*(No body)*

---

## 6. Requests (Job Invites)

### POST /api/requests/
**URL:** `http://192.168.1.13:8000/api/requests/`
**Raw JSON:**
```json
{
  "job_id": 1,
  "receiver_id": 5,
  "role": "Lead",
  "budget": 15000
}
```

### GET /api/requests/ (Invites received)
**URL:** `http://192.168.1.13:8000/api/requests/?role=receiver&status=pending`
*(No body)*

### GET /api/requests/accepted-jobs
**URL:** `http://192.168.1.13:8000/api/requests/accepted-jobs`
*(No body)*

### GET /api/requests/job/{job_id} (Job tracking)
**URL:** `http://192.168.1.13:8000/api/requests/job/1`
*(No body — returns all requests for a specific job)*

### PATCH /api/requests/{id} (Accept/Decline)
**URL:** `http://192.168.1.13:8000/api/requests/10?status=accepted`
*(status is a query param: `accepted` or `declined`)*
**Raw JSON:** `{}`

### DELETE /api/requests/{id} (Cancel)
**URL:** `http://192.168.1.13:8000/api/requests/10`
*(No body)*

---

## 7. Dashboard

### GET /api/dashboard/summary
**URL:** `http://192.168.1.13:8000/api/dashboard/summary?role=photographer`
*(No body)*

---

## 8. Tasks

### POST /api/tasks/
**URL:** `http://192.168.1.13:8000/api/tasks/`
**Raw JSON:**
```json
{
  "jobId": 1,
  "text": "Check battery levels for all cameras"
}
```

### PUT /api/tasks/{task_id}
**URL:** `http://192.168.1.13:8000/api/tasks/5`
**Raw JSON:**
```json
{
  "text": "Updated task text",
  "completed": true
}
```

### DELETE /api/tasks/{task_id}
**URL:** `http://192.168.1.13:8000/api/tasks/5`
*(No body)*

---

## 9. Analytics

### GET /api/analytics/stats
**URL:** `http://192.168.1.13:8000/api/analytics/stats`
*(No body)*

### GET /api/analytics/trends
**URL:** `http://192.168.1.13:8000/api/analytics/trends?timeframe=1M`
*(timeframe options: `1M`, `3M`, `6M`, `1Y`)*

### GET /api/analytics/categories
**URL:** `http://192.168.1.13:8000/api/analytics/categories`
*(No body)*

---

## 10. Notifications

### GET /api/notifications/
**URL:** `http://192.168.1.13:8000/api/notifications/?page=1&limit=20`
*(No body)*

### PATCH /api/notifications/{id}/read
**URL:** `http://192.168.1.13:8000/api/notifications/42/read`
**Raw JSON:**
```json
{
  "is_read": true
}
```

### PATCH /api/notifications/read-all
**URL:** `http://192.168.1.13:8000/api/notifications/read-all`
*(No body)*

---

## 11. Webhooks

### POST /api/webhooks/external-event
**URL:** `http://192.168.1.13:8000/api/webhooks/external-event`
**Raw JSON:**
```json
{
  "event": "payment_success",
  "data": {
    "amount": 1499,
    "user_email": "test@example.com"
  }
}
```

### POST /api/webhooks/trigger-refresh
**URL:** `http://192.168.1.13:8000/api/webhooks/trigger-refresh`
**Raw JSON:**
```json
{
  "page": "projects",
  "user_id": 1
}
```

---

## 12. Real-Time (WebSocket)

**Connect to:** `ws://192.168.1.13:8000/ws?token=<JWT_TOKEN>`

**Inbound Events from Server:**

| Event Type | When Sent | Data |
|---|---|---|
| `payment_success` | After `/subscription/purchase` | `{plan, new_expiry}` |
| `referral_reward_received` | On referrer when buyer's first purchase completes | `{days_added, new_expiry_date, message}` |
| `NEW_NOTIFICATION` | On new job invite / team request | `{message, redirect_to}` |
| `REFRESH_PAGE` | Backend state change | `{page: "projects"\|"team"\|"invites"}` |
| `TOAST` | Generic server message | `{message, toastType}` |

---

## Notes for Postman

1. **Authorization:** For all endpoints except Auth (Signup/Login), go to the **Auth** tab, select **Bearer Token**, paste your JWT.
2. **Content-Type:** Set to `application/json` (done automatically with `raw → JSON`).
3. **Valid Roles (for jobs/requests):** `Lead`, `Traditional`, `Candid`, `Drone`, `Reel`, `Cinematographer`, `Assistant`, `Helper`, `Creative Director`.
4. **user_type field:** Always use `"photographer"` — `"studio_owner"` and `"freelancer"` are **deprecated**.
5. **Subscription endpoint:** Use `POST /api/subscription/purchase` — NOT `/upgrade` (removed).
