Backend (Flask)
================

Simple Flask backend providing authentication routes for login, register, and logout.

Routes
- POST `/api/auth/register` — body: `{ name, email, password }`
- POST `/api/auth/login` — body: `{ email, password }`
- POST `/api/auth/logout` — clears `token` cookie
- GET `/api/auth/health` — health check

Responses
- Success: `{ success: true, user: { id, email, name } }` and an `HttpOnly` cookie `token` (JWT if PyJWT available).
- Error: `{ error: string }` with an appropriate HTTP status code.

Quick Start
1) Create and activate a virtual environment (optional but recommended)
   - Windows PowerShell: `python -m venv .venv && .venv\\Scripts\\Activate.ps1`
   - macOS/Linux: `python3 -m venv .venv && source .venv/bin/activate`

2) Install dependencies
   - `pip install -r backend/requirements.txt`

3) Run the app
   - `python -c "from backend.flask_app import create_app; app = create_app(); app.run(host='127.0.0.1', port=5000, debug=True)"`
   - Or create your own run script that imports `create_app()`.

Environment Variables (optional)
- `SECRET_KEY` or `JWT_SECRET` — secret used to sign tokens (default: `dev-secret-change-me`).
- `JWT_ISSUER` — default `board-game-library`.
- `JWT_AUDIENCE` — default `board-game-client`.
- `COOKIE_SECURE` — `true` to set Secure cookies (default `false`).
- `COOKIE_SAMESITE` — cookie SameSite attribute (default `Lax`).
- `COOKIE_DOMAIN` — set cookie domain explicitly (optional).
- `CORS_ALLOW_ORIGIN` — default `*` for dev.

Notes
- A local SQLite database file `backend/users.db` is created automatically.
- Passwords are stored using a salted hash (`werkzeug.security`).
- For production, use HTTPS, strong secrets, and restrict CORS appropriately.

