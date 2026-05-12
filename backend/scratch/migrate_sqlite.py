"""
Migration: Rename studio_owner_id -> user_id in jobs table
and add all missing columns to users table.
"""
import sqlite3
import random

DB_PATH = "lumiere.db"

def generate_referral_code(length=8):
    chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
    return ''.join(random.choice(chars) for _ in range(length))

conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

# ── 1. Check if jobs still uses studio_owner_id ──────────────────────────────
cursor.execute("PRAGMA table_info(jobs)")
job_cols = [c[1] for c in cursor.fetchall()]
print("Current jobs columns:", job_cols)

if "studio_owner_id" in job_cols and "user_id" not in job_cols:
    print("Renaming studio_owner_id -> user_id in jobs table...")
    # SQLite doesn't support RENAME COLUMN before 3.25, so we rebuild
    cursor.execute("""
        CREATE TABLE jobs_new (
            id INTEGER PRIMARY KEY,
            title VARCHAR,
            client VARCHAR,
            date DATETIME,
            user_id INTEGER REFERENCES users(id),
            category VARCHAR,
            status VARCHAR DEFAULT 'open',
            budget INTEGER DEFAULT 0,
            location VARCHAR,
            venue VARCHAR,
            roles VARCHAR
        )
    """)
    cursor.execute("""
        INSERT INTO jobs_new (id, title, client, date, user_id, category, status, budget, location, venue, roles)
        SELECT id, title, client, date, studio_owner_id, category, status, budget, location, venue, roles
        FROM jobs
    """)
    cursor.execute("DROP TABLE jobs")
    cursor.execute("ALTER TABLE jobs_new RENAME TO jobs")
    print("jobs table migrated successfully.")
elif "user_id" in job_cols:
    print("jobs.user_id already exists — skipping.")
else:
    print("WARNING: Neither studio_owner_id nor user_id found in jobs!")

# ── 2. Ensure all new user columns exist ─────────────────────────────────────
cursor.execute("PRAGMA table_info(users)")
user_cols = [c[1] for c in cursor.fetchall()]

new_user_columns = [
    ("subscription_expiry", "DATETIME"),
    ("referral_code", "VARCHAR(8)"),
    ("referred_by", "VARCHAR(8)"),
    ("first_purchase_completed", "BOOLEAN DEFAULT 0"),
    ("is_pro", "BOOLEAN DEFAULT 0"),
    ("plan", "VARCHAR DEFAULT 'Starter'"),
    ("is_on_trial", "BOOLEAN DEFAULT 1"),
    ("trial_days_left", "INTEGER DEFAULT 14"),
    ("active_devices", "INTEGER DEFAULT 0"),
]

for col_name, col_type in new_user_columns:
    if col_name not in user_cols:
        print(f"Adding users.{col_name}...")
        try:
            cursor.execute(f"ALTER TABLE users ADD COLUMN {col_name} {col_type}")
        except Exception as e:
            print(f"  Error: {e}")

# ── 3. Backfill referral_code for users who don't have one ───────────────────
cursor.execute("SELECT id FROM users WHERE referral_code IS NULL OR referral_code = ''")
users_needing_code = cursor.fetchall()
print(f"Users needing referral code: {len(users_needing_code)}")

existing_codes = set()
cursor.execute("SELECT referral_code FROM users WHERE referral_code IS NOT NULL")
existing_codes = {row[0] for row in cursor.fetchall()}

for (user_id,) in users_needing_code:
    code = generate_referral_code()
    while code in existing_codes:
        code = generate_referral_code()
    existing_codes.add(code)
    cursor.execute("UPDATE users SET referral_code = ? WHERE id = ?", (code, user_id))
    print(f"  User {user_id} → {code}")

# ── 4. Verify ─────────────────────────────────────────────────────────────────
conn.commit()

cursor.execute("PRAGMA table_info(jobs)")
print("\nFinal jobs columns:", [c[1] for c in cursor.fetchall()])

cursor.execute("PRAGMA table_info(users)")
print("Final users columns:", [c[1] for c in cursor.fetchall()])

conn.close()
print("\nMigration complete!")
