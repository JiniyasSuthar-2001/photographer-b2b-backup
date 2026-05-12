import os

USERS = {
    'user_aman.md':   ('+919876543211', 'aman_sharma',   'Aman Sharma',   'Mumbai',    'Lead'),
    'user_priya.md':  ('+919876543212', 'priya_patel',   'Priya Patel',   'Pune',      'Cinematographer'),
    'user_rahul.md':  ('+919876543213', 'rahul_verma',   'Rahul Verma',   'Bangalore', 'Drone'),
    'user_sneha.md':  ('+919876543214', 'sneha_gupta',   'Sneha Gupta',   'Delhi',     'Traditional'),
    'user_vikram.md': ('+919876543215', 'vikram_singh',  'Vikram Singh',  'Jaipur',    'Candid'),
    'user_ananya.md': ('+919876543216', 'ananya_iyer',   'Ananya Iyer',   'Chennai',   'Reel'),
    'user_rohan.md':  ('+919876543217', 'rohan_mehra',   'Rohan Mehra',   'Mumbai',    'Creative Director'),
    'user_ishita.md': ('+919876543218', 'ishita_das',    'Ishita Das',    'Hyderabad', 'Assistant'),
}

def build_scenario(full_name, username, phone, city, category):
    return f"""# Test File: {full_name}

This file contains all requests related to {full_name}, including account creation, team joining, job acceptance, referral, and subscription flows.

---

## 1. Signup ({full_name})
**URL:** `http://192.168.1.13:8000/api/auth/signup`
**Method:** `POST`
**Raw JSON:**
```json
{{
  "username": "{username}",
  "password": "Password123!",
  "phone": "{phone}",
  "full_name": "{full_name}",
  "city": "{city}",
  "category": "{category}",
  "user_type": "photographer",
  "referral_code_applied": ""
}}
```
> Optionally fill `referral_code_applied` with a friend's code to register the referral relationship.

---

## 2. Login ({full_name})
**URL:** `http://192.168.1.13:8000/api/auth/login`
**Method:** `POST`
**Raw JSON:**
```json
{{
  "username": "{username}",
  "password": "Password123!"
}}
```

**Postman "Tests" Script (Automatic Token Capture):**
```javascript
var jsonData = pm.response.json();
pm.collectionVariables.set("token", jsonData.access_token);
```

---

## 3. Get Referral Info
**URL:** `http://192.168.1.13:8000/api/referral/info`
**Method:** `GET`
**Auth:** Bearer Token required
*(No body — returns referral_code, total_referrals, earned_days)*

---

## 4. Apply a Referral Code (Before First Purchase)
**URL:** `http://192.168.1.13:8000/api/referral/apply`
**Method:** `POST`
**Auth:** Bearer Token required
**Raw JSON:**
```json
{{
  "referral_code": "ABCD1234"
}}
```
> Only works before first purchase. Skip if already applied at signup.

---

## 5. Add to Team (By Studio Owner)
**URL:** `http://192.168.1.13:8000/api/team/request`
**Method:** `POST`
**Auth:** Bearer Token of the Studio Owner
**Raw JSON:**
```json
{{
  "phone": "{phone}",
  "display_name": "{full_name}",
  "display_category": "{category}",
  "display_city": "{city}"
}}
```

---

## 6. Check Pending Team Invites
**URL:** `http://192.168.1.13:8000/api/team/requests/pending`
**Method:** `GET`
**Auth:** Bearer Token required
*(No body)*

---

## 7. Accept Team Invitation
**URL:** `http://192.168.1.13:8000/api/team/request/{{request_id}}?status=accepted`
**Method:** `PATCH`
**Auth:** Bearer Token required
*(No body)*

---

## 8. Check Notifications
**URL:** `http://192.168.1.13:8000/api/notifications/`
**Method:** `GET`
**Auth:** Bearer Token required
*(No body)*

---

## 9. Check Incoming Job Invites
**URL:** `http://192.168.1.13:8000/api/requests/?role=receiver&status=pending`
**Method:** `GET`
**Auth:** Bearer Token required
*(No body)*

---

## 10. Accept Job Invite
**URL:** `http://192.168.1.13:8000/api/requests/{{job_request_id}}?status=accepted`
**Method:** `PATCH`
**Auth:** Bearer Token required
*(No body)*

---

## 11. Check Accepted Jobs
**URL:** `http://192.168.1.13:8000/api/requests/accepted-jobs`
**Method:** `GET`
**Auth:** Bearer Token required
*(No body)*

---

## 12. Verify Joined Team
**URL:** `http://192.168.1.13:8000/api/team/joined`
**Method:** `GET`
**Auth:** Bearer Token required
*(No body)*

---

## 13. Check Subscription Status
**URL:** `http://192.168.1.13:8000/api/subscription/status`
**Method:** `GET`
**Auth:** Bearer Token required
*(No body)*

---

## 14. Purchase Subscription / Upgrade
**URL:** `http://192.168.1.13:8000/api/subscription/purchase`
**Method:** `POST`
**Auth:** Bearer Token required
**Raw JSON:**
```json
{{
  "amount": 1499,
  "currency": "INR",
  "plan_name": "Pro"
}}
```
> If a referral code was applied, this triggers +15 days for the referrer via WebSocket.
"""

base = r'c:\Users\Jiniyas Suthar\OneDrive\Desktop\New folder\postman_scenarios'
for filename, (phone, username, full_name, city, category) in USERS.items():
    content = build_scenario(full_name, username, phone, city, category)
    path = os.path.join(base, filename)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'Updated {filename}')

print('Done!')
