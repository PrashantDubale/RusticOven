"""
routes/pantry.py
------------------
Ingredient stock tracking for the manager dashboard's "expiring soon"
and "recently added" widgets.

  GET  /pantry/               -> list all pantry items
  GET  /pantry/expiring-soon  -> items expiring within `days` (default 7)
  GET  /pantry/recent         -> most recently added items
  POST /pantry/                -> add a new pantry item
"""

from datetime import datetime, timezone

from fastapi import APIRouter
from bson import ObjectId

from backend.database import pantry_collection
from backend.models import PantryItemIn, PantryItemOut

router = APIRouter(prefix="/pantry", tags=["pantry"])


def pantry_helper(doc) -> dict:
    return {
        "id": str(doc["_id"]),
        "name": doc["name"],
        "quantity": doc["quantity"],
        "unit": doc["unit"],
        "expiry_date": doc["expiry_date"],
        "added_date": doc["added_date"],
    }


@router.get("/", response_model=list[PantryItemOut])
async def list_pantry():
    items = []
    async for doc in pantry_collection.find():
        items.append(pantry_helper(doc))
    return items


@router.get("/expiring-soon", response_model=list[PantryItemOut])
async def expiring_soon(days: int = 7):
    """
    Items whose expiry_date falls within the next `days` days.
    We fetch everything and filter in Python with plain string/date
    comparison — simple to follow, and pantry lists are small enough
    that this isn't a performance concern.
    """
    from datetime import timedelta

    today = datetime.now(timezone.utc).date()
    cutoff = today + timedelta(days=days)

    items = []
    async for doc in pantry_collection.find():
        expiry = datetime.fromisoformat(doc["expiry_date"]).date()
        if today <= expiry <= cutoff:
            items.append(pantry_helper(doc))
    return sorted(items, key=lambda i: i["expiry_date"])


@router.get("/recent", response_model=list[PantryItemOut])
async def recently_added(limit: int = 5):
    items = []
    async for doc in pantry_collection.find().sort("added_date", -1).limit(limit):
        items.append(pantry_helper(doc))
    return items


@router.post("/", response_model=PantryItemOut)
async def add_pantry_item(item: PantryItemIn):
    doc = item.model_dump()
    doc["added_date"] = datetime.now(timezone.utc).date().isoformat()
    result = await pantry_collection.insert_one(doc)
    new_doc = await pantry_collection.find_one({"_id": result.inserted_id})
    return pantry_helper(new_doc)
