"""
seed_admin.py
-------------
A one-off script (not part of the running app) that creates a MANAGER
account directly in the database. Manager accounts are intentionally
NOT available through the public /auth/signup endpoint (see
routes/auth.py) - anyone hitting that endpoint could otherwise grant
themselves manager access. This script is the supported way to create
one instead.

Safe to run more than once: if the email already exists, it just
resets that account's password/role/name to the values below instead
of creating a duplicate.

Run it once, from the RusticOven folder:
    python -m backend.seed_admin

To seed a different manager, edit NAME/EMAIL/PASSWORD below (or copy
this file) and run it again.
"""

import asyncio

from backend.database import user_collection
from backend.routes.auth import hash_password

NAME = "Dubale"
EMAIL = "dubale@admin.com"
PASSWORD = "Admin@123"


async def seed():
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
