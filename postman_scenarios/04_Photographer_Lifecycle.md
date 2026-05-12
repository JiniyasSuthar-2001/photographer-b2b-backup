# Scenario 4: Photographer Lifecycle

Testing the workflow from the perspective of an assistant.

**Role involved:** Ishita Das (Assistant).

---

### Step 1: Studio Owner adds Ishita Das
**POST** `http://192.168.1.13:8000/api/team/request`
**Raw JSON:**
```json
{
  "phone": "+919876543218",
  "display_name": "Ishita Das",
  "display_category": "Assistant",
  "display_city": "Hyderabad"
}
```

---

### Step 2: Photographer Login (Ishita)
**POST** `http://192.168.1.13:8000/api/auth/login`
**Raw JSON:**
```json
{
  "username": "ishita_das",
  "password": "Password123!"
}
```

---

### Step 3: Check Dashboard Summary
**GET** `http://192.168.1.13:8000/api/dashboard/summary?role=freelancer`
*(Note: 'freelancer' is the role used in the backend for photographers)*
