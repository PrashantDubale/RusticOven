"""
routes/orders.py
-----------------
Endpoints for orders — maps to your design's app/orders/page.tsx
(manager side) and app/cart/page.tsx (the "place order" action on
the customer side both end up calling POST /orders/).

  GET  /orders/          -> list all orders (manager view, newest first)
  GET  /orders/{id}       -> get one order
  POST /orders/           -> create a new order (from the Cart page)
  PUT  /orders/{id}/status -> change status (pending -> preparing -> ...)
"""

from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException
from bson import ObjectId

from backend.database import order_collection, table_collection
from backend.models import OrderIn, OrderOut, OrderStatusUpdate
from backend.utils import calculate_tax, calculate_total

router = APIRouter(prefix="/orders", tags=["orders"])


def order_helper(doc) -> dict:
    return {
        "id": str(doc["_id"]),
        "customer_name": doc["customer_name"],
        "items": doc["items"],
        "subtotal": doc["subtotal"],
        "tax": doc["tax"],
        "total": doc["total"],
        "status": doc["status"],
        "notes": doc.get("notes"),
        "order_type": doc.get("order_type", "takeaway"),
        "table_number": doc.get("table_number"),
        "created_at": doc["created_at"],
    }


@router.get("/", response_model=list[OrderOut])
async def list_orders():
    """Return every order, most recent first."""
    orders = []
    # sort("created_at", -1) means descending — newest orders on top,
    # matching how a manager would want to see them.
    async for doc in order_collection.find().sort("created_at", -1):
        orders.append(order_helper(doc))
    return orders


@router.get("/{order_id}", response_model=OrderOut)
async def get_order(order_id: str):
    if not ObjectId.is_valid(order_id):
        raise HTTPException(status_code=400, detail="Invalid order id")
    doc = await order_collection.find_one({"_id": ObjectId(order_id)})
    if doc is None:
        raise HTTPException(status_code=404, detail="Order not found")
    return order_helper(doc)


@router.post("/", response_model=OrderOut)
async def create_order(order: OrderIn):
    """
    Create a new order. This is where the Cart page's "Checkout"
    button ends up. Notice: the frontend only sends the ITEMS — the
    backend calculates subtotal/tax/total itself. We never trust a
    total number sent by the browser, since that could be edited by
    anyone before it reaches us.
    """
    subtotal = sum(item.price * item.quantity for item in order.items)
    tax = calculate_tax(subtotal)
    total = calculate_total(subtotal)

    doc = {
        "customer_name": order.customer_name,
        "items": [item.model_dump() for item in order.items],
        "subtotal": subtotal,
        "tax": tax,
        "total": total,
        "status": "pending",
        "notes": order.notes,
        "order_type": order.order_type,
        "table_number": order.table_number,
        # Stored as an ISO string (not a Mongo date object) to keep
        # this simple — easy to read back and display as-is.
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    result = await order_collection.insert_one(doc)
    new_doc = await order_collection.find_one({"_id": result.inserted_id})
    return order_helper(new_doc)


@router.put("/{order_id}/status", response_model=OrderOut)
async def update_order_status(order_id: str, status_update: OrderStatusUpdate):
    """Move an order through its lifecycle: pending -> preparing -> ready -> delivered."""
    if not ObjectId.is_valid(order_id):
        raise HTTPException(status_code=400, detail="Invalid order id")

    result = await order_collection.update_one(
        {"_id": ObjectId(order_id)}, {"$set": {"status": status_update.status}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")

    updated_doc = await order_collection.find_one({"_id": ObjectId(order_id)})

    # Once a dine-in order is delivered (food is out) or cancelled, the
    # table isn't needed anymore for THIS order — free it up so the
    # next customer can be seated there. (If they linger and order
    # again, the Dine Here page lets them grab a table again.)
    if updated_doc.get("order_type") == "dine_in" and updated_doc.get("table_number") is not None:
        if status_update.status in ("delivered", "cancelled"):
            await table_collection.update_one(
                {"number": updated_doc["table_number"]},
                {"$set": {"status": "available", "occupied_by": None}},
            )

    return order_helper(updated_doc)
