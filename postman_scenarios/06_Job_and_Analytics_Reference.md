# Scenario 06: Job Lifecycle & Analytics Reference

Complete master reference for Job/Project management, invitations, analytics, subscription, and referral endpoints.

> **Variable convention:** Use `{{baseUrl}}` = `http://192.168.1.13:8000` and `{{token}}` in your Postman Collection Variables.

---

## 1. Project Management (Studio Owner)

### A. Create Job
**POST** `{{baseUrl}}/api/projects/`
```json
{
  "title": "Grand Wedding - Mumbai",
  "client": "Kapoor Family",
  "venue": "Taj Mahal Palace",
  "budget": 50000,
  "category": "Wedding",
  "date": "2026-12-25T10:00:00",
  "roles": ["Lead", "Candid", "Drone"]
}
```

### B. Get All My Jobs
**GET** `{{baseUrl}}/api/projects/`
*(No body)*

### C. Get Job By ID
**GET** `{{baseUrl}}/api/projects/{{job_id}}`
*(No body)*

### D. Update Job
**PUT** `{{baseUrl}}/api/projects/{{job_id}}`
```json
{
  "title": "Grand Wedding - Mumbai (Updated)",
  "budget": 55000,
  "venue": "Taj Lands End"
}
```

### E. Delete Job
**DELETE** `{{baseUrl}}/api/projects/{{job_id}}`
*(No body)*

---

## 2. Job Invitations (Studio Owner)

### A. Get Eligible Jobs for a Photographer
**GET** `{{baseUrl}}/api/requests/eligible-jobs/{{photographer_id}}`
*(No body — returns open jobs not yet assigned to this photographer)*

### B. Send Job Request
**POST** `{{baseUrl}}/api/requests/`
```json
{
  "job_id": 1,
  "receiver_id": 2,
  "role": "Lead",
  "budget": 15000
}
```

### C. View All Requests for a Specific Job (Tracking)
**GET** `{{baseUrl}}/api/requests/job/{{job_id}}`
*(No body — used by the Job Tracking popup)*

### D. Cancel Job Request
**DELETE** `{{baseUrl}}/api/requests/{{job_request_id}}`
*(No body)*

---

## 3. Photographer Workflow

### A. Get Incoming Invites
**GET** `{{baseUrl}}/api/requests/?role=receiver&status=pending`
*(No body)*

### B. Accept / Decline Job Request
**PATCH** `{{baseUrl}}/api/requests/{{job_request_id}}?status=accepted`
*(status query param: `accepted` or `declined`)*

### C. Get My Accepted Jobs
**GET** `{{baseUrl}}/api/requests/accepted-jobs`
*(No body)*

---

## 4. Referral System

### A. Get My Referral Info
**GET** `{{baseUrl}}/api/referral/info`
*(Returns: referral_code, total_referrals, earned_days, history)*

### B. Apply a Referral Code (Before First Purchase)
**POST** `{{baseUrl}}/api/referral/apply`
```json
{
  "referral_code": "ABCD1234"
}
```

---

## 5. Subscription & Billing

### A. Get Subscription Status
**GET** `{{baseUrl}}/api/subscription/status`
*(Returns: plan, is_pro, expiry_date, days_left)*

### B. Purchase / Upgrade Plan
**POST** `{{baseUrl}}/api/subscription/purchase`
```json
{
  "amount": 1499,
  "currency": "INR",
  "plan_name": "Pro"
}
```
> Triggers `payment_success` WebSocket to buyer. If first purchase + referral code exists, triggers `referral_reward_received` to referrer (+15 days).

---

## 6. Dashboard & Analytics

### A. Dashboard Summary
**GET** `{{baseUrl}}/api/dashboard/summary?role=photographer`
*(No body)*

### B. Analytics Stats
**GET** `{{baseUrl}}/api/analytics/stats`
*(No body)*

### C. Analytics Trends
**GET** `{{baseUrl}}/api/analytics/trends?timeframe=1M`
*(timeframe options: `1M`, `3M`, `6M`, `1Y`)*

---

## 7. Tasks

### A. Get All Tasks
**GET** `{{baseUrl}}/api/tasks/`

### B. Create Task
**POST** `{{baseUrl}}/api/tasks/`
```json
{
  "job_id": 1,
  "text": "Confirm battery levels before event"
}
```

### C. Update Task
**PUT** `{{baseUrl}}/api/tasks/{{task_id}}`
```json
{
  "text": "Updated task description",
  "completed": true
}
```

### D. Delete Task
**DELETE** `{{baseUrl}}/api/tasks/{{task_id}}`

---

## 8. Team Management (Studio Owner)

### A. Search Photographer (By Phone or Email)
**GET** `{{baseUrl}}/api/team/search?phone=+919876543211`
*(Optional query params: `phone`, `email`)*

### B. Discover All Photographers
**GET** `{{baseUrl}}/api/team/discover?city=Mumbai`
*(Optional filters: `category`, `city`)*

### C. Send Team Request
**POST** `{{baseUrl}}/api/team/request`
```json
{
  "phone": "+919876543211",
  "display_name": "Aman Sharma",
  "display_category": "Lead",
  "display_city": "Mumbai"
}
```

### D. Get My Team Directory
**GET** `{{baseUrl}}/api/team/`

### E. Respond to Team Request (Photographer)
**PATCH** `{{baseUrl}}/api/team/request/{{request_id}}?status=accepted`
*(status: `accepted` or `declined`)*
