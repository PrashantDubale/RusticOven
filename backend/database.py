"""
database.py
------------
This file's ONLY job is: connect to MongoDB, and hand out that connection
to the rest of the app. Nothing else lives here.

Why a separate file for this?
Because tomorrow you might switch from local MongoDB to MongoDB Atlas
(the cloud version), or add a test database. If the connection code is
scattered across every file, you'd have to change it in 10 places.
Keep it in one place, and every other file just imports from here.

Why "motor" instead of "pymongo"?
pymongo is the classic MongoDB driver for Python, but it's SYNCHRONOUS —
it blocks (waits) while talking to the database. FastAPI is built for
ASYNC code, meaning it can handle many requests at once without waiting
around. "motor" is the async version of pymongo, built to work with
FastAPI. That's why we install "motor", not "pymongo", for this project.
"""

import os
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

# load_dotenv() reads the ".env" file and makes its values available
# via os.getenv(). This is how we keep secrets (like passwords in the
# Mongo URI) out of our actual code.
load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "cafe_db")

# This one line opens the connection. It doesn't actually connect yet —
# Motor is "lazy": it waits until you first try to use the database
# before it really opens the connection.
client = AsyncIOMotorClient(MONGO_URI)

# `database` is the specific database inside MongoDB we're using.
# Think of MONGO_URI as "the address of the whole MongoDB server",
# and DB_NAME as "which database on that server is ours".
database = client[DB_NAME]

# A "collection" in MongoDB is the equivalent of a "table" in SQL.
# We define one variable per collection so every other file can just
# do: `from backend.database import product_collection`
product_collection = database["products"]
order_collection = database["orders"]
customer_collection = database["customers"]
pantry_collection = database["pantry"]
offer_collection = database["offers"]
review_collection = database["reviews"]
staff_collection = database["staff"]
attendance_collection = database["attendance"]
table_collection = database["tables"]

# Real login accounts (email + hashed password) - separate from
# staff_collection above, which only holds HR records (position,
# salary, phone) and has no password field. A staff member and a
# user login are two different things: a staff member doesn't
# necessarily have site access, and a manager login isn't HR data.
user_collection = database["users"]
