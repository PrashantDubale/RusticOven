"""
deps.py
-------
Shared FastAPI "dependencies" - reusable checks that run before a route's
own code, and can block the request before it ever reaches the database.

require_manager() now checks a REAL per-user JWT (issued at login by
routes/auth.py) instead of one shared passcode everyone typed in. It
reads the `Authorization: Bearer <token>` header, verifies the token's
signature and expiry, and confirms the account's role is "manager".
This replaces the old X-Manager-Passcode header entirely - a customer
account's token will always be rejected here, no matter what.

How it's used: any route that should be manager-only adds
    manager = Depends(require_manager)
as a parameter. FastAPI runs this BEFORE the route body, and raises a
401 automatically if the token is missing, invalid, expired, or
belongs to a non-manager account.
"""

from fastapi import Header, HTTPException
from jose import JWTError, jwt

from backend.routes.auth import JWT_SECRET, JWT_ALGORITHM


async def require_manager(authorization: str | None = Header(default=None)):
    """
    Reads the "Authorization" header FastAPI auto-maps from
    `authorization`, expects the format "Bearer <token>", and blocks
    the request unless the token is valid AND belongs to a manager.
    The frontend attaches this automatically once you're logged in as
    a manager - see services/api.js.
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Manager login required for this action.")

    token = authorization.removeprefix("Bearer ").strip()
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired session. Please log in again.")

    if payload.get("role") != "manager":
        raise HTTPException(status_code=401, detail="Manager access required for this action.")

    return payload
