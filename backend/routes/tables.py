"""
routes/tables.py
------------------
Endpoints backing the "Dine Here" page: a customer needs to see which
tables are free and claim one before they can start picking dishes.

  GET  /tables/               -> list every table (with live status)
  POST /tables/{id}/select     -> claim a free table (available -> occupied)
  POST /tables/{id}/release    -> free a table up again (occupied -> available)

Table STATE lives in Mongo (not just session state) so that if two
customers open the app at the same time, they see the same table map —
one person grabbing Table 4 makes it unavailable for everyone else,
the same way it would in a real cafe.
"""

from fastapi import APIRouter, HTTPException, Depends
from bson import ObjectId

from backend.database import table_collection
from backend.models import TableOut, TableSelect, TableIn
from backend.deps import require_manager

router = APIRouter(prefix="/tables", tags=["tables"])


def table_helper(doc) -> dict:
    return {
        "id": str(doc["_id"]),
        "number": doc["number"],
        "capacity": doc["capacity"],
        "status": doc.get("status", "available"),
        "occupied_by": doc.get("occupied_by"),
    }


@router.get("/", response_model=list[TableOut])
async def list_tables():
    """Return every table, in table-number order, for the table map."""
    tables = []
    async for doc in table_collection.find().sort("number", 1):
        tables.append(table_helper(doc))
    return tables


@router.post("/", response_model=TableOut)
async def create_table(table: TableIn, manager=Depends(require_manager)):
    """Add a new table to the dine-in map. Manager-only — this is what the
    Manager > Tables page's 'Add Table' form calls."""
    existing = await table_collection.find_one({"number": table.number})
    if existing:
        raise HTTPException(status_code=400, detail=f"Table {table.number} already exists.")
    doc = table.model_dump()
    doc["status"] = "available"
    doc["occupied_by"] = None
    result = await table_collection.insert_one(doc)
    new_doc = await table_collection.find_one({"_id": result.inserted_id})
    return table_helper(new_doc)


@router.delete("/{table_id}")
async def delete_table(table_id: str, manager=Depends(require_manager)):
    """Remove a table entirely. Manager-only."""
    if not ObjectId.is_valid(table_id):
        raise HTTPException(status_code=400, detail="Invalid table id")
    result = await table_collection.delete_one({"_id": ObjectId(table_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Table not found")
    return {"message": "Table deleted"}


@router.post("/{table_id}/select", response_model=TableOut)
async def select_table(table_id: str, selection: TableSelect):
    """
    Claim a table for dine-in. Fails with 409 if someone already grabbed
    it in the meantime — this is the check that stops two customers
    from both being seated at the same table.
    """
    if not ObjectId.is_valid(table_id):
        raise HTTPException(status_code=400, detail="Invalid table id")

    doc = await table_collection.find_one({"_id": ObjectId(table_id)})
    if doc is None:
        raise HTTPException(status_code=404, detail="Table not found")
    if doc.get("status") == "occupied":
        raise HTTPException(status_code=409, detail="That table was just taken — pick another one.")

    await table_collection.update_one(
        {"_id": ObjectId(table_id)},
        {"$set": {"status": "occupied", "occupied_by": selection.customer_name}},
    )
    updated_doc = await table_collection.find_one({"_id": ObjectId(table_id)})
    return table_helper(updated_doc)


@router.post("/{table_id}/release", response_model=TableOut)
async def release_table(table_id: str):
    """Free a table back up — used when an order is done, or the customer backs out."""
    if not ObjectId.is_valid(table_id):
        raise HTTPException(status_code=400, detail="Invalid table id")

    result = await table_collection.update_one(
        {"_id": ObjectId(table_id)},
        {"$set": {"status": "available", "occupied_by": None}},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Table not found")

    updated_doc = await table_collection.find_one({"_id": ObjectId(table_id)})
    return table_helper(updated_doc)


@router.post("/by-number/{table_number}/release", response_model=TableOut)
async def release_table_by_number(table_number: int):
    """Same as /release, but looked up by table number — handy when the frontend only has the number on hand."""
    doc = await table_collection.find_one({"number": table_number})
    if doc is None:
        raise HTTPException(status_code=404, detail="Table not found")
    await table_collection.update_one(
        {"_id": doc["_id"]}, {"$set": {"status": "available", "occupied_by": None}}
    )
    updated_doc = await table_collection.find_one({"_id": doc["_id"]})
    return table_helper(updated_doc)
