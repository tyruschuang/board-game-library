from flask import Blueprint

bp = Blueprint("pages", __name__)

@bp.route("/")
def home():
    return "Hello, Home!"

@bp.route("/docs")
def docs():
    return "Hello, Docs!"

@bp.route("/pricing")
def pricing():
    return "Hello, Pricing!"

@bp.route("/blog")
def blog():
    return "Hello, Blog!"

@bp.route("/about")
def about():
    return "Hello, About!"