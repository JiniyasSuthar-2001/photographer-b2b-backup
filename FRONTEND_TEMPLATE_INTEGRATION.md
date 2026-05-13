# Frontend Template Integration Guide

This guide describes everything you need to add to a new frontend template so it works with the Lumière backend in this repository. It is intentionally framework-agnostic and contains concrete examples for common setups (Vite/React, Create React App, Next.js, Angular). Follow the checklist and copy the code snippets into your template where appropriate.

Base backend and frontend hosts (development)
- Backend API base URL: http://192.168.1.13:8000/api
- Frontend dev origin (Vite default): http://192.168.1.13:5173
- WebSocket URL: ws://192.168.1.13:8000/ws?token=<JWT_TOKEN>

Quick checklist (do these first)
- [ ] Add an environment variable for API base URL in your template (.env).
- [ ] Add an HTTP client module (axios recommended) with Authorization header handling.
- [ ] Implement authentication pages (Login, Signup) and token storage (localStorage/sessionStorage).
- [ ] Implement protected routes wrapper that checks token presence and validity server-side by calling a protected endpoint or decoding token locally.
- [ ] Add the key pages: Dashboard, Job Hub (jobs + invites), Team management, Notifications, Analytics, Job details, Profile.
- [ ] Add a WebSocket helper for real-time events using the backend `ws` endpoint.
- [ ] Import `postman.json` into Postman to test endpoints and get example payloads.

1) Environment variables (add to your template)
- Vite (.env)
  VITE_API_BASE_URL=http://192.168.1.13:8000/api
  VITE_WS_URL=ws://192.168.1.13:8000/ws

- Create React App (.env)
  REACT_APP_API_BASE_URL=http://192.168.1.13:8000/api
  REACT_APP_WS_URL=ws://192.168.1.13:8000/ws

- Next.js (.env.local)
  NEXT_PUBLIC_API_BASE_URL=http://192.168.1.13:8000/api
  NEXT_PUBLIC_WS_URL=ws://192.168.1.13:8000/ws

- Angular (environment.ts)
  export const environment = {
    production: false,
    apiBaseUrl: 'http://192.168.1.13:8000/api',
    wsUrl: 'ws://192.168.1.13:8000/ws'
  };

2) HTTP client (recommended: axios)
- Install: `npm i axios` or `yarn add axios`
- Create a single API client file (example `src/services/api.js`) and reuse it across the app.

Example (axios) - `src/services/api.js`:

```javascript
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || process.env.REACT_APP_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Basic response interceptor to handle 401 and log errors
api.interceptors.response.use(
  r => r,
  err => {
    if (err.response && err.response.status === 401) {
      // optional: redirect to login or clear token
      localStorage.removeItem('token');
      // window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
```

Notes:
- The backend issues a JWT in the `access_token` field after login. Save `access_token` as `token` in localStorage and use it in the `Authorization` header.
- The login response model is: { access_token, token_type, user } (where `user` is a full profile object).

3) Authentication flows and storage
- Signup: POST /api/auth/signup (body: username, email, password, confirm_password, phone, full_name, optional city/category)
- Login: POST /api/auth/login (body: username, password). Response: { access_token, token_type: 'bearer', user }
- Logout: POST /api/auth/logout (protected endpoint; optional)
- Forgot password: POST /api/auth/forgot-password (body: { username })

Example Signup (frontend):

```javascript
// using api from previous snippet
const signup = async (payload) => {
  return api.post('/auth/signup', payload);
};

const login = async ({ username, password }) => {
  const res = await api.post('/auth/login', { username, password });
  const token = res.data.access_token;
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(res.data.user));
  return res.data;
};
```

4) Protected routes pattern
- Add a HOC / wrapper that checks for token and optionally verifies it with a lightweight call to a protected endpoint (e.g., GET /api/notifications/ which requires auth). If unauthorized, redirect to `/login`.

