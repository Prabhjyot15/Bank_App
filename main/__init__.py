from flask import Flask

app = Flask(__name__)

@app.route("/login") 
def hello(): 
    return "Login"
    
@app.route("/") 
def index(): 
    return "Landing Page!"


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)