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

def get_users_by_id(user_id):
    conn = sqlite3.connect('database/ecofinds.db')
    cursor = conn.cursor()

    cursor.execute("SELECT username, email FROM users WHERE id = ?", (user_id,))
    row = cursor.fetchone()
    conn.close()
    return row

def get_all_users():
    conn = sqlite3.connect('database/ecofinds.db')
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM users")
    rows = cursor.fetchall()
    conn.close()
    return [{"id": row[0], "name": row[1] , "sads":row[2]} for row in rows]

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
    # hashed_password=raw_password
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
    
def delete_users(user_id):
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("DELETE FROM users WHERE id =?",
                       (user_id,))
        conn.commit()
        conn.close()
        return True
    except sqlite3.IntegrityError:
        return False

def get_product_by_id(product_id:str):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        SELECT p.title, p.description, p.price, p.image, c.name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.id = ?
    """, (product_id,))
    row = cursor.fetchone()
    conn.close()
    return row
    
def get_products():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        SELECT p.id, p.title, p.price, p.image FROM products p
        ORDER BY p.created_at DESC
    """)
    rows = cursor.fetchall()
    products = [{"id": r[0], "title": r[1], "price": r[2], "image": r[3]} for r in rows]
    conn.close()
    return products
def add_category(name):
    try:
        conn = sqlite3.connect('database/ecofinds.db')
        cursor = conn.cursor()
        cursor.execute("INSERT OR IGNORE INTO categories (name) VALUES (?)", (name,))
        conn.commit()
        conn.close()
        return True
    except Exception as e:
        print(f"Error adding category: {e}")
        return False

def get_all_categories():
    conn = sqlite3.connect('database/ecofinds.db')
    cursor = conn.cursor()
    cursor.execute("SELECT id, name FROM categories ORDER BY name ASC")
    rows = cursor.fetchall()
    conn.close()
    return [{"id": row[0], "name": row[1]} for row in rows]


def add_product(product_data):
    try:
        conn = sqlite3.connect('database/ecofinds.db')
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO products (title, description, category_id, price, image)
            VALUES (?, ?, ?, ?, ?)
        """, (
            product_data['title'],
            product_data.get('description', ''),
            product_data['category_id'],
            product_data['price'],
            product_data.get('image', '/static/placeholder.jpg')
        ))
        conn.commit()
        conn.close()
        return True
    except Exception as e:
        print(f"Error adding product: {e}")
        return False
    
def get_categorized_products():
    import sqlite3
    conn = sqlite3.connect('database/ecofinds.db')
    cursor = conn.cursor()

    cursor.execute("SELECT id, name FROM categories ORDER BY name ASC")
    categories = cursor.fetchall()

    categorized_products = []
    for cat_id, cat_name in categories:
        cursor.execute("""
            SELECT id, title, price, image FROM products
            WHERE category_id = ?
            ORDER BY created_at DESC
        """, (cat_id,))
        products = cursor.fetchall()

        product_list = [
            {
                "id": p[0],
                "title": p[1],
                "price": p[2],
                "image": p[3]
            }
            for p in products
        ]

        categorized_products.append({
            "id": cat_id,
            "name": cat_name,
            "products": product_list
        })

    conn.close()
    return categorized_products



if __name__=="__main__":
    # add_category("Foods")
    print(get_all_users())
    

