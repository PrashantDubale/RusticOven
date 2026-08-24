"""
routes/auth.py
---------------
REAL per-user authentication: every account is a row in `users`
(backend/database.py's user_collection) with an email, a name, a
role, and a bcrypt-hashed password - not a shared passcode anymore.

  POST /auth/signup -> create a CUSTOMER account (email, password, name)
  POST /auth/login  -> email + password -> { access_token, user }

Manager accounts are intentionally NOT self-serve signup (anyone
hitting /auth/signup would otherwise be able to grant themselves
manager access). They're created directly in the database - see
backend/seed_admin.py for a ready-to-run example that seeds
dubale@admin.com.

Passwords are hashed with bcrypt - never stored or returned in plain
text. On successful login we issue a short-lived JWT (see
create_access_token below) that encodes the user's id, email, and
role. The frontend attaches this as `Authorization: Bearer <token>`
on requests, and backend/deps.py's require_manager() decodes +
verifies it for manager-only routes, replacing the old shared-passcode
header.
"""

import os
from datetime import datetime, timedelta, timezone

import bcrypt
from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException
from jose import jwt
from pydantic import BaseModel, EmailStr, Field
from enum import Enum

from backend.database import user_collection

load_dotenv()

# Used to sign/verify JWTs. In production this MUST be a long random
# secret set via the environment, not the fallback below - the
# fallback only exists so the app still runs the first time you clone
# it, before you've created a .env file.
JWT_SECRET = os.getenv("JWT_SECRET", "dev-only-insecure-secret-change-me")
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days


class UserRole(str, Enum):
    customer = "customer"
    manager = "manager"


class SignupRequest(BaseModel):
    name: str
    email: EmailStr
    password: str = Field(..., min_length=8)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: str
    name: str
    email: str
    role: UserRole


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


router = APIRouter(prefix="/auth", tags=["auth"])


def hash_password(plain_password: str) -> str:
    """Hashes a password with bcrypt. bcrypt hashes are already
    salted internally, so no separate salt handling is needed."""
    return bcrypt.hashpw(plain_password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))


def create_access_token(user_id: str, email: str, role: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {"sub": user_id, "email": email, "role": role, "exp": expire}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def user_helper(doc) -> dict:
    return {
        "id": str(doc["_id"]),
        "name": doc["name"],
        "email": doc["email"],
        "role": doc["role"],
    }


@router.post("/signup", response_model=TokenResponse)
async def signup(request: SignupRequest):
    """Creates a new CUSTOMER account. Manager accounts are seeded
    directly in the database (backend/seed_admin.py), not created
    through this public endpoint."""
    existing = await user_collection.find_one({"email": request.email.lower()})
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists.")

    doc = {
        "name": request.name,
        "email": request.email.lower(),
        "password_hash": hash_password(request.password),
        "role": UserRole.customer.value,
    }
    result = await user_collection.insert_one(doc)
    new_doc = await user_collection.find_one({"_id": result.inserted_id})
    user = user_helper(new_doc)
    token = create_access_token(user["id"], user["email"], user["role"])
    return {"access_token": token, "user": user}


@router.post("/login", response_model=TokenResponse)
async def login(request: LoginRequest):
    doc = await user_collection.find_one({"email": request.email.lower()})
    # Same generic error for "no such email" and "wrong password" -
    # revealing which one it was lets an attacker enumerate valid
    # emails, so both cases return the same 401 message.
    if not doc or not verify_password(request.password, doc["password_hash"]):
        raise HTTPException(status_code=401, detail="Incorrect email or password.")

    user = user_helper(doc)
    token = create_access_token(user["id"], user["email"], user["role"])
    return {"access_token": token, "user": user}
