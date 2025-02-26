from flask import Flask, send_from_directory, jsonify
from flask_cors import CORS
import os

app = Flask(__name__, static_folder="frontend/build", static_url_path="")
CORS(app)  # Allows React to make requests to Flask

# API Route Example
@app.route("/api/data")
def get_data():
    return jsonify({"message": "Hello from Flask!"})

# Serve React Frontend
@app.route("/")
@app.route("/<path:path>")
def serve_react_app(path="index.html"):
    print(path)
    return send_from_directory(app.static_folder, path)

if __name__ == "__main__":
    app.run(debug=True)
