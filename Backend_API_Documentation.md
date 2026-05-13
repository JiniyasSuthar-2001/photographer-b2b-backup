# Lumière Backend API Documentation

This is the **living registry** of all API endpoints implemented in the Lumière platform. It reflects the current production-ready state including the Referral System, Subscription/Payment Layer, and real-time WebSocket events.

> **Base URL (Dev):** `http://192.168.1.13:8000/api`
> **WebSocket URL:** `ws://192.168.1.13:8000/ws?token=<JWT>`

---

## Authentication

All protected endpoints require:
```
Authorization: Bearer <JWT_TOKEN>
```
The token is obtained from the `/api/auth/login` response and stored in `localStorage`.

---

## 1. Authentication Layer (`/api/auth`)

### `POST /api/auth/signup`
- **Files**: `routers/auth.py` → `services/auth_service.py`
- **Schema**: `UserSignUp`
- **Description**: Creates a new user account. Automatically generates a unique 8-character referral code. Registers phone number in `IdentityOwnership` table for anti-abuse tracking.
- **Payload**:
```json
{
    "username": "photographer_test",
        "email": "photographer_test@example.com",
        "password": "SecurePass@123",
        "confirm_password": "SecurePass@123",
        "phone": "+919876543210",
        "full_name": "Arjun Mehta",
        "city": "Ahmedabad",
        "category": "Wedding",
        "user_type": "photographer",
        "referral_code_applied": "ABCD1234"
}
```
- **Notes**: `referral_code_applied` is optional. If provided, it is stored as `referred_by` on the user. The referral reward (+15 days) is only distributed upon the user's **first successful payment**, not at signup.

---

### `POST /api/auth/login`
- **Files**: `routers/auth.py` → `services/auth_service.py`
- **Schema**: `UserLogin`
- **Description**: Authenticates a user and returns a JWT access token along with the full `UserProfile` (including `referral_code`, `subscription_expiry`, `is_pro`).
- **Payload**:
```json
{
    "username": "admin",
    "password": "admin@001"
}
```
- **Response includes**: `access_token`, `token_type`, and `user` (full profile with subscription state).

---

### `POST /api/auth/forgot-password`
- **Files**: `routers/auth.py`
- **Schema**: `ForgotPassword`
- **Description**: Simulates a password reset request (logs to console in dev mode).
- **Payload**:
```json
{
    "username": "photographer_test"
}
```

---

### `POST /api/auth/logout`
- **Auth**: Required
- **Description**: Invalidates the user session server-side (clears token record if stored).

---

## 2. Subscription & Billing Layer (`/api/subscription`)

### `GET /api/subscription/status`
- **Auth**: Required
- **Description**: Returns the current user's subscription details.
- **Response**:
```json
{
    "plan": "Pro",
    "is_pro": true,
    "expiry_date": "2026-06-09T10:00:00",
    "days_left": 30
}
```

---

### `POST /api/subscription/purchase`
- **Auth**: Required
- **Schema**: `PaymentCreate`
- **Description**: Simulates a payment and upgrades the user's subscription. **Triggers referral reward distribution** if it is the user's **first purchase** and they have a `referred_by` code on their profile.
- **Payload**:
```json
{
    "amount": 1499,
    "currency": "INR",
    "plan_name": "Pro"
}
```
- **Response**:
```json
{
    "status": "success",
    "transaction_id": "txn_abc123def456",
    "new_expiry": "2026-06-09T10:00:00",
    "reward_given": true
}
```
- **WebSocket Events Triggered**:
  - `payment_success` → sent to the **purchasing user**
  - `referral_reward_received` → sent to the **referrer** (if first purchase and referral code existed)

---

## 3. Referral System Layer (`/api/referral`)

