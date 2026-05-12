# Scenario 2: Corporate Project Workflow

High-end corporate coverage workflow.

**Roles involved:** Sneha Gupta (Traditional), Vikram Singh (Candid).

---

### Step 1: Create Corporate Project
**POST** `http://192.168.1.13:8000/api/projects/`
**Raw JSON:**
```json
{
  "title": "Annual Tech Summit - Google Cloud",
  "client": "Marketing Team",
  "venue": "Grand Hyatt, Mumbai",
  "budget": 45000,
  "category": "Corporate",
  "date": "2026-10-10T10:00:00",
  "roles": ["Traditional", "Candid"]
}
```

---

### Step 2: Request Team Members (Interconnected)

#### A. Request Sneha Gupta (Traditional)
**POST** `http://192.168.1.13:8000/api/team/request`
**Raw JSON:**
```json
{
  "phone": "+919876543214",
  "display_name": "Sneha Gupta",
  "display_category": "Traditional",
  "display_city": "Delhi"
}
```

#### B. Request Vikram Singh (Candid)
**POST** `http://192.168.1.13:8000/api/team/request`
**Raw JSON:**
```json
{
  "phone": "+919876543215",
  "display_name": "Vikram Singh",
  "display_category": "Candid",
  "display_city": "Jaipur"
}
```
