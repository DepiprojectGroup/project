import os
from flask import Flask, Blueprint
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

app = Flask(__name__)
# CORS not needed with relative URLs - all requests are same-origin
# If you need CORS for external access, specify origins explicitly:
# CORS(app, resources={r"/api/*": {"origins": ["https://yourdomain.com"], "allow_credentials": True}})
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'postgresql://postgres:1234@localhost:5432/store')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Create Blueprint for API routes
api = Blueprint('api', __name__, url_prefix='/api')