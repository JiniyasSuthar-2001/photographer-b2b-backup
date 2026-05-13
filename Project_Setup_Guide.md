# Lumière Project: Installation & Setup Guide

This guide provides step-by-step instructions for setting up the Lumière platform on a new machine (Windows/macOS/Linux) after pulling the latest changes from the repository.

---

## 1. Prerequisites
Ensure the following are installed on your system:
- **Node.js** (v18 or higher)
- **Python** (v3.9 or higher)
- **Git**

---

## 2. Getting Started

### Step 1: Clone or Pull the Repository
If you haven't cloned the repo yet:
```bash
git clone https://github.com/JiniyasSuthar-2001/photographer-b2b.git
cd photographer-b2b
```
If you already have it, ensure you have the latest updates:
```bash
git pull origin main
```

---

## 3. Backend Setup (FastAPI)

Navigate to the root directory of the project.

### Step 2: Create a Virtual Environment (Recommended)
```bash
python -m venv venv
```
Activate the environment:
- **Windows**: `venv\Scripts\activate`
- **macOS/Linux**: `source venv/bin/activate`

### Step 3: Install Dependencies
```bash
pip install -r backend/requirements.txt
```

### Step 4: Run Database Seeder (Initial Setup Only)
To populate the app with demo data (Photographers, Jobs, etc.):
```bash
python backend/seed_db.py
```

### Step 5: Start the Backend Server
```bash
python backend/main.py
```
The API will be available at: `http://localhost:8000` (or on your LAN at `http://192.168.1.13:8000` if the backend is bound to 0.0.0.0).
Swagger Documentation: `http://localhost:8000/docs` (or `http://192.168.1.13:8000/docs` for LAN access)

---

## 4. Frontend Setup (React + Vite)

Open a new terminal window/tab.

### Step 6: Install Frontend Dependencies
```bash
cd frontend
npm install
```

### Step 7: Start the Development Server
```bash
npm run dev
```
The application will be available at: `http://localhost:5173`

---

## 5. Using the Project

### Demo Accounts
You can log in with the following demo credentials after running the seeder:
- **Admin/Photographer**: `admin` / `admin@001`
- **Freelancer**: `freelancer1` / `password123`

### Real-Time Features
The project uses WebSockets for real-time notifications and page refreshes. Ensure both the Backend and Frontend are running simultaneously for these features to work.

### Troubleshooting
- **CORS Errors**: Ensure the backend is running on port 8000.
- **Missing Data**: Run `python backend/seed_db.py` to reset the local SQLite database.
- **Node Modules**: If the frontend fails to start, delete `node_modules` and run `npm install` again.

---

## 6. Project Architecture Reference
- **Backend**: FastAPI, SQLite (lumiere.db), SQLAlchemy, WebSockets.
- **Frontend**: React, Vite, Context API, Lucide Icons.
- **Documentation**: See `Backend_API_Documentation.md` for full endpoint details.
