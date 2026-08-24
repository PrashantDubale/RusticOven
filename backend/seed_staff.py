"""
seed_staff.py
-------------
A one-off script (not part of the running app) that adds a starter
roster of staff — random names, unique employee IDs, emails, phone
numbers, and a position-appropriate starting salary — so the Staff
page has real people to show right away instead of an empty list.

Unlike seed_data.py (products), this script does NOT clear the
collection first. Staff records are things a manager adds by hand
through the Staff page, and we don't want a re-run of this script to
wipe those out. Instead, each staff member gets a unique employee_id
(e.g. "EMP-1007"), and the script skips any ID that already exists —
so it's safe to run more than once; it just tops up to the requested
headcount instead of duplicating people.

Run it once, from the RusticOven folder:
    python -m backend.seed_staff
Or with a custom headcount:
    python -m backend.seed_staff --count 15
"""

import argparse
import asyncio
import random

from backend.database import staff_collection

FIRST_NAMES = [
    "Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Sai", "Krishna", "Ishaan",
    "Rohan", "Kabir", "Ananya", "Diya", "Priya", "Isha", "Kavya", "Meera",
    "Riya", "Sanya", "Tara", "Zara", "Aryan", "Dev", "Karan", "Nikhil",
    "Pooja", "Sneha", "Neha", "Aisha", "Rahul", "Varun",
]
LAST_NAMES = [
    "Sharma", "Verma", "Gupta", "Mehta", "Iyer", "Nair", "Rao", "Reddy",
    "Kapoor", "Malhotra", "Chatterjee", "Bose", "Joshi", "Desai", "Pillai",
    "Menon", "Kulkarni", "Bhatt", "Chauhan", "Agarwal",
]
POSITIONS = [
    "Baker", "Barista", "Cashier", "Chef", "Sous Chef", "Waiter",
    "Kitchen Assistant", "Cleaner", "Delivery Staff", "Shift Supervisor",
]
# (min, max) monthly salary in ₹ per position — rough, so a Chef
# doesn't randomly end up earning less than a Cleaner. Real numbers are
# yours to correct from the Staff page later; this just avoids
# obviously-wrong starter data.
SALARY_RANGES = {
    "Baker": (16000, 22000),
    "Barista": (14000, 19000),
    "Cashier": (13000, 18000),
    "Chef": (25000, 40000),
    "Sous Chef": (20000, 30000),
    "Waiter": (12000, 16000),
    "Kitchen Assistant": (11000, 15000),
    "Cleaner": (10000, 13000),
    "Delivery Staff": (12000, 17000),
    "Shift Supervisor": (22000, 30000),
}


def random_salary(position: str) -> float:
    low, high = SALARY_RANGES.get(position, (12000, 20000))
    return float(random.randint(low // 500, high // 500) * 500)  # round to nearest ₹500


def random_phone() -> str:
    """Indian mobile number, e.g. +91 98765 43210."""
    return f"+91 {random.randint(70000, 99999)} {random.randint(10000, 99999)}"


def make_employee_id(existing_ids: set[str]) -> str:
    """Generates the next free EMP-#### id, starting from EMP-1001."""
    n = 1001
    while f"EMP-{n}" in existing_ids:
        n += 1
    eid = f"EMP-{n}"
    existing_ids.add(eid)
    return eid


async def seed(count: int):
    existing_docs = await staff_collection.find().to_list(length=None)
    existing_ids = {doc["employee_id"] for doc in existing_docs if doc.get("employee_id")}
    existing_emails = {doc.get("email") for doc in existing_docs}

    inserted = 0
    attempts = 0
    new_staff = []
    while inserted < count and attempts < count * 10:
        attempts += 1
        first = random.choice(FIRST_NAMES)
        last = random.choice(LAST_NAMES)
        name = f"{first} {last}"
        email = f"{first.lower()}.{last.lower()}@rusticovencafe.com"

        if email in existing_emails:
            continue  # try a different name combo instead of a duplicate email
        existing_emails.add(email)

        employee_id = make_employee_id(existing_ids)
        position = random.choice(POSITIONS)

        new_staff.append({
            "employee_id": employee_id,
            "name": name,
            "position": position,
            "email": email,
            "phone": random_phone(),
            "salary": random_salary(position),
        })
        inserted += 1

    if new_staff:
        result = await staff_collection.insert_many(new_staff)
        print(f"Inserted {len(result.inserted_ids)} new staff members "
              f"(headcount now {len(existing_docs) + len(result.inserted_ids)}).")
    else:
        print("No new staff inserted — nothing to add.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Seed random staff members.")
    parser.add_argument("--count", type=int, default=10, help="How many staff members to add (default: 10)")
    args = parser.parse_args()
    asyncio.run(seed(args.count))
