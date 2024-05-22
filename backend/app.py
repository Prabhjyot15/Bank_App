from flask import Flask, request, jsonify
import datetime
import jwt
from flask_sqlalchemy import SQLAlchemy
import hashlib
import re  # Import regular expressions library for pattern matching
import os
import sqlite3
from flask_cors import CORS, cross_origin
import secrets

# Config File
SECRET_KEY =secrets.token_hex(16) 
DB_URL = 'sqlite:///bank.db'
DATABASE = './instance/bank.db'

# Initialize Flask app
app = Flask(__name__)
CORS(app)  #enabling CORS for all routes and origins

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] =  DB_URL
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)


def get_db():
    conn = sqlite3.connect(DATABASE)
    return conn

# Initialise database
def init_db():
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('''CREATE TABLE IF NOT EXISTS account (username TEXT PRIMARY KEY, amount REAL NOT NULL DEFAULT 0.0)''')
        conn.commit()

# Define the User model
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(127), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)

    def __repr__(self):
        return f'<User {self.username}>'

def is_password_strong(password):
    """ Check if the password is strong enough. """
    if len(password) < 8:
        return False  # Must be at least 8 characters
    if not re.search("[0-9]", password):
        return False  # Must contain at least one digit
    if not re.search("[a-zA-Z]", password):
        return False  # Must contain at least one letter
    if not re.search("[!@#$%^&*(),.?\":{}|<>]", password):
        return False  # Must contain at least one special character
    return True

def createUserWithEmptyBalance(username):
    with get_db() as conn:
        cursor = conn.cursor()
        amount_to_add = str(0)
        cursor.execute("INSERT INTO account (username, amount) VALUES ('" + username + "', " + amount_to_add + ")")
        conn.commit()

# API endpoint to create a new user
@app.route('/createNewUser', methods=['POST'])
def create_new_user():
    username = request.json['username']
    password = request.json['password']
    
    # Check if the password is strong enough
    if not is_password_strong(password):
        return jsonify({"error": "Password does not meet the criteria. Must be 8 characters long, 1 digit, 1 letter and 1 special char."}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({"error": "Username already exists"}), 409

    #hashed_password = hashlib.md5(password.encode()).hexdigest()
    new_user = User(username=username, password=password)
    db.session.add(new_user)
    db.session.commit()
    createUserWithEmptyBalance(username)

    return jsonify({"message": "User created successfully"}), 201

# API endpoint to verify login credentials
@app.route('/login', methods=['POST'])
def login():
    username = request.json['username']
    password = request.json['password']
    #hashed_password = hashlib.md5(password.encode()).hexdigest()

    user = User.query.filter_by(username=username, password=password).first()
    if user:
        #payload has username and expiry time check
        payload = {
            'username': username,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=1)  # Token expires in 1 hour
        }
        token = jwt.encode(payload, SECRET_KEY, algorithm='HS256')
        return jsonify({"message": "Login successful", "token": token}), 200
    else:
        return jsonify({"error": "Invalid credentials"}), 401

# API endpoint to check if a username exists
@app.route('/checkIfUserNameExists', methods=['GET'])
def check_username():
    username = request.args.get('username')
    user = User.query.filter_by(username=username).first()
    if user:
        return jsonify({"exists": True}), 200
    else:
        return jsonify({"exists": False}), 200

@app.route('/createNewToken', methods=['POST'])
def create_new_token():
    username = request.json['username']
    user = User.query.filter_by(username=username).first()
    if user:
        payload = {
            'username': username,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=1)  # Token expires in 1 hour
        }
        token = jwt.encode(payload, SECRET_KEY, algorithm='HS256')
        return jsonify({"token": token}), 200
    else:
        return jsonify({"error": "User not found"}), 404

# Verify JWT token endpoint
def verify_token(username, token):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        fetched_username = payload.get('username')
        if username != fetched_username:
            raise Exception("Invalid User")
        return jsonify({"message": "Token is valid", "username": payload['username']}), 200
    except jwt.InvalidTokenError:
        return jsonify({"error": "Invalid token"}), 401