### `GET /api/referral/info`
- **Auth**: Required
- **Description**: Returns the current user's referral code, total successful referrals, total days earned, and a history of referral events.
- **Response**:
```json
{
    "referral_code": "ZTAB23MK",
    "total_referrals": 3,
    "earned_days": 45,
    "history": [
        {"date": "2026-04-01T10:00:00", "days": 15},
        {"date": "2026-04-15T10:00:00", "days": 15},
        {"date": "2026-05-01T10:00:00", "days": 15}
    ]
}
```

---

### `POST /api/referral/apply`
- **Auth**: Required
- **Schema**: `ReferralApply`
- **Description**: Applies a referral code to the current user's profile. Only allowed **before** the first purchase. Self-referral is blocked.
- **Payload**:
```json
{
    "referral_code": "ABCD1234"
}
```
- **Error Cases**:
  - `400` – Referral code already applied
  - `400` – Cannot apply after first purchase
  - `400` – Cannot use your own referral code
  - `404` – Invalid referral code

---

## 4. Team Management Layer (`/api/team`)

### `GET /api/team/`
- **Auth**: Required
- **Description**: Returns all photographers in the studio owner's team directory. Includes `jobsCompleted` (shared work count) and display info.

---

### `POST /api/team/request`
- **Auth**: Required
- **Schema**: `TeamRequestCreate`
- **Description**: Sends a team membership invite to a user found via phone number search.
- **Payload**:
```json
{
    "phone": "+919876543211",
    "display_name": "Rohan Shah",
    "display_category": "Candid",
    "display_city": "Surat"
}
```

---

### `GET /api/team/requests/pending`
- **Auth**: Required
- **Description**: Returns all pending team invites sent **to** the current user by other studios.

---

### `PATCH /api/team/request/{id}`
- **Auth**: Required
- **Description**: Accept or decline a team invite. Query param: `?status=accepted` or `?status=declined`.

---

### `GET /api/team/joined`
- **Auth**: Required
- **Description**: Lists all studios where the current user is a member of the team.

---

### `PATCH /api/team/{member_id}`
- **Auth**: Required
- **Schema**: `TeamMemberUpdate`
- **Description**: Updates the studio's local display label for a team member.
- **Payload**:
```json
{
    "display_name": "Rohan Shah Updated",
    "display_category": "Wedding",
    "display_city": "Ahmedabad"
}
```

---

### `DELETE /api/team/{member_id}`
- **Auth**: Required
- **Description**: Removes a photographer from the studio's team directory.

---

### `GET /api/team/collaborations/{member_id}`
- **Auth**: Required
- **Description**: Returns paginated shared work history between the current owner and a team member. Query params: `?page=1&limit=10`.

---

### `GET /api/team/discover`
- **Auth**: Required
- **Description**: Discovers photographers by city, category, or phone. Query params: `?city=Ahmedabad&category=Wedding`.

---

## 5. Project/Job Management Layer (`/api/projects`)

> **Key Design**: `user_id` on the `Job` model refers to the Studio Owner who created the job. This was standardized from the previous `studio_owner_id` convention.

### `POST /api/projects/`
- **Auth**: Required
- **Description**: Creates a new job posting. Only accessible by users with `user_type = photographer` (studio owner role).
- **Payload**:
```json
{
    "title": "Kapoor Wedding",
    "client": "Mr. Kapoor",
    "venue": "Taj Hotel, Ahmedabad",
    "budget": 85000,
    "category": "Wedding",
    "date": "2026-12-25",
    "roles": ["Lead", "Candid", "Drone"]
}
```

---

### `GET /api/projects/`
- **Auth**: Required
- **Description**: Returns all jobs owned by the authenticated user, sorted chronologically. Includes `accepted_count`.

---

### `GET /api/projects/{job_id}`
- **Auth**: Required
- **Description**: Returns full details for a single job including role breakdown and request counts.

---

### `PUT /api/projects/{job_id}`
- **Auth**: Required
- **Description**: Updates a job. Blocked if the job is completed or in the past.

---

