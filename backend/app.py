from flask import Flask

# basic config
app = Flask(__name__)

# Default route   
@app.route("/") 
def index(): 
    return "Landing Page!"

# Dummy login route
@app.route("/login") 
def hello(): 
    return "Login"

# Running Server
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)