import os
import sqlite3
from datetime import datetime, timedelta, timezone

from flask import Blueprint, current_app, jsonify, make_response, request
from werkzeug.security import generate_password_hash, check_password_hash

try:
    import jwt  # PyJWT
except Exception:  # Fallback if dependency missing; tokens will be simple placeholders
    jwt = None


bp = Blueprint("auth", __name__, url_prefix="/api/auth")


DB_PATH = os.path.join(os.path.dirname(__file__), "users.db")


def _get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def _init_db():
    conn = _get_db()
    try:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT NOT NULL UNIQUE,
                name TEXT NOT NULL,
                password_hash TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
            """
        )
        conn.commit()
    finally:
        conn.close()


def _issue_token(user_id: int, email: str, name: str) -> str:
    secret = (current_app.config.get("SECRET_KEY") or os.environ.get("JWT_SECRET") or "dev-secret-change-me").encode()
    issuer = os.environ.get("JWT_ISSUER", "board-game-library")
    audience = os.environ.get("JWT_AUDIENCE", "board-game-client")
    now = datetime.now(timezone.utc)
    exp = now + timedelta(days=7)

    payload = {
        "iss": issuer,
        "aud": audience,
        "iat": int(now.timestamp()),
        "nbf": int(now.timestamp()),
        "exp": int(exp.timestamp()),
        "sub": str(user_id),
        "email": email,
        "name": name,
        "roles": [],
    }

    if jwt is None:
        # Minimal non-JWT fallback token (not verifiable by other stacks)
        # Format: user_id|exp_epoch
        return f"{user_id}|{int(exp.timestamp())}"

    return jwt.encode(payload, secret, algorithm="HS256")


def _set_auth_cookie(resp, token: str):
    # Cookie attributes
    secure = os.environ.get("COOKIE_SECURE", "false").lower() in {"1", "true", "yes"}
    same_site = os.environ.get("COOKIE_SAMESITE", "Lax")  # Lax is reasonable for typical auth
    domain = os.environ.get("COOKIE_DOMAIN")  # Optional explicit domain
    resp.set_cookie(
        "token",
        token,
        httponly=True,
        secure=secure,
        samesite=same_site,
        domain=domain,
        path="/",
        max_age=7 * 24 * 60 * 60,
    )


def _verify_token_from_request():
    token = request.cookies.get("token")
    if not token:
        return None

    if jwt is not None:
        try:
            secret = (current_app.config.get("SECRET_KEY") or os.environ.get("JWT_SECRET") or "dev-secret-change-me").encode()
            issuer = os.environ.get("JWT_ISSUER", "board-game-library")
            audience = os.environ.get("JWT_AUDIENCE", "board-game-client")
            payload = jwt.decode(token, secret, algorithms=["HS256"], issuer=issuer, audience=audience)
            user_id = int(payload.get("sub"))
        except Exception:
            return None
    else:
        # Fallback token: user_id|exp
        try:
            user_id_str, exp_str = token.split("|", 1)
            if int(exp_str) < int(datetime.now(timezone.utc).timestamp()):
                return None
            user_id = int(user_id_str)
        except Exception:
            return None

    # Load user
    conn = _get_db()
    try:
        cur = conn.execute("SELECT id, email, name FROM users WHERE id = ?", (user_id,))
        row = cur.fetchone()
        if row is None:
            return None
        return {"id": row["id"], "email": row["email"], "name": row["name"]}
    finally:
        conn.close()


@bp.before_app_request
def ensure_db():
    _init_db()


@bp.route("/register", methods=["POST"])
def register():
    try:
        data = request.get_json(silent=True) or {}
        name = (data.get("name") or "").strip()
        email = (data.get("email") or "").strip().lower()
        password = (data.get("password") or "").strip()

        if not name or not email or not password:
            return jsonify({"error": "Missing required fields."}), 400
        if len(password) < 8:
            return jsonify({"error": "Password must be at least 8 characters."}), 400

        conn = _get_db()
        try:
            # Check existing
            cur = conn.execute("SELECT id FROM users WHERE email = ?", (email,))
            if cur.fetchone() is not None:
                return jsonify({"error": "Email already registered."}), 409

            pwd_hash = generate_password_hash(password)
            now_iso = datetime.utcnow().isoformat() + "Z"
            cur = conn.execute(
                "INSERT INTO users (email, name, password_hash, created_at) VALUES (?, ?, ?, ?)",
                (email, name, pwd_hash, now_iso),
            )
            conn.commit()
            user_id = cur.lastrowid
        finally:
            conn.close()

        token = _issue_token(user_id, email, name)
        resp = make_response(
            jsonify(
                {
                    "success": True,
                    "user": {"id": user_id, "email": email, "name": name},
                }
            ),
            201,
        )
        _set_auth_cookie(resp, token)
        return resp
    except Exception as e:
        current_app.logger.exception("Registration error")
        return jsonify({"error": "Server error"}), 500


@bp.route("/login", methods=["POST"])
def login():
    try:
        data = request.get_json(silent=True) or {}
        email = (data.get("email") or "").strip().lower()
        password = (data.get("password") or "").strip()

        if not email or not password:
            return jsonify({"error": "Missing email or password."}), 400

        conn = _get_db()
        try:
            cur = conn.execute("SELECT id, email, name, password_hash FROM users WHERE email = ?", (email,))
            row = cur.fetchone()
        finally:
            conn.close()

        if row is None:
            return jsonify({"error": "Invalid credentials."}), 401
        if not check_password_hash(row["password_hash"], password):
            return jsonify({"error": "Invalid credentials."}), 401

        token = _issue_token(row["id"], row["email"], row["name"])
        resp = make_response(
            jsonify(
                {
                    "success": True,
                    "user": {"id": row["id"], "email": row["email"], "name": row["name"]},
                }
            )
        )
        _set_auth_cookie(resp, token)
        return resp
    except Exception:
        current_app.logger.exception("Login error")
        return jsonify({"error": "Server error"}), 500


@bp.route("/logout", methods=["POST"])
def logout():
    # Clear cookie
    resp = make_response(jsonify({"success": True}))
    resp.delete_cookie("token", path="/")
    return resp


@bp.route("/health", methods=["GET"])  # Simple health check
def health():
    return jsonify({"status": "ok"})


@bp.route("/me", methods=["GET"])  # Current user info
def me():
    user = _verify_token_from_request()
    if not user:
        return jsonify({"authenticated": False}), 401
    return jsonify({"authenticated": True, "user": user})
