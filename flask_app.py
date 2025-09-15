from flask import Flask
import flask_pages

def create_app():
    app = Flask(__name__)

    app.register_blueprint(flask_pages.bp)
    return app