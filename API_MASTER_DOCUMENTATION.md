# Lumière API Master Documentation

This document provides a comprehensive list of all available API endpoints for the Lumière platform, their purpose, and the exact JSON structure for requests.

**Base URL:** `http://192.168.1.13:8000/api`
**Auth:** Most endpoints require a Bearer Token: `Authorization: Bearer {{token}}`

---

## 1. Authentication & Profile

| Method | Endpoint | Purpose | JSON Structure / Body |
| :--- | :--- | :--- | :--- |
| **POST** | `/auth/signup` | Create account | `{"username": "", "email": "", "phone": "", "password": "", "confirm_password": ""}` |
| **POST** | `/auth/login` | Get JWT token | `{"username": "", "password": ""}` |
| **POST** | `/auth/forgot-password` | Reset request | `{"username": ""}` |
| **PUT** | `/auth/profile` | Update profile | `{"full_name": "", "city": "", "category": ""}` |
| **GET** | `/auth/profile` | Get profile info | None |

---

## 2. Team Management (Studio Owner Side)

| Method | Endpoint | Purpose | JSON Structure / Body |
| :--- | :--- | :--- | :--- |
| **GET** | `/team/search` | Search user | `?phone=...` or `?email=...` (Query Params) |
| **GET** | `/team/discover` | Discover users | `?city=...`, `?category=...` (Query Params) |
| **POST** | `/team/request` | Invite member | `{"phone": "", "display_name": "", "display_category": "", "display_city": ""}` |
| **PATCH** | `/team/{id}` | Edit member info | `{"display_name": "", "display_category": "", "display_city": ""}` |
| **GET** | `/team/` | List your team | None |
| **DELETE** | `/team/{id}` | Remove member | None |
| **GET** | `/team/collaborations/{id}` | Shared job history | `?page=1&limit=10` (Query Params) |

---

## 3. Team Invitations (Photographer Side)

| Method | Endpoint | Purpose | JSON Structure / Body |
| :--- | :--- | :--- | :--- |
| **GET** | `/team/requests/pending` | View invites | None |
| **PATCH** | `/team/request/{id}` | Respond | `?status=accepted` or `?status=declined` (Query Param) |
| **GET** | `/team/joined` | List joined teams | None |

---

## 4. Job & Project Management

| Method | Endpoint | Purpose | JSON Structure / Body |
| :--- | :--- | :--- | :--- |
| **POST** | `/projects/` | Create Job | `{"title": "", "client": "", "venue": "", "budget": 0, "category": "", "date": "ISO-TIMESTAMP", "roles": ["Role1", "Role2"]}` |
| **PUT** | `/projects/{id}` | Update Job | `{"title": "", "budget": 0, "venue": "", "client": ""}` |
| **GET** | `/projects/` | List your jobs | None |
| **DELETE** | `/projects/{id}` | Delete job | None |

---

## 5. Job Invitations (Workforce)

| Method | Endpoint | Purpose | JSON Structure / Body |
| :--- | :--- | :--- | :--- |
| **POST** | `/requests/` | Send Job Invite | `{"job_id": 0, "receiver_id": 0, "role": "", "budget": 0}` |
| **PATCH** | `/requests/{id}` | Accept/Decline | `?status=accepted` or `?status=declined` (Query Param) |
| **GET** | `/requests/` | Get my invites | `?role=receiver&status=pending` (Query Params) |
| **GET** | `/requests/job/{id}` | View job tracker | None |
| **GET** | `/requests/accepted-jobs` | View joined jobs | None |
| **GET** | `/requests/eligible-jobs/{id}` | Open jobs for member | None |

---

## 6. Notifications

| Method | Endpoint | Purpose | JSON Structure / Body |
| :--- | :--- | :--- | :--- |
| **PATCH** | `/notifications/{id}/read` | Mark as read | None |
| **PATCH** | `/notifications/read-all` | Mark all read | None |
| **GET** | `/notifications/` | View history | `?page=1&limit=20` (Query Params) |

---

## 7. Tasks & Notes

| Method | Endpoint | Purpose | JSON Structure / Body |
| :--- | :--- | :--- | :--- |
| **POST** | `/tasks/` | Create Task | `{"job_id": 0, "text": ""}` |
| **PUT** | `/tasks/{id}` | Update Task | `{"text": "", "completed": true}` |
| **GET** | `/tasks/` | List tasks | None |
| **DELETE** | `/tasks/{id}` | Delete task | None |

---

## 8. Subscription & Referral

| Method | Endpoint | Purpose | JSON Structure / Body |
| :--- | :--- | :--- | :--- |
| **POST** | `/subscription/purchase` | Buy Pro Plan | `{"plan_name": "Pro", "amount": 1499, "currency": "INR"}` |
| **POST** | `/referral/apply` | Apply Code | `{"referral_code": ""}` |
| **GET** | `/referral/info` | Stats | None |
| **GET** | `/subscription/status` | Expiry info | None |

---

## 9. Analytics

| Method | Endpoint | Purpose | JSON Structure / Body |
| :--- | :--- | :--- | :--- |
| **GET** | `/analytics/trends` | View graphs | `?timeframe=1M` (Query Param) |
| **GET** | `/analytics/` | KPI Stats | None |
| **GET** | `/analytics/categories` | Distribution | None |

---

## 10. Calendar & Availability

| Method | Endpoint | Purpose | JSON Structure / Body |
| :--- | :--- | :--- | :--- |
| **POST** | `/calendar/availability` | Toggle status | `{"date": "ISO-TIMESTAMP", "status": "Booked"}` |
| **GET** | `/calendar/roster` | View daily plan | None |

---

## 11. System

| Method | Endpoint | Purpose | JSON Structure / Body |
| :--- | :--- | :--- | :--- |
| **POST** | `/system/reset-db` | Reset Platform | `{}` |
| **GET** | `/` | Health Check | None |
