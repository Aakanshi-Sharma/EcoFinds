import sqlite3
import os
from typing import Optional

def connect_to_db(db_name: str) -> Optional[sqlite3.Connection]:
    """Establish a connection to the SQLite database."""
    try:
        connection = sqlite3.connect(db_name)
        return connection
    except sqlite3.Error as e:
        print(f"Error connecting to database: {e}")
        return None

def create_tables(connection: sqlite3.Connection) -> None:
    """Create tables in the database if they do not exist."""
    cursor = connection.cursor()
    try:
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE
            )
        ''')
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS products (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                price REAL NOT NULL
            )
        ''')
        connection.commit()
    except sqlite3.Error as e:
        print(f"Error creating tables: {e}")

def init_db(db_name: str) -> None:
    """Initialize the database by creating tables."""
    connection = connect_to_db(db_name)
    if connection:
        create_tables(connection)
        connection.close()

if __name__ == "__main__":
    db_name = os.getenv("DB_NAME", "eco_finds.db")  # Use environment variable or default
    init_db(db_name)