5) Key pages & components to implement (mapping to backend endpoints)
- Login.jsx / Login.tsx — POST `/api/auth/login`
- Signup.jsx / Signup.tsx — POST `/api/auth/signup`
- Dashboard.jsx — GET analytics: `/api/analytics/stats` and `/api/analytics/trends`
- JobHub.jsx (My Jobs) —
  - GET `/api/jobs/` (list owned jobs) 
  - POST `/api/jobs/` (create new job)
  - PUT `/api/jobs/{id}` (update job)
  - DELETE `/api/jobs/{id}` (delete job)
- Invites / Requests —
  - POST `/api/requests/` (send job invite)
  - GET `/api/requests/` (list invites; use query params role=sender|receiver)
  - PATCH `/api/requests/{id}` (accept/decline)
  - GET `/api/requests/accepted-jobs` (accepted jobs)
- Team Management —
  - GET `/api/team/` (list team members)
  - POST `/api/team/request` (request/invite a user to team)
  - GET `/api/team/users/search?phone=...` (search by phone)
  - PATCH `/api/team/{member_id}` (update display info)
  - DELETE `/api/team/{member_id}` (remove team member)
- Notifications —
  - GET `/api/notifications/` (list; paginated)
  - PATCH `/api/notifications/{id}/read`
  - PATCH `/api/notifications/read-all`
- Analytics —
  - GET `/api/analytics/stats`
  - GET `/api/analytics/trends`
  - GET `/api/analytics/categories`
- WebSocket Real-time — connect to `ws://192.168.1.13:8000/ws?token=<JWT>` and handle `NEW_NOTIFICATION` or custom messages

6) Data shapes (use directly in forms and UI mapping)
- Signup body: { username, password, phone, full_name, city?, category?, user_type? }
- Login body: { username, password }
- Login response: { access_token: string, token_type: string, user: UserProfile }
- UserProfile fields (important): id, username, phone, full_name, city, category, user_type, is_pro, plan, trial_days_left, subscription_expiry
- Job create: { title, category, location, date (YYYY-MM-DD), budget, description }
- Team request create: { phone, display_name, display_category, display_city }
- Job request (invite): { job_id, receiver_id, message, budget }
- Notification shape: id, title, message, redirect_to, is_read, created_at

7) WebSocket helper example (native browser)**

```javascript
// src/services/ws.js
export function createWs(token, onMessage) {
  const raw = `${(import.meta.env.VITE_WS_URL || process.env.REACT_APP_WS_URL || process.env.NEXT_PUBLIC_WS_URL)}?token=${token}`;
  const ws = new WebSocket(raw);

  ws.onopen = () => console.log('WS open');
  ws.onmessage = (ev) => {
    try {
      const data = JSON.parse(ev.data);
      onMessage && onMessage(data);
    } catch (err) {
      console.warn('WS parse failed', err);
    }
  };
  ws.onclose = () => console.log('WS closed');
  ws.onerror = (e) => console.error('WS error', e);

  return ws;
}
```

Usage: call `createWs(token, handler)` after login or when restoring session and close the socket on logout.

Server expects a JWT token query param named `token`. The WebSocket side validates it and associates the connection with a user.

8) Error handling & UX tips
- Show clear messages for 400/401/500. The backend returns FastAPI-style errors: { detail: 'message' }.
- For 401 responses, clear local token and redirect to login.
- For optimistic UI (e.g., accept invite), update the local state first but handle rollback if the request fails.

9) CORS & local-device testing
- The backend currently accepts connections (development) from `http://192.168.1.13:5173` and `*` depending on `main.py` setting. If you host the frontend on a different port or device, set `VITE_API_BASE_URL` to point to `http://192.168.1.13:8000/api` and ensure your device can reach `192.168.1.13` on your LAN.

10) Postman & API testing
- Import `postman.json` from the project root into Postman (File → Import → Choose File) — this file contains the collection generated at app startup.
- If you see malformed URLs in Postman (double slashes like `//api/auth/signup`), use the `postman_raw_requests.md` file in the repo for copy/paste bodies and the full URL `http://192.168.1.13:8000/api/auth/signup`.
- Use header `Authorization: Bearer <JWT>` for protected endpoints.

