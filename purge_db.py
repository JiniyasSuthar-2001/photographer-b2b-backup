import sqlite3
import os

def purge_database():
    db_path = "lumiere.db"
    if not os.path.exists(db_path):
        print("Database not found.")
        return

    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()

        # Tables to clear
        tables = [
            "jobs", 
            "job_requests", 
            "assignments", 
            "team", 
            "notifications", 
            "team_requests"
        ]

        for table in tables:
            try:
                cursor.execute(f"DELETE FROM {table}")
                print(f"Cleared table: {table}")
            except sqlite3.OperationalError as e:
                print(f"Skip table {table}: {e}")

        # Delete all users EXCEPT the admin
        cursor.execute("DELETE FROM users WHERE username NOT IN ('admin', 'admin01', 'admin02')")
        print("Cleared non-admin users.")

        conn.commit()
        conn.close()
        print("\nDatabase purged successfully. Only core admin accounts remain.")
    except Exception as e:
        print(f"Error purging database: {e}")

if __name__ == "__main__":
    purge_database()
