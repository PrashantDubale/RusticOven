"""
routes/attendance.py
---------------------
Tracks daily attendance per staff member — a separate collection from
staff.py on purpose. One staff member has MANY attendance records over
time (one per day), so this is a classic "one-to-many" relationship:
same reason orders live in their own collection instead of being a
list stuffed inside a customer document.

Each record is keyed on (employee_id, date), and marking attendance
twice for the same person on the same day UPDATES that record instead
of creating a duplicate — this is called an "upsert" (update-or-insert).
That's what lets a manager correct a mistake ("oh, I marked them absent
but they were actually present") just by marking it again.

  POST /attendance/                         -> mark attendance for one day (manager-only)
  GET  /attendance/{employee_id}            -> full attendance history for one employee
  GET  /attendance/{employee_id}/summary    -> counts + attendance percentage
"""

from datetime import date as date_type
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel

from backend.database import attendance_collection, staff_collection
from backend.deps import require_manager

router = APIRouter(prefix="/attendance", tags=["attendance"])

# "half-day" and "leave" (approved leave) count differently from a
# plain absence when we calculate the attendance %, which is why
# status is restricted to exactly these four values rather than any
# free-text string.
VALID_STATUSES = {"present", "absent", "half-day", "leave"}


class AttendanceIn(BaseModel):
    employee_id: str
    date: str  # ISO format "YYYY-MM-DD", e.g. from a Streamlit st.date_input
    status: str  # one of VALID_STATUSES


class AttendanceOut(AttendanceIn):
    id: str


def attendance_helper(doc) -> dict:
    return {
        "id": str(doc["_id"]),
        "employee_id": doc["employee_id"],
        "date": doc["date"],
        "status": doc["status"],
    }


@router.post("/", response_model=AttendanceOut)
async def mark_attendance(record: AttendanceIn, manager=Depends(require_manager)):
    """Mark (or correct) one staff member's attendance for one day. Manager-only."""
    if record.status not in VALID_STATUSES:
        raise HTTPException(status_code=400, detail=f"status must be one of {sorted(VALID_STATUSES)}")

    staff_exists = await staff_collection.find_one({"employee_id": record.employee_id})
    if not staff_exists:
        raise HTTPException(status_code=404, detail=f"No staff member with employee_id '{record.employee_id}'.")

    # upsert=True means: update the matching document if one exists for
    # this employee+date, otherwise insert a new one. This is what
    # makes re-marking the same day safe instead of creating duplicates.
    await attendance_collection.update_one(
        {"employee_id": record.employee_id, "date": record.date},
        {"$set": {"status": record.status}},
        upsert=True,
    )
    saved = await attendance_collection.find_one({"employee_id": record.employee_id, "date": record.date})
    return attendance_helper(saved)


@router.get("/{employee_id}", response_model=list[AttendanceOut])
async def get_attendance(employee_id: str):
    """Full attendance history for one employee, most recent first."""
    records = []
    cursor = attendance_collection.find({"employee_id": employee_id}).sort("date", -1)
    async for doc in cursor:
        records.append(attendance_helper(doc))
    return records


@router.get("/{employee_id}/summary")
async def get_attendance_summary(employee_id: str):
    """
    Counts + attendance percentage for one employee. A half-day counts
    as 0.5 toward the percentage, present as 1, absent/leave as 0 — the
    same convention most payroll systems use.
    """
    records = await attendance_collection.find({"employee_id": employee_id}).to_list(length=None)
    total = len(records)
    counts = {"present": 0, "absent": 0, "half-day": 0, "leave": 0}
    for r in records:
        if r["status"] in counts:
            counts[r["status"]] += 1

    weighted_present = counts["present"] + 0.5 * counts["half-day"]
    percentage = round((weighted_present / total) * 100, 1) if total else 0.0

    return {
        "employee_id": employee_id,
        "total_days_marked": total,
        "present": counts["present"],
        "absent": counts["absent"],
        "half_day": counts["half-day"],
        "leave": counts["leave"],
        "attendance_percentage": percentage,
    }