### `DELETE /api/projects/{job_id}`
- **Auth**: Required
- **Description**: Permanently deletes a job and all associated requests/tasks.

---

## 6. Job Request Layer (`/api/requests`)

### `POST /api/requests/`
- **Auth**: Required
- **Description**: Sends a job invitation to a team member. Triggers a real-time `NEW_NOTIFICATION` WebSocket event to the receiver.
- **Payload**:
```json
{
    "receiver_id": 5,
    "job_id": 12,
    "role": "Candid",
    "budget": 8000
}
```

---

### `GET /api/requests/`
- **Auth**: Required
- **Description**: Lists job requests. Query params: `?role=receiver&status=pending`
  - `role`: `sender` or `receiver`
  - `status`: `pending`, `accepted`, `declined` (optional)

---

### `GET /api/requests/accepted-jobs`
- **Auth**: Required
- **Description**: Returns all jobs the current user has accepted as a photographer.

---

### `PATCH /api/requests/{id}`
- **Auth**: Required
- **Description**: Accept or decline a job invite. Query param: `?status=accepted` or `?status=declined`. Triggers WebSocket notifications to both parties.

---

### `DELETE /api/requests/{id}`
- **Auth**: Required
- **Description**: Cancels a pending request (sender only).

---

### `GET /api/requests/job/{job_id}`
- **Auth**: Required
- **Description**: Returns all requests associated with a specific job (owner only). Used by the Job Tracking popup.

---

### `GET /api/requests/eligible-jobs/{photographer_id}`
- **Auth**: Required
- **Description**: Returns `open` jobs owned by the current user that the specified photographer is eligible for (not yet invited or assigned).

---

## 7. Analytics Layer (`/api/analytics`)

### `GET /api/analytics/stats`
- **Auth**: Required
- **Description**: High-level metrics: total jobs, total revenue, growth percentage.

---

### `GET /api/analytics/trends`
- **Auth**: Required
- **Description**: Monthly revenue and booking volume for chart rendering. Query param: `?timeframe=1M|3M|6M|1Y`.

---

### `GET /api/analytics/categories`
- **Auth**: Required
- **Description**: Distribution of jobs across Wedding, Portrait, Event, etc.

---

## 8. Notification Layer (`/api/notifications`)

### `GET /api/notifications/`
- **Auth**: Required
- **Description**: Paginated notification list. Query params: `?page=1&limit=20`.

---

### `PATCH /api/notifications/{id}/read`
- **Auth**: Required
- **Schema**: `NotificationUpdate`
- **Description**: Marks a single notification as read.
- **Payload**: `{"is_read": true}`

---

### `PATCH /api/notifications/read-all`
- **Auth**: Required
- **Description**: Batch marks all unread notifications as read.

---

## 9. Dashboard Layer (`/api/dashboard`)

### `GET /api/dashboard/summary`
- **Auth**: Required
- **Description**: Single call that returns upcoming jobs for the current week plus latest activity items. Query param: `?role=photographer`.

---

## 10. Tasks Layer (`/api/tasks`)

### `GET /api/tasks/`
- **Auth**: Required
- **Description**: Returns all tasks for jobs owned by the current user.

---

### `POST /api/tasks/`
- **Auth**: Required
- **Description**: Creates a task linked to a job.
- **Payload**: `{"jobId": 12, "text": "Confirm venue details"}`

---

### `PUT /api/tasks/{task_id}`
- **Auth**: Required
- **Description**: Updates task text or toggles completion status.

---

### `DELETE /api/tasks/{task_id}`
- **Auth**: Required
- **Description**: Removes a task.

---

## 11. Webhooks Layer (`/api/webhooks`)

### `POST /api/webhooks/external-event`
- **Description**: Receiver for external payloads (Stripe, Meta). Processes data and broadcasts WebSocket updates to the relevant user.

---

### `POST /api/webhooks/trigger-refresh`
- **Description**: Backend-initiated trigger to force a frontend page to re-fetch data. Payload: `{"page": "projects", "user_id": 1}`.

