# Scenario 3: Studio Team Expansion

Expanding the studio team by adding specialized creatives.

**Roles involved:** Ananya Iyer (Reel), Rohan Mehra (Creative Director).

---

### Step 1: Discover and Request New Talent

#### A. Request Ananya Iyer (Reel Expert)
**POST** `http://192.168.1.13:8000/api/team/request`
**Raw JSON:**
```json
{
  "phone": "+919876543216",
  "display_name": "Ananya Iyer",
  "display_category": "Reel",
  "display_city": "Chennai"
}
```

#### B. Request Rohan Mehra (Creative Director)
**POST** `http://192.168.1.13:8000/api/team/request`
**Raw JSON:**
```json
{
  "phone": "+919876543217",
  "display_name": "Rohan Mehra",
  "display_category": "Creative Director",
  "display_city": "Mumbai"
}
```

---

### Step 2: Verify Team List
**GET** `http://192.168.1.13:8000/api/team/`
*(Check if they appear as pending)*

---

### Step 3: Update Rohan's Display Info
**PATCH** `http://192.168.1.13:8000/api/team/{{member_id}}`
**Raw JSON:**
```json
{
  "display_name": "Rohan M. (Chief Creative)",
  "display_category": "Creative Director",
  "display_city": "Mumbai"
}
```
