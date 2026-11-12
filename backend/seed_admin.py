"""
seed_admin.py
-------------
A one-off script (not part of the running app) that creates a MANAGER
account directly in the database. Manager accounts are intentionally
NOT available through the public /auth/signup endpoint (see
routes/auth.py) - anyone hitting that endpoint could otherwise grant
themselves manager access. This script is the supported way to create
one instead.

Safe to run more than once: if the email already exists, it resets that
account's password/role/name from the environment instead of creating
a duplicate. No default production credentials are shipped.

Set ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD in your shell, then run
it once from the RusticOven folder:
    python -m backend.seed_admin
"""

import asyncio
import os

from backend.database import user_collection
from backend.routes.auth import hash_password

NAME = os.getenv("ADMIN_NAME", "").strip()
EMAIL = os.getenv("ADMIN_EMAIL", "").strip()
PASSWORD = os.getenv("ADMIN_PASSWORD", "")


async def seed():
    missing = [key for key, value in (
        ("ADMIN_NAME", NAME), ("ADMIN_EMAIL", EMAIL), ("ADMIN_PASSWORD", PASSWORD)
    ) if not value]
    if missing:
        raise SystemExit(f"Set required environment variable(s): {', '.join(missing)}")
    if len(PASSWORD) < 12:
        raise SystemExit("ADMIN_PASSWORD must be at least 12 characters long")

    doc = {
        "name": NAME,
        "email": EMAIL.lower(),
        "password_hash": hash_password(PASSWORD),
        "role": "manager",
    }
    result = await user_collection.update_one(
        {"email": EMAIL.lower()},
        {"$set": doc},
        upsert=True,
    )
    if result.upserted_id:
        print(f"Created manager account: {EMAIL}")
    else:
        print(f"Manager account already existed - password/role reset: {EMAIL}")


if __name__ == "__main__":
    asyncio.run(seed())
