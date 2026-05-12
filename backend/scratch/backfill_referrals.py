import sqlite3
import os
import random

def generate_referral_code(length=8):
    chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
    return ''.join(random.choice(chars) for _ in range(length))

db_path = "backend/lumiere.db"

if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # 1. Update existing users who have NULL referral_code
    cursor.execute("SELECT id FROM users WHERE referral_code IS NULL")
    users_without_code = cursor.fetchall()
    
    for (user_id,) in users_without_code:
        code = generate_referral_code()
        # Ensure uniqueness
        while True:
            cursor.execute("SELECT id FROM users WHERE referral_code = ?", (code,))
            if not cursor.fetchone():
                break
            code = generate_referral_code()
        
        print(f"Assigning referral code {code} to user ID {user_id}")
        cursor.execute("UPDATE users SET referral_code = ? WHERE id = ?", (code, user_id))
    
    conn.commit()
    conn.close()
    print("User referral code backfill completed.")
else:
    print("Database file not found.")