11) Routing & deep-linking
- Backend notification objects include `redirect_to` values like `/team` or `/job-hub`. Implement client-side routes that match these paths so clicking notifications navigates correctly.

12) Static assets
- If your template has an `assets` or `public` folder, put shared images referenced by the backend (logo, hero images) there and reference them from src.

13) Accessibility & internationalization
- Use semantic HTML and ARIA labels for forms (login, signup, job creation).
- Monetary values from backend are integers (INR). Format them on the client as currency (₹, thousand separators). Example: `new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount)`.

14) Example folder/file structure to add in the template

- src/
  - services/
    - api.js (axios wrapper)
    - auth.js (login/signup wrappers)
    - ws.js (WebSocket helper)
  - pages/
    - Login.jsx
    - Signup.jsx
    - Dashboard.jsx
    - Jobs/JobList.jsx
    - Jobs/JobForm.jsx
    - Requests/Invites.jsx
    - Team/TeamList.jsx
    - Notifications/Notifications.jsx
    - Analytics/Analytics.jsx
  - components/
    - ProtectedRoute.jsx
    - Header.jsx
    - Footer.jsx
    - NotificationBell.jsx
    - Pagination.jsx
  - utils/
    - date.js
    - currency.js
  - App.jsx (routing)
  - main.jsx (mount)

15) Example API calls (copy/paste)
- Login
  POST http://192.168.1.13:8000/api/auth/login
  Body: { "username": "johndoe", "password": "SecureP@ssw0rd" }

- Signup
  POST http://192.168.1.13:8000/api/auth/signup
  Body: { "username": "johndoe", "password": "SecureP@ssw0rd", "phone": "+919876543210", "full_name": "John Doe" }

- Create job
  POST http://192.168.1.13:8000/api/jobs/
  Body: { "title": "Wedding Shoot - Sharma", "category": "wedding", "location": "Pune", "date": "2026-06-15", "budget": 40000, "description": "Full day coverage" }

- Send job invite
  POST http://192.168.1.13:8000/api/requests/
  Body: { "job_id": 45, "receiver_id": 12, "message": "Would you like to shoot this wedding?", "budget": 25000 }

- Mark notification read
  PATCH http://192.168.1.13:8000/api/notifications/{id}/read
  Body: { }

-Page input fields (exact names & types)

This section lists every form/page in the frontend and the exact fields you should present, the expected JSON key names to send to the API, types, basic validation rules, and example payloads. Add these fields to your template forms exactly as named below so the backend accepts them without mapping errors.

- Login page (`/login`)
  - Method: POST `/api/auth/login`
  - Fields (form names / JSON keys):
    - username: string (required) — 3-64 chars
    - password: string (required) — min 8 chars recommended
  - Example payload: { "username": "johndoe", "password": "SecureP@ssw0rd" }

 - Signup page (`/signup`)
  - Method: POST `/api/auth/signup`
  - Fields (form names / JSON keys):
    - username: string (required) — unique
    - email: string (required) — valid email address; used for contact & recovery
    - password: string (required) — min 8 chars recommended
    - confirm_password: string (required) — should match `password` (server validates when provided)
    - phone: string (required) — E.164 or local format; used as a unique identifier
    - full_name: string (required)
    - city: string (optional)
    - category: string (optional)
    - user_type: string (optional) — defaults to 'photographer' when omitted
    - referral_code_applied: string (optional)
  - Example payload:
    { "username": "johndoe", "email": "johndoe@example.com", "password": "SecureP@ssw0rd", "confirm_password": "SecureP@ssw0rd", "phone": "+919876543210", "full_name": "John Doe", "city": "Pune", "category": "wedding" }

- Profile / Edit Profile page (`/profile`)
  - Method: (server has no explicit update route listed; create/extend as needed) – use PATCH `/api/team/{member_id}` only for team display updates; otherwise keep local UI fields aligned with `UserProfile`.
  - Suggested fields to collect and display (from `UserProfile`):
    - id: number (read-only)
    - username: string (read-only)
    - phone: string
    - full_name: string
    - city: string
    - category: string
    - user_type: string (select: 'photographer'|'freelancer')
    - is_pro: boolean (read-only)
    - plan: string (read-only)
  - Notes: store the returned user object from login into `localStorage.user` and use it to prefill profile pages.

