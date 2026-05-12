# Project Authentication (Signup & Login)

This file contains Signup and Login requests for all users in the system. Use these to create accounts and obtain JWT tokens for testing.

**Common Password:** `Password123!`
**Note:** All users use `"user_type": "photographer"`. The platform differentiates studio owners from team members by their relationships, not by `user_type`.

---

## 0. Primary Studio Owner (The Employer)
**Signup URL:** `http://192.168.1.13:8000/api/auth/signup`
**Raw JSON:**
```json
{
  "username": "elite_studio",
  "password": "Password123!",
  "phone": "+919999900000",
  "full_name": "Elite Photography Studio",
  "city": "Mumbai",
  "category": "Wedding",
  "user_type": "photographer",
  "referral_code_applied": ""
}
```

**Login URL:** `http://192.168.1.13:8000/api/auth/login`
**Raw JSON:**
```json
{ "username": "elite_studio", "password": "Password123!" }
```

---

## 1. Aman Sharma
**Signup URL:** `http://192.168.1.13:8000/api/auth/signup`
**Raw JSON:**
```json
{
  "username": "aman_sharma",
  "password": "Password123!",
  "phone": "+919876543211",
  "full_name": "Aman Sharma",
  "city": "Mumbai",
  "category": "Lead",
  "user_type": "photographer",
  "referral_code_applied": ""
}
```

**Login URL:** `http://192.168.1.13:8000/api/auth/login`
**Raw JSON:**
```json
{ "username": "aman_sharma", "password": "Password123!" }
```

---

## 2. Priya Patel
**Signup URL:** `http://192.168.1.13:8000/api/auth/signup`
**Raw JSON:**
```json
{
  "username": "priya_patel",
  "password": "Password123!",
  "phone": "+919876543212",
  "full_name": "Priya Patel",
  "city": "Pune",
  "category": "Cinematographer",
  "user_type": "photographer",
  "referral_code_applied": ""
}
```

**Login URL:** `http://192.168.1.13:8000/api/auth/login`
**Raw JSON:**
```json
{ "username": "priya_patel", "password": "Password123!" }
```

---

## 3. Rahul Verma
**Signup URL:** `http://192.168.1.13:8000/api/auth/signup`
**Raw JSON:**
```json
{
  "username": "rahul_verma",
  "password": "Password123!",
  "phone": "+919876543213",
  "full_name": "Rahul Verma",
  "city": "Bangalore",
  "category": "Drone",
  "user_type": "photographer",
  "referral_code_applied": ""
}
```

**Login URL:** `http://192.168.1.13:8000/api/auth/login`
**Raw JSON:**
```json
{ "username": "rahul_verma", "password": "Password123!" }
```

---

## 4. Sneha Gupta
**Signup URL:** `http://192.168.1.13:8000/api/auth/signup`
**Raw JSON:**
```json
{
  "username": "sneha_gupta",
  "password": "Password123!",
  "phone": "+919876543214",
  "full_name": "Sneha Gupta",
  "city": "Delhi",
  "category": "Traditional",
  "user_type": "photographer",
  "referral_code_applied": ""
}
```

**Login URL:** `http://192.168.1.13:8000/api/auth/login`
**Raw JSON:**
```json
{ "username": "sneha_gupta", "password": "Password123!" }
```

---

## 5. Vikram Singh
**Signup URL:** `http://192.168.1.13:8000/api/auth/signup`
**Raw JSON:**
```json
{
  "username": "vikram_singh",
  "password": "Password123!",
  "phone": "+919876543215",
  "full_name": "Vikram Singh",
  "city": "Jaipur",
  "category": "Candid",
  "user_type": "photographer",
  "referral_code_applied": ""
}
```

**Login URL:** `http://192.168.1.13:8000/api/auth/login`
**Raw JSON:**
```json
{ "username": "vikram_singh", "password": "Password123!" }
```

---

## 6. Ananya Iyer
**Signup URL:** `http://192.168.1.13:8000/api/auth/signup`
**Raw JSON:**
```json
{
  "username": "ananya_iyer",
  "password": "Password123!",
  "phone": "+919876543216",
  "full_name": "Ananya Iyer",
  "city": "Chennai",
  "category": "Reel",
  "user_type": "photographer",
  "referral_code_applied": ""
}
```

**Login URL:** `http://192.168.1.13:8000/api/auth/login`
**Raw JSON:**
```json
{ "username": "ananya_iyer", "password": "Password123!" }
```

---

## 7. Rohan Mehra
**Signup URL:** `http://192.168.1.13:8000/api/auth/signup`
**Raw JSON:**
```json
{
  "username": "rohan_mehra",
  "password": "Password123!",
  "phone": "+919876543217",
  "full_name": "Rohan Mehra",
  "city": "Mumbai",
  "category": "Creative Director",
  "user_type": "photographer",
  "referral_code_applied": ""
}
```

**Login URL:** `http://192.168.1.13:8000/api/auth/login`
**Raw JSON:**
```json
{ "username": "rohan_mehra", "password": "Password123!" }
```

---

## 8. Ishita Das
**Signup URL:** `http://192.168.1.13:8000/api/auth/signup`
**Raw JSON:**
```json
{
  "username": "ishita_das",
  "password": "Password123!",
  "phone": "+919876543218",
  "full_name": "Ishita Das",
  "city": "Hyderabad",
  "category": "Assistant",
  "user_type": "photographer",
  "referral_code_applied": ""
}
```

**Login URL:** `http://192.168.1.13:8000/api/auth/login`
**Raw JSON:**
```json
{ "username": "ishita_das", "password": "Password123!" }
```

---

## 9. Arjun Kapoor
**Signup URL:** `http://192.168.1.13:8000/api/auth/signup`
**Raw JSON:**
```json
{
  "username": "arjun_kapoor",
  "password": "Password123!",
  "phone": "+919876543219",
  "full_name": "Arjun Kapoor",
  "city": "Pune",
  "category": "Helper",
  "user_type": "photographer",
  "referral_code_applied": ""
}
```

**Login URL:** `http://192.168.1.13:8000/api/auth/login`
**Raw JSON:**
```json
{ "username": "arjun_kapoor", "password": "Password123!" }
```
