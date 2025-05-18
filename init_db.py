import sqlite3
import os

os.makedirs("database", exist_ok=True)

conn = sqlite3.connect("database/ecofinds.db")
cursor = conn.cursor()

cursor.execute("""
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    username TEXT
)
""")

conn.commit()
conn.close()
print("Database initialized.")
