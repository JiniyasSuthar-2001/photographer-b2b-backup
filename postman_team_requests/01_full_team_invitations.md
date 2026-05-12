# Team Request Testing — All 9 Photographers

This directory contains ready-to-use Postman requests for building the full team roster.

**How to use:**
1. Log in as `elite_studio` (Studio Owner) and save the token.
2. Run each request below using that token to invite each photographer.
3. Then log in as each photographer and accept their pending invitation.

---

## Studio Owner Login (Do This First)
**POST** `http://192.168.1.13:8000/api/auth/login`
```json
{
  "username": "elite_studio",
  "password": "Password123!"
}
```
> Save `access_token` as `{{token}}` in your Postman Collection Variables.

---

## Send Team Invitations (As Studio Owner)

### 1. Invite Aman Sharma (Lead)
**POST** `http://192.168.1.13:8000/api/team/request`
```json
{
  "phone": "+919876543211",
  "display_name": "Aman Sharma",
  "display_category": "Lead",
  "display_city": "Mumbai"
}
```

### 2. Invite Priya Patel (Cinematographer)
**POST** `http://192.168.1.13:8000/api/team/request`
```json
{
  "phone": "+919876543212",
  "display_name": "Priya Patel",
  "display_category": "Cinematographer",
  "display_city": "Pune"
}
```

### 3. Invite Rahul Verma (Drone)
**POST** `http://192.168.1.13:8000/api/team/request`
```json
{
  "phone": "+919876543213",
  "display_name": "Rahul Verma",
  "display_category": "Drone",
  "display_city": "Bangalore"
}
```

### 4. Invite Sneha Gupta (Traditional)
**POST** `http://192.168.1.13:8000/api/team/request`
```json
{
  "phone": "+919876543214",
  "display_name": "Sneha Gupta",
  "display_category": "Traditional",
  "display_city": "Delhi"
}
```

### 5. Invite Vikram Singh (Candid)
**POST** `http://192.168.1.13:8000/api/team/request`
```json
{
  "phone": "+919876543215",
  "display_name": "Vikram Singh",
  "display_category": "Candid",
  "display_city": "Jaipur"
}
```

### 6. Invite Ananya Iyer (Reel)
**POST** `http://192.168.1.13:8000/api/team/request`
```json
{
  "phone": "+919876543216",
  "display_name": "Ananya Iyer",
  "display_category": "Reel",
  "display_city": "Chennai"
}
```

### 7. Invite Rohan Mehra (Creative Director)
**POST** `http://192.168.1.13:8000/api/team/request`
```json
{
  "phone": "+919876543217",
  "display_name": "Rohan Mehra",
  "display_category": "Creative Director",
  "display_city": "Mumbai"
}
```

### 8. Invite Ishita Das (Assistant)
**POST** `http://192.168.1.13:8000/api/team/request`
```json
{
  "phone": "+919876543218",
  "display_name": "Ishita Das",
  "display_category": "Assistant",
  "display_city": "Hyderabad"
}
```

### 9. Invite Arjun Kapoor (Helper)
**POST** `http://192.168.1.13:8000/api/team/request`
```json
{
  "phone": "+919876543219",
  "display_name": "Arjun Kapoor",
  "display_category": "Helper",
  "display_city": "Pune"
}
```

---

## Accept Invitations (As Each Photographer)

> For each photographer:
> 1. Login as them → save their token
> 2. `GET /api/team/requests/pending` → note the `id`
> 3. `PATCH /api/team/request/{id}?status=accepted`

### Check Pending (any photographer)
**GET** `http://192.168.1.13:8000/api/team/requests/pending`
*(Auth: Bearer Token of the photographer)*

### Accept Invite
**PATCH** `http://192.168.1.13:8000/api/team/request/{{request_id}}?status=accepted`
*(Auth: Bearer Token of the photographer — no body needed)*

### Verify Studio Membership
**GET** `http://192.168.1.13:8000/api/team/joined`
*(Auth: Bearer Token of the photographer — should now show elite_studio)*

---

## Verify Team from Studio Owner Side

### View Full Team Roster
**GET** `http://192.168.1.13:8000/api/team/`
*(Auth: Bearer Token of elite_studio — shows all 9 members with jobsCompleted count)*

---

## Optional: Update Display Info
**PATCH** `http://192.168.1.13:8000/api/team/{{member_id}}`
*(Auth: Bearer Token of elite_studio)*
```json
{
  "display_name": "Aman Sharma (Lead)",
  "display_category": "Lead",
  "display_city": "Mumbai"
}
```

---

## Optional: Remove a Team Member
**DELETE** `http://192.168.1.13:8000/api/team/{{member_id}}`
*(Auth: Bearer Token of elite_studio — no body needed)*