- Job creation page (`/jobs/new`) — JobForm
  - Method: POST `/api/jobs/`
  - Fields (form names / JSON keys):
    - title: string (required)
    - category: string (required)
    - location: string (required)
    - date: string (required) — format `YYYY-MM-DD` or ISO
    - budget: integer (required) — currency in INR as integer
    - description: string (optional)
    - venue: string (optional)
    - roles: string (optional) — free-text like "2x Drone, 1x Lead"
  - Example payload:
    { "title":"Wedding Shoot - Sharma", "category":"wedding", "location":"Pune", "date":"2026-06-15", "budget":40000, "description":"Full day coverage" }

- Job edit page (`/jobs/:id/edit`)
  - Method: PUT `/api/jobs/{id}`
  - Fields: any subset of Job creation fields to update (title, location, budget, date, description, etc.)
  - Example payload to update budget and location:
    { "title": "Updated Title", "location": "Mumbai", "budget": 45000 }

- Job list / job details page (`/jobs` and `/jobs/:id`)
  - GET `/api/jobs/` (list) — no body
  - GET `/api/jobs/{id}` (detail) — implement if needed; response will include Job model fields.

- Job invite (Requests) page — Send Invite (`/requests/new`)
  - Method: POST `/api/requests/`
  - Fields:
    - job_id: integer (required) — job primary key
    - receiver_id: integer (required) — user id of the recipient
    - message: string (optional)
    - budget: integer (optional) — suggested budget
  - Example payload: { "job_id":45, "receiver_id":12, "message":"Would you like to shoot this wedding?", "budget":25000 }

- Accept / Decline invite (Requests list)
  - Method: PATCH `/api/requests/{id}`
  - Fields: { "status": "accepted" } or { "status": "declined" }

- Team invite / request page (`/team/invite`)
  - Method: POST `/api/team/request`
  - Fields:
    - phone: string (required) — phone number of the user to invite
    - display_name: string (required) — how the owner wants to display the member
    - display_category: string (required)
    - display_city: string (required)
  - Example payload: { "phone": "+919812345678", "display_name":"Studio Helper", "display_category":"Photographer", "display_city":"Mumbai" }

- Team member update page (`/team/:member_id/edit`)
  - Method: PATCH `/api/team/{member_id}`
  - Fields: any of the TeamMemberUpdate fields:
    - display_name: string (optional)
    - display_category: string (optional)
    - display_city: string (optional)
  - Example payload: { "display_name": "Senior Assistant" }

- Remove team member
  - Method: DELETE `/api/team/{member_id}` — no body required

- Users search (Add member by phone)
  - Method: GET `/api/team/users/search?phone=<number>`
  - UI: provide a search input for `phone` and show the `UserSearchResponse` fields (id, full_name, phone, city, category)

- Notifications page / NotificationBell
  - GET `/api/notifications/` — paginated list (no body)
  - PATCH `/api/notifications/{id}/read` — body: {} (empty object accepted)
  - PATCH `/api/notifications/read-all` — body: {} (empty object accepted)
  - UI: show `title`, `message`, `redirect_to` (use this to route the user), `is_read`, `created_at`.

- Payments / Subscriptions (if you expose these pages)
  - Create payment: POST `/api/payments/` (not yet included in doc — check backend service) — use `PaymentCreate` fields: amount (integer), currency (string), plan_name (string)
  - Subscription status: GET `/api/subscription/status` (if exposed) — shows `SubscriptionStatus` shape

- Referral (apply code)
  - Method: POST `/api/referral/apply` (if available) — body: { "referral_code": "CODE123" }

- Webhook testing page (admin/dev)
  - POST `/api/webhooks/external-event` — body example included in `postman_raw_requests.md`

