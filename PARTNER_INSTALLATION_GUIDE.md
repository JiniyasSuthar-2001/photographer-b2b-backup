# Lumière Project - Partner Installation Guide

Welcome to the Lumière project! This guide will walk you through setting up the application on your local machine so you can run it, test it, and develop it alongside the team.

## Step 1: Prerequisites
Before you start, make sure you have the following installed on your computer:
- **[Git](https://git-scm.com/downloads)**: For version control.
- **[Node.js](https://nodejs.org/)**: Recommended to use the LTS (Long Term Support) version. This is required to run the frontend.
- **[Python 3.9+](https://www.python.org/downloads/)**: Required to run the backend API.
- **[Visual Studio Code](https://code.visualstudio.com/)** (Optional but recommended): A code editor.

## Step 2: Get the Code
1. Open your terminal or command prompt.
2. Clone the repository to your local machine:
   ```bash
   git clone https://github.com/JiniyasSuthar-2001/photographer-b2b.git
   ```
3. Navigate into the project directory:
   ```bash
   cd photographer-b2b
   ```

## Step 3: Add the Manual Secure Files
Some files are excluded from Git for security and data persistence reasons (like databases and API keys). You should have received a ZIP file or a direct transfer containing these files.

Please place them exactly as outlined below:

| File | Where to put it | Description |
| :--- | :--- | :--- |
| **`.env`** | `backend/` | Environment variables (contains our API keys & secrets). |

## Step 4: Backend Setup (FastAPI)
The backend is built with Python and FastAPI.

1. Open a terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. **Create a virtual environment** to keep dependencies isolated:
   - On Windows: `python -m venv venv`
   - On Mac/Linux: `python3 -m venv venv`
3. **Activate the virtual environment**:
   - On Windows: `.\venv\Scripts\activate`
   - On Mac/Linux: `source venv/bin/activate`
4. **Install the required packages**:
   ```bash
   pip install -r requirements.txt
   ```
5. **Start the backend server**:
   ```bash
   python main.py
   ```
   *The backend is now running at `http://localhost:8000`. You can view the API documentation at `http://localhost:8000/docs`.*

   If you want teammates on the same Wi‑Fi/LAN to access your running backend, make sure the server is bound to 0.0.0.0 and use `http://192.168.1.13:8000` (replace with your machine's LAN IP).

## Step 5: Frontend Setup (React)
The frontend is built with React and Vite.

1. Open a **new, separate terminal window** (leave the backend running).
2. Navigate to the frontend folder from the root of the project:
   ```bash
   cd frontend
   ```
3. **Install the required packages**:
   ```bash
   npm install
   ```
4. **Start the frontend development server**:
   ```bash
   npm run dev
   ```
   *The frontend is now running, typically at `http://localhost:5173`. The terminal will give you the exact local link.*

## Step 6: You're Ready! 🎉
Open your browser and navigate to the local link provided by the frontend terminal (e.g., `http://localhost:5173`). 

You should now see the application running locally with real-time connections to your local backend and database!

### Troubleshooting
- **Port already in use**: If the frontend or backend complains that a port is in use, make sure you don't have another instance of the server running.
- **Missing modules**: If you get a "module not found" error in Python or Node, re-run `pip install -r requirements.txt` or `npm install` respectively.
- **API connection errors**: Ensure the backend server is running and your `backend/.env` file is placed correctly.
