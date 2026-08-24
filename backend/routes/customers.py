"""
routes/customers.py
--------------------
Endpoints for customers — maps to your design's app/customers/page.tsx.

  GET  /customers/       -> list all customers (manager view)
  GET  /customers/{id}    -> get one customer
  POST /customers/        -> register a new customer
"""

from fastapi import APIRouter, HTTPException
from bson import ObjectId

from backend.database import customer_collection
from backend.models import CustomerIn, CustomerOut

router = APIRouter(prefix="/customers", tags=["customers"])


def customer_helper(doc) -> dict:
    return {
        "id": str(doc["_id"]),
        "name": doc["name"],
        "email": doc["email"],
        "phone": doc.get("phone"),
        "loyalty_points": doc.get("loyalty_points", 0),
        "total_orders": doc.get("total_orders", 0),
        "total_spent": doc.get("total_spent", 0.0),
    }


@router.get("/", response_model=list[CustomerOut])
async def list_customers():
    customers = []
    async for doc in customer_collection.find():
        customers.append(customer_helper(doc))
    return customers


@router.get("/{customer_id}", response_model=CustomerOut)
async def get_customer(customer_id: str):
    if not ObjectId.is_valid(customer_id):
        raise HTTPException(status_code=400, detail="Invalid customer id")
    doc = await customer_collection.find_one({"_id": ObjectId(customer_id)})
    if doc is None:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer_helper(doc)


@router.post("/", response_model=CustomerOut)
async def create_customer(customer: CustomerIn):
    """
    Register a new customer. New fields (loyalty_points, total_orders,
    total_spent) all start at 0 — they build up over time as the
    customer places real orders, so we don't ask for them up front.
    """
    doc = customer.model_dump()
    doc["loyalty_points"] = 0
    doc["total_orders"] = 0
    doc["total_spent"] = 0.0
    result = await customer_collection.insert_one(doc)
    new_doc = await customer_collection.find_one({"_id": result.inserted_id})
    return customer_helper(new_doc)
