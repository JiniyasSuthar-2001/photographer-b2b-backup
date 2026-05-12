# Scenario 1: Wedding Event Workflow

This workflow covers the full lifecycle of a Wedding project, including requesting team members from the pre-defined list.

**Roles involved:** Aman Sharma (Lead), Priya Patel (Cinematographer), Rahul Verma (Drone).

---

### Step 1: Create the Wedding Project
**POST** `http://192.168.1.13:8000/api/projects/`
**Raw JSON:**
```json
{
  "title": "Royal Udaipur Wedding - Singh Family",
  "client": "Harsh Singh",
  "venue": "City Palace, Udaipur",
  "budget": 125000,
  "category": "Wedding",
  "date": "2026-11-15T09:00:00",
  "roles": ["Lead", "Cinematographer", "Drone"]
}
```

---

### Step 2: Request Team Members (Interconnected)

#### A. Request Aman Sharma (Lead)
**POST** `http://192.168.1.13:8000/api/team/request`
**Raw JSON:**
```json
{
  "phone": "+919876543211",
  "display_name": "Aman Sharma",
  "display_category": "Lead",
  "display_city": "Mumbai"
}
```

#### B. Request Priya Patel (Cinematographer)
**POST** `http://192.168.1.13:8000/api/team/request`
**Raw JSON:**
```json
{
  "phone": "+919876543212",
  "display_name": "Priya Patel",
  "display_category": "Cinematographer",
  "display_city": "Pune"
}
```

---

### Step 3: Create Pre-Event Tasks
**POST** `http://192.168.1.13:8000/api/tasks/`
**Raw JSON:**
```json
{
  "jobId": 1,
  "text": "Coordinate travel for Aman and Priya"
}
```
