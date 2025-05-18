import sqlite3
from typing import List, Tuple, Optional

def connect_to_db(db_name: str) -> sqlite3.Connection:
    """Establish a connection to the SQLite database."""
    try:
        connection = sqlite3.connect(db_name)
        return connection
    except sqlite3.Error as e:
        print(f"Error connecting to database: {e}")
        return None


def fetch_all_records(connection: sqlite3.Connection, query: str) -> List[Tuple]:
    """Fetch all records from the database based on the provided query."""
    cursor = connection.cursor()
    try:
        cursor.execute(query)
        records = cursor.fetchall()
        return records
    except sqlite3.Error as e:
        print(f"Error fetching records: {e}")
        return []


def close_connection(connection: sqlite3.Connection) -> None:
    """Close the database connection."""
    if connection:
        connection.close()