# Add Moneys
@app.route('/add_money', methods=['POST'])
def add_money():
    data = request.get_json()
    username = data.get('username')
    amount_to_add = data.get('amount')
    if not username or amount_to_add is None:
        return jsonify({'error': 'Username and amount are required'}), 400
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('SELECT amount FROM account WHERE username = "' + username + '"')
        result = cursor.fetchone()
        if result is None:
            cursor.execute("INSERT INTO account (username, amount) VALUES ('" + username + "', " + amount_to_add + ")")
        else:
            new_amount = result[0] + amount_to_add
            cursor.execute('UPDATE account SET amount = ? WHERE username = ?', (new_amount, username))
        conn.commit()
    return jsonify({'username': username, 'new_amount': new_amount if result else amount_to_add}), 200

# Endpoint to withdraw money from a user
@app.route('/withdraw_money', methods=['POST'])
def withdraw_money():
    data = request.get_json()
    username = data.get('username')
    amount_to_withdraw = data.get('amount')
    if not username or amount_to_withdraw is None:
        return jsonify({'error': 'Username and amount are required'}), 400
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('SELECT amount FROM account WHERE username = "' + username + '"')
        result = cursor.fetchone()
        if result is None:
            return jsonify({'error': 'Username does not exist'}), 404
        current_amount = result[0]
        if current_amount < amount_to_withdraw:
            return jsonify({'error': 'Insufficient funds'}), 400
        new_amount = current_amount - amount_to_withdraw
        cursor.execute('UPDATE account SET amount = ' + str(new_amount) + ' WHERE username = "' + username + '"')
        conn.commit()
    return jsonify({'username': username, 'new_amount': new_amount}), 200

# Endpoint to transfer money to a user
@app.route('/transfer_money', methods=['POST'])
def transfer_money():
    data = request.get_json()
    sender_username = data.get('sender')
    receiver_username = data.get('receiver')
    amount_to_transfer = data.get('amount')

    if not sender_username or not receiver_username or amount_to_transfer is None:
        return jsonify({'error': 'Sender, receiver, and amount are required'}), 400
    with get_db() as conn:
        cursor = conn.cursor()
        # Check sender's balance
        query = f"SELECT amount FROM account WHERE username = '{sender_username}'"
        cursor.execute(query)
        sender_result = cursor.fetchone()
        if sender_result is None:
            return jsonify({'error': 'Sender does not exist'}), 404
        if sender_result[0] < amount_to_transfer:
            return jsonify({'error': 'Insufficient funds'}), 400
        # Check if receiver exists
        query = f"SELECT amount FROM account WHERE username = '{receiver_username}'"
        cursor.execute(query)
        receiver_result = cursor.fetchone()
        if receiver_result is None:
            return jsonify({'error': 'Receiver does not exist'}), 404
        # Perform the transfer
        new_sender_amount = sender_result[0] - amount_to_transfer
        new_receiver_amount = receiver_result[0] + amount_to_transfer
        query = f"UPDATE account SET amount = {new_sender_amount} WHERE username = '{sender_username}'"
        cursor.execute(query)
        query = f"UPDATE account SET amount = {new_receiver_amount} WHERE username = '{receiver_username}'"
        cursor.execute(query)
        conn.commit()
    return jsonify({
        'sender': sender_username,
        'sender_new_amount': new_sender_amount,
        'receiver': receiver_username,
        'receiver_new_amount': new_receiver_amount
    }), 200

# Checks current balance of a user
@app.route('/get_balance', methods=['GET'])
def get_balance():
    data = request.get_json()
    username = request.args.get('username')
    token = data.get("token")
    verify_token(username,token)
    if not username:
        return jsonify({'error': 'Username is required'}), 400
    with get_db() as conn:
        cursor = conn.cursor()
        query = f"SELECT amount FROM account WHERE username = '{username}'"
        cursor.execute(query)
        result = cursor.fetchone()
        if result is None:
            return jsonify({'error': 'Username does not exist'}), 404
        return jsonify({'username': username, 'balance': result[0]}), 200

# Run the Flask app
if __name__ == '__main__':
    init_db()
    with app.app_context():
        db.create_all()  # Create database tables
    app.run(debug=True)
