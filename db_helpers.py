import sqlite3
import bcrypt

DB_PATH = 'database/ecofinds.db'

def get_user_by_email(email):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT id, email, password, username FROM users WHERE email = ?", (email,))
    row = cursor.fetchone()
    conn.close()
    if row:
        return {
            "id": row[0],
            "email": row[1],
            "password": row[2],
            "username": row[3]
        }
    return None

def get_user_by_email(email):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT id, email, password, username FROM users WHERE email = ?", (email,))
    row = cursor.fetchone()
    conn.close()
    if row:
        return {
            "id": row[0],
            "email": row[1],
            "password": row[2],
            "username": row[3]
        }
    return None

def create_user(email, username, raw_password):
    hashed_password = bcrypt.hashpw(raw_password.encode('utf-8'), bcrypt.gensalt())
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("INSERT INTO users (email, password, username) VALUES (?, ?, ?)",
                       (email, hashed_password, username))
        conn.commit()
        conn.close()
        return True
    except sqlite3.IntegrityError:
        return False