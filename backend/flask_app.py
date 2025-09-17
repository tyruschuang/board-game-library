from flask import Flask
from . import flask_pages
import os

try:
    from . import flask_auth
except Exception:
    flask_auth = None

def create_app():
    app = Flask(__name__)

    # Basic secret for sessions/cookies if used
    app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY") or os.environ.get("JWT_SECRET") or "dev-secret-change-me"

    app.register_blueprint(flask_pages.bp)
    if flask_auth is not None:
        app.register_blueprint(flask_auth.bp)
    return app
