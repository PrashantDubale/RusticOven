"""
seed_attendance.py
-------------------
A one-off script that backfills the last N days of attendance for
every EXISTING staff member, so the Staff page's attendance summary
and history table actually have something to show right after you
seed staff — instead of every employee showing "No attendance marked
yet".

Like seed_staff.py, this is safe to re-run: marking attendance for a
given (employee_id, date) is an upsert (see routes/attendance.py), so
running this twice just re-writes the same days instead of doubling
them up.

Each day for each employee is randomly:
  ~85% present, ~7% absent, ~5% half-day, ~3% leave
— a realistic-looking mix rather than uniform randomness.

Run it once, from the RusticOven folder (after seed_staff.py):
    python -m backend.seed_attendance
Or for a different window:
    python -m backend.seed_attendance --days 14
"""

import argparse
import asyncio
import datetime
import random

from backend.database import staff_collection, attendance_collection

STATUS_WEIGHTS = [
    ("present", 0.85),
    ("absent", 0.07),
    ("half-day", 0.05),
    ("leave", 0.03),
]


def random_status() -> str:
    statuses, weights = zip(*STATUS_WEIGHTS)
    return random.choices(statuses, weights=weights, k=1)[0]


async def seed(days: int):
    staff = await staff_collection.find().to_list(length=None)
    if not staff:
        print("No staff found — run `python -m backend.seed_staff` first.")
        return

    today = datetime.date.today()
    records = 0
    for member in staff:
        employee_id = member.get("employee_id")
        if not employee_id:
            continue
        for offset in range(days):
            day = today - datetime.timedelta(days=offset)
            await attendance_collection.update_one(
                {"employee_id": employee_id, "date": day.isoformat()},
                {"$set": {"status": random_status()}},
                upsert=True,
            )
            records += 1

    print(f"Seeded {records} attendance records across {len(staff)} staff "
          f"members ({days} days each).")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Seed recent attendance history for all staff.")
    parser.add_argument("--days", type=int, default=30, help="How many past days to fill in (default: 30)")
    args = parser.parse_args()
    asyncio.run(seed(args.days))