---

## 12. Real-Time WebSocket (`/ws`)

### `WebSocket ws://192.168.1.13:8000/ws?token=<JWT>`
- **Authentication**: JWT token passed as query parameter during handshake.
- **Connection Manager**: Maps `user_id → List[WebSocket]` to support multiple tabs.

#### Event Types Received by Frontend

| Event Type | Trigger | Frontend Action |
|---|---|---|
| `NEW_NOTIFICATION` | New team/job notification | Shows toast + updates bell badge |
| `REFRESH_PAGE` | Backend state change | Re-fetches jobs, team, or invites |
| `payment_success` | Subscription purchased | Updates `user.plan`, `is_pro`, `subscription_expiry` |
| `referral_reward_received` | Referred user made first purchase | Shows toast + updates referrer's `subscription_expiry` |
| `SUBSCRIPTION_UPDATED` | Admin override | Updates plan in global state |
| `TOAST` | Generic server message | Displays toast notification |

---

## Data Models Reference

### User
| Field | Type | Description |
|---|---|---|
| `id` | int | Unique user identifier |
| `username` | str | Unique login handle |
| `user_type` | str | `photographer` or `freelancer` |
| `referral_code` | str(8) | Auto-generated permanent code |
| `referred_by` | str(8) | Code applied at signup / via `/referral/apply` |
| `first_purchase_completed` | bool | Prevents double referral reward |
| `subscription_expiry` | datetime | UTC expiry of active subscription |
| `is_pro` | bool | Computed from plan status |
| `plan` | str | `trial`, `Pro`, `Enterprise` |

### Job
| Field | Type | Description |
|---|---|---|
| `id` | int | Unique job identifier |
| `user_id` | int | FK → `users.id` (the owning photographer) |
| `title` | str | Job title |
| `category` | str | Wedding, Portrait, Event, etc. |
| `roles` | str | JSON-serialized list of required roles |
| `status` | str | `open`, `assigned`, `completed` |

### Payment
| Field | Type | Description |
|---|---|---|
| `id` | int | Payment record ID |
| `user_id` | int | FK → `users.id` |
| `amount` | int | Amount in INR paise |
| `currency` | str | Default `INR` |
| `status` | str | `success`, `failed`, `pending` |
| `transaction_id` | str | Unique transaction reference |

### ReferralHistory
| Field | Type | Description |
|---|---|---|
| `id` | int | Record ID |
| `referrer_id` | int | FK → `users.id` (who shared the code) |
| `referred_user_id` | int | FK → `users.id` (who used the code) |
| `days_earned` | int | Always `15` per successful referral |

---

## Technical Standards

1. **Field Naming**: All models use `user_id` (not `studio_owner_id`) as the FK for job ownership.
2. **Validation**: All request/response shapes are strictly typed using **Pydantic** schemas in `backend/models/schemas.py`.
3. **Currency**: All monetary values are integers in **INR (₹)** — no decimals.
4. **Real-Time**: Actions affecting multiple users MUST trigger a WebSocket event via `ConnectionManager.send_personal_message()`.
5. **Referral Rule**: The referral reward (15 days) is **only distributed once** — on the referred user's first successful payment. Checked via `first_purchase_completed` flag.
6. **Anti-Abuse**: Phone numbers are registered in `IdentityOwnership` at signup. A phone cannot be reused by a different `user_id`.
7. **Layering**:
   - **Routers** → HTTP definitions and status codes only
   - **Services** → Business logic and DB calls
   - **Core** → Infrastructure (`websocket.py`, `config.py`)
   - **DB** → `SessionLocal` via `get_db` dependency
8. **Error Format**: All errors return `{"detail": "Human-readable message"}` with appropriate HTTP status codes.
9. **Postman Collection**: Auto-generated at startup via `utils/postman_generator.py` and saved to `postman.json` in the project root.