- Small UX/validation rules to apply on pages
  - All required fields must be validated client-side before sending (non-empty, proper phone format, positive integer for budget/amount).
  - Dates: prefer `YYYY-MM-DD` or ISO formats; show user-friendly pickers and convert to API format.
  - Amounts/budgets: integers only. Strip currency symbols before sending.

 
Full form field catalog (every page — exact fields you must include)

This catalog lists every form input used across the application. For each field you get: Label (UI), JSON key to send to the backend, input type, required (Y/N), basic validation, placeholder, example, and notes.

- Login page (`/login`)
  - Username
    - key: `username`
    - type: text
    - required: Yes
    - validation: 3-64 chars, no spaces-only
    - placeholder: "Username or email"
    - example: "johndoe"
  - Password
    - key: `password`
    - type: password
    - required: Yes
    - validation: min 8 chars recommended
    - placeholder: "Password"
    - example: "SecureP@ssw0rd"

- Signup page (`/signup`)
  - Full name
    - key: `full_name`
    - type: text
    - required: Yes
    - validation: 1-100 chars
    - placeholder: "Your full name"
    - example: "John Doe"
  - Username
    - key: `username`
    - type: text
    - required: Yes
    - validation: 3-64 chars, unique
    - placeholder: "Choose a username"
    - example: "johndoe"
  - Phone
    - key: `phone`
    - type: tel
    - required: Yes
    - validation: digits only or E.164 (recommended). Use regex ^\+?[0-9]{7,15}$
    - placeholder: "+919876543210"
    - example: "+919876543210"
    - note: phone is treated as unique identifier in many flows
  - Password
    - key: `password`
    - type: password
    - required: Yes
    - validation: min 8 chars, encourage complexity
    - placeholder: "Create a password"
  - Confirm password
    - key (client): `confirm_password`
    - type: password
    - required: Yes
    - validation: must equal `password`
    - placeholder: "Confirm password"
    - note: The backend will validate `confirm_password` if it is provided. It's recommended to validate on the client and you may send `confirm_password` so the server can double-check.
  - City
    - key: `city`
    - type: text
    - required: No
    - placeholder: "City"
    - example: "Pune"
  - Category
    - key: `category`
    - type: text/select
    - required: No
    - placeholder: "e.g. wedding, portrait"
  - User type
    - key: `user_type`
    - type: select
    - required: No (defaults to 'photographer')
    - options: photographer, freelancer
  - Referral code (optional)
    - key: `referral_code_applied`
    - type: text
    - required: No

- Profile / Edit Profile (`/profile`)
  - Full name
    - key: `full_name`
    - type: text
    - required: Yes (display)
  - Phone
    - key: `phone`
    - type: tel
    - required: Yes
    - note: changes to phone may require re-verification depending on backend policies
  - City
    - key: `city`
    - type: text
  - Category
    - key: `category`
    - type: text/select
  - Display settings (for studio owners listing team members)
    - keys: `display_name`, `display_category`, `display_city` (used in team membership contexts)

- Job creation / edit (`/jobs/new`, `/jobs/:id/edit`)
  - Title
    - key: `title`
    - type: text
    - required: Yes
    - placeholder: "Job title"
    - example: "Wedding Shoot - Sharma"
  - Category
    - key: `category`
    - type: text/select
    - required: Yes
  - Location
    - key: `location`
    - type: text
    - required: Yes
  - Venue
    - key: `venue`
    - type: text
    - required: No
  - Date
    - key: `date`
    - type: date
    - required: Yes
    - validation: ISO / YYYY-MM-DD
  - Budget
    - key: `budget`
    - type: number (integer)
    - required: Yes
    - validation: >= 0
    - placeholder: "40000"
  - Roles
    - key: `roles`
    - type: text
    - required: No
    - example: "2x Drone, 1x Lead"
  - Description
    - key: `description`
    - type: textarea
    - required: No

- Job invite / request (`/requests/new`)
  - Job
    - key: `job_id`
    - type: number/select
    - required: Yes
    - note: select from owner's job list
  - Receiver
    - key: `receiver_id`
    - type: number/search-select
    - required: Yes
  - Message
    - key: `message`
    - type: textarea
    - required: No
    - example: "Would you like to shoot this wedding?"
  - Budget (suggested)
    - key: `budget`
    - type: number (integer)
    - required: No

