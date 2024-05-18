from flask import Flask, request, jsonify
import datetime
import jwt
from flask_sqlalchemy import SQLAlchemy
import hashlib
import re  # Import regular expressions library for pattern matching
import os
SECRET_KEY = os.environ.get("SECRET_KEY", "#")

# Initialize Flask app
app = Flask(__name__)

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///bank.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

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

# API endpoint to create a new user
@app.route('/createNewUser', methods=['POST'])
def create_new_user():
    username = request.json['username']
    password = request.json['password']
    
    # Check if the password is strong enough
    if not is_password_strong(password):
        return jsonify({"error": "Password does not meet the criteria"}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({"error": "Username already exists"}), 409

    hashed_password = hashlib.md5(password.encode()).hexdigest()
    new_user = User(username=username, password=hashed_password)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "User created successfully"}), 201

# API endpoint to verify login credentials
@app.route('/login', methods=['POST'])
def login():
    username = request.json['username']
    password = request.json['password']
    hashed_password = hashlib.md5(password.encode()).hexdigest()

    user = User.query.filter_by(username=username, password=hashed_password).first()
    if user:
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


# Create a new JWT token endpoint
# @app.route('/createNewToken', methods=['POST'])
# def create_new_token():
#     username = request.json['username']
#     user = User.query.filter_by(username=username).first()
#     if user:
#         payload = {
#             'username': username,
#             'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=1)  # Token expires in 1 hour
#         }
#         token = jwt.encode(payload, SECRET_KEY, algorithm='HS256')
#         return jsonify({"token": token}), 200
#     else:
#         return jsonify({"error": "User not found"}), 404

# Verify JWT token endpoint
@app.route('/verifyToken', methods=['POST'])
def verify_token():
    token = request.json['token']
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        return jsonify({"message": "Token is valid", "username": payload['username']}), 200
    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Token has expired"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"error": "Invalid token"}), 401

# Run the Flask app
if __name__ == '__main__':
    with app.app_context():
        db.create_all()  # Create database tables
    app.run(debug=True)
