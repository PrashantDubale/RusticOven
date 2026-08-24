"""
seed_tables.py
--------------
A one-off script that sets up the dine-in table map: 10 tables of
varying sizes, all starting out "available". This exists so the
Dine Here page has something to show the very first time you run the
app — without it, /tables/ would just return an empty list.

Run it once, from the RusticOven folder:
    python -m backend.seed_tables

Safe to run more than once — it clears the tables collection first,
so you won't end up with duplicate table numbers. (Running it while
tables are mid-order will reset everyone back to "available" — treat
it like a one-time setup step, not something to re-run casually while
the cafe is "open".)
"""

import asyncio
from backend.database import table_collection

# A small mix of 2-tops, 4-tops, and a couple of bigger tables for
# groups — a fairly typical spread for a cafe this size.
SAMPLE_TABLES = [
    {"number": 1, "capacity": 2, "status": "available", "occupied_by": None},
    {"number": 2, "capacity": 2, "status": "available", "occupied_by": None},
    {"number": 3, "capacity": 4, "status": "available", "occupied_by": None},
    {"number": 4, "capacity": 4, "status": "available", "occupied_by": None},
    {"number": 5, "capacity": 4, "status": "available", "occupied_by": None},
    {"number": 6, "capacity": 4, "status": "available", "occupied_by": None},
    {"number": 7, "capacity": 6, "status": "available", "occupied_by": None},
    {"number": 8, "capacity": 6, "status": "available", "occupied_by": None},
    {"number": 9, "capacity": 2, "status": "available", "occupied_by": None},
    {"number": 10, "capacity": 8, "status": "available", "occupied_by": None},
]


async def seed():
    await table_collection.delete_many({})
    result = await table_collection.insert_many(SAMPLE_TABLES)
    print(f"Inserted {len(result.inserted_ids)} tables.")


if __name__ == "__main__":
    asyncio.run(seed())
