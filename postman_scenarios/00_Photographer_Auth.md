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
  "email": "elite_studio@example.com",
  "phone": "+919999900000",
  "password": "Password123!",
  "confirm_password": "Password123!"
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
  "email": "aman.sharma@example.com",
  "phone": "+919876543211",
  "password": "Password123!",
  "confirm_password": "Password123!"
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
  "email": "priya.patel@example.com",
  "phone": "+919876543212",
  "password": "Password123!",
  "confirm_password": "Password123!"
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
  "email": "rahul.verma@example.com",
  "phone": "+919876543213",
  "password": "Password123!",
  "confirm_password": "Password123!"
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
  "email": "sneha.gupta@example.com",
  "phone": "+919876543214",
  "password": "Password123!",
  "confirm_password": "Password123!"
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
  "email": "vikram.singh@example.com",
  "phone": "+919876543215",
  "password": "Password123!",
  "confirm_password": "Password123!"
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
  "email": "ananya.iyer@example.com",
  "phone": "+919876543216",
  "password": "Password123!",
  "confirm_password": "Password123!"
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
  "email": "rohan.mehra@example.com",
  "phone": "+919876543217",
  "password": "Password123!",
  "confirm_password": "Password123!"
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
  "email": "ishita.das@example.com",
  "phone": "+919876543218",
  "password": "Password123!",
  "confirm_password": "Password123!"
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
  "email": "arjun.kapoor@example.com",
  "phone": "+919876543219",
  "password": "Password123!",
  "confirm_password": "Password123!"
}
```

**Login URL:** `http://192.168.1.13:8000/api/auth/login`
**Raw JSON:**
```json
{ "username": "arjun_kapoor", "password": "Password123!" }
```
