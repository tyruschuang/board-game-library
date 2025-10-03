import os
import sys
import importlib.util

from flask import Flask, request, make_response

from . import auth
from . import bgg

app = Flask(__name__)

# Basic secret for sessions/cookies if used
app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY") or os.environ.get("JWT_SECRET") or "dev-secret-change-me"

if auth is not None:
    app.register_blueprint(auth.bp)
if bgg is not None:
    app.register_blueprint(bgg.bp)

def create_app():
    return app


@app.before_request
def handle_preflight():
    # Ensure CORS preflight (OPTIONS) returns an OK status
    if request.method == "OPTIONS":
        # Empty 204 response; CORS headers will be appended in after_request
        return make_response("", 204)


@app.after_request
def add_cors_headers(resp):
    # CORS for local dev with credentialed requests
    origin = request.headers.get("Origin")
    allow_env = os.environ.get("CORS_ALLOW_ORIGIN")  # e.g., http://localhost:3000

    if allow_env:
        allow_origin = allow_env
    elif origin:
        allow_origin = origin
    else:
        allow_origin = "*"

    # IMPORTANT: When sending credentials, browsers reject wildcard origin.
    if allow_origin == "*" and origin:
        allow_origin = origin

    # Set headers explicitly
    resp.headers["Access-Control-Allow-Origin"] = allow_origin
    resp.headers["Vary"] = "Origin"
    resp.headers["Access-Control-Allow-Credentials"] = "true"
    resp.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    resp.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    resp.headers["Access-Control-Expose-Headers"] = "Content-Type"

    return resp
