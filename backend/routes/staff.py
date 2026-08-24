"""
routes/staff.py
-----------------
Endpoints for staff members — a simplified version of your design's
StaffMember type (lib/types.ts). Includes employee_id, email, and
salary alongside name/position/phone, so every staff member has a
unique ID, a way to reach them, and pay info a manager can look up or
adjust. Attendance lives in its own file (routes/attendance.py) since
it's really a separate collection — one staff member has MANY
attendance records over time, so it doesn't belong as a field on the
staff document itself.

  GET  /staff/            -> list all staff
  POST /staff/            -> add a new staff member (manager-only)
  PUT  /staff/{staff_id}  -> edit an existing staff member (manager-only)
"""

from fastapi import APIRouter, HTTPException, Depends
from bson import ObjectId
from pydantic import BaseModel

from backend.database import staff_collection
from backend.deps import require_manager

router = APIRouter(prefix="/staff", tags=["staff"])


class StaffIn(BaseModel):
    employee_id: str
    name: str
    position: str
    email: str
    phone: str
    salary: float = 0.0


class StaffUpdate(BaseModel):
    # Every field optional, same pattern as ProductUpdate in models.py —
    # the manager only sends the fields that actually changed (e.g. just
    # a salary raise), not the whole record.
    name: str | None = None
    position: str | None = None
    email: str | None = None
    phone: str | None = None
    salary: float | None = None


class StaffOut(StaffIn):
    id: str


def staff_helper(doc) -> dict:
    return {
        "id": str(doc["_id"]),
        "employee_id": doc.get("employee_id", ""),
        "name": doc["name"],
        "position": doc["position"],
        "email": doc.get("email", ""),
        "phone": doc["phone"],
        "salary": doc.get("salary", 0.0),
    }


@router.get("/", response_model=list[StaffOut])
async def list_staff():
    staff = []
    async for doc in staff_collection.find():
        staff.append(staff_helper(doc))
    return staff


@router.post("/", response_model=StaffOut)
async def create_staff(staff: StaffIn, manager=Depends(require_manager)):
    """Add a new staff member. Manager-only — see backend/deps.py."""
    existing = await staff_collection.find_one({"employee_id": staff.employee_id})
    if existing:
        raise HTTPException(status_code=400, detail=f"Employee ID '{staff.employee_id}' already exists.")
    result = await staff_collection.insert_one(staff.model_dump())
    new_doc = await staff_collection.find_one({"_id": result.inserted_id})
    return staff_helper(new_doc)


@router.put("/{staff_id}", response_model=StaffOut)
async def update_staff(staff_id: str, staff: StaffUpdate, manager=Depends(require_manager)):
    """Update one or more fields of an existing staff member (e.g. a salary change). Manager-only."""
    if not ObjectId.is_valid(staff_id):
        raise HTTPException(status_code=400, detail="Invalid staff id.")
    # exclude_unset=True means "only include fields the caller actually
    # sent" — same trick used in routes/products.py's update_product, so
    # leaving salary out of the request doesn't accidentally zero it out.
    update_data = {k: v for k, v in staff.model_dump(exclude_unset=True).items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update.")
    result = await staff_collection.update_one({"_id": ObjectId(staff_id)}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Staff member not found.")
    updated_doc = await staff_collection.find_one({"_id": ObjectId(staff_id)})
    return staff_helper(updated_doc)
