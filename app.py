from flask import Flask, render_template, redirect, url_for, session
from werkzeug.security import check_password_hash
from models.user_form import LoginForm
from models.register_form import RegisterForm
from db_helpers import get_user_by_email, create_user, get_products, get_categorized_products,get_all_categories, get_product_by_id, get_users_by_id
import bcrypt
from flask import request

app = Flask(__name__)
app.secret_key = 'super-secret-key'


@app.route('/login', methods=['GET', 'POST'])
def login():
    form = LoginForm()
    error = None
    if form.validate_on_submit():
        user = get_user_by_email(form.email.data)
        if user and bcrypt.checkpw(form.password.data.encode('utf-8'), user['password']):
            session['user_id'] = user['id']
            session['username'] = user['username']
            return redirect(url_for('dashboard'))
        else:
            error = "Invalid email or password"
    return render_template('login.html', form=form, error=error)


@app.route('/signup', methods=['GET', 'POST'])
def signup():
    form = RegisterForm()
    error = None
    if form.validate_on_submit():
        # Check if user already exists
        existing_user = get_user_by_email(form.email.data)
        print("")
        if existing_user:
            error = "User already exists with this email"
        else:
            # Attempt to create the user
            print("yessssssssssssssssssssssssss")
            success = create_user(
                email=form.email.data,
                username=form.username.data,
                raw_password=form.password.data
            )
            if success:
                return redirect(url_for('login'))
            else:
                error = "Failed to register user (email must be unique)"
    return render_template('signup.html', form=form, error=error)


@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('login'))


@app.route('/dashboard')
def dashboard():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    selected_id = request.args.get('category_id', type=int)
    categories = get_all_categories()
    products=get_products()
    categorized_products = get_categorized_products()

    if selected_id:
        # filter to one category only
        categorized_products = [
            c for c in categorized_products if c["id"] == selected_id
        ]

    return render_template(
        'landing.html',
        categories=categories,
        categorized_products=categorized_products,
        selected_category_id=selected_id,
        products=products
    )


@app.route('/product/<int:product_id>')
def product_detail(product_id):
    row=get_product_by_id(product_id=product_id)

    if not row:
        return "Product not found", 404

    product = {
        "title": row[0],
        "description": row[1],
        "price": row[2],
        "image": row[3],
        "category": row[4]
    }

    return render_template('product_detail.html', product=product)


@app.route('/profile')
def profile():
    if 'user_id' not in session:
        return redirect(url_for('login'))

    user_id = session['user_id']
    row=get_users_by_id(user_id)

    user = {
        "username": row[0],
        "email": row[1]
    }

    return render_template('profile.html', user=user)


# @app.route('/my-listings')
# def my_listings():
#     if 'user_id' not in session:
#         return redirect(url_for('login'))

#     conn = sqlite3.connect('database/ecofinds.db')
#     cursor = conn.cursor()
#     cursor.execute("""
#         SELECT p.id, p.title, p.price, p.image
#         FROM products p
#         JOIN product_ownership po ON po.product_id = p.id
#         WHERE po.user_id = ?
#         ORDER BY p.created_at DESC
#     """, (session['user_id'],))
#     rows = cursor.fetchall()
#     conn.close()

#     listings = [{
#         "id": row[0],
#         "title": row[1],
#         "price": row[2],
#         "image": row[3]
#     } for row in rows]

#     return render_template("my_listings.html", listings=listings)


if __name__ == '__main__':
    app.run(debug=True)