- Accept / Decline invite action (Requests list)
  - Status
    - key: `status`
    - type: string
    - required: Yes
    - allowed: "accepted", "declined"
    - example payload: { "status": "accepted" }

- Team invite / request (`/team/invite`)
  - Phone
    - key: `phone`
    - type: tel
    - required: Yes
  - Display name
    - key: `display_name`
    - type: text
    - required: Yes
  - Display category
    - key: `display_category`
    - type: text
    - required: Yes
  - Display city
    - key: `display_city`
    - type: text
    - required: Yes

- Team member edit (`/team/:member_id/edit`)
  - Display name / category / city (any or all)
    - keys: `display_name`, `display_category`, `display_city`
    - type: text
    - required: No

- Search users (Add member flow)
  - Query param: `phone`
    - type: tel
    - required: Yes to perform search
    - response fields: `id`, `full_name`, `phone`, `city`, `category`

- Notifications actions
  - Mark single read
    - Endpoint: PATCH `/api/notifications/{id}/read`
    - Body: {} (empty object acceptable)
  - Mark all read
    - Endpoint: PATCH `/api/notifications/read-all`
    - Body: {} (empty object acceptable)

- Payments / checkout (developer page)
  - Amount
    - key: `amount`
    - type: number (integer)
    - required: Yes
  - Currency
    - key: `currency`
    - type: string
    - required: No (default INR)
  - Plan name
    - key: `plan_name`
    - type: string
    - required: Yes

- Referral apply
  - Referral code
    - key: `referral_code`
    - type: text
    - required: Yes
    - endpoint: POST `/api/referral/apply` (if available)

- Webhook / admin testing
  - Payload varies — use `postman_raw_requests.md` examples for `external-event` and `trigger-refresh`.

General notes for forms
- Always trim strings before sending.
- Convert numbers to integers (no currency symbols) before sending.
- For phone numbers prefer normalized E.164 format when possible.
 - Client-only fields that are purely UI helpers (e.g., temporary toggles) should not be sent to the API. `confirm_password` is an exception: you may send it and the server will validate it if present, but client-side validation is recommended for faster feedback.

16) Testing and verification
- After wiring the API base URL and implementing `api.js`, verify:
  - Signup works: new user record is created in the backend DB.
  - Login returns token and user object; token saved in localStorage and used on subsequent requests.
  - Protected endpoints (e.g., GET `/api/notifications/`) return 200 when token is present and 401 when token is invalid/missing.
  - WebSocket connects and receives a PONG when sending `{ type: 'PING' }`.

17) Optional improvements (future)
- Implement refresh token flow if you want long-lived sessions.
- Add a global error boundary and retry logic for important create/update actions.
- Use a state manager (Redux/Pinia/MobX) if the app grows large.
- Add unit tests for services and critical components.

18) Final checklist before shipping dev preview
- [ ] API base URL in `.env` points to `http://192.168.1.13:8000/api`.
- [ ] WebSocket URL in `.env` points to `ws://192.168.1.13:8000/ws`.
- [ ] Login and Signup components connected to `api.js`.
- [ ] Token stored securely and attached to API requests.
- [ ] ProtectedRoute redirects unauthenticated users to `/login`.
- [ ] Notification redirect `redirect_to` paths implemented in router.
- [ ] Postman collection imported (or use `postman_raw_requests.md` for bodies).

If you want, I can:
- Generate a small React/Vite starter that already wires these pieces together (API client, auth pages, protected route, WS helper) so you can drop it into your template.
- Produce an importable Postman collection with fixed raw URLs for your template.

---

Open tasks I can do next (pick one):
- Create a small React + Vite starter with the above wiring.
- Convert `postman.json` so every request has a `request.url.raw` and remove host/path arrays (automatically fix double-slash problem) and re-save the collection.
- Generate code examples for Next.js or Angular specifically.
