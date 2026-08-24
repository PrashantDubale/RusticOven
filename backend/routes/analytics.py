"""
routes/analytics.py
--------------------
Endpoints for the manager's Analytics/Dashboard pages — maps to your
design's app/analytics/page.tsx and the KPI cards on
app/dashboard/manager/page.tsx.

Unlike products/orders/customers, there's nothing to "create" here —
this file only ever READS data and does some math on it. There's no
separate "analytics" collection in MongoDB; everything here is
calculated live from the orders/products that already exist.

  GET /analytics/summary       -> KPI numbers (total sales, order count, etc.)
  GET /analytics/top-products   -> best-selling products by revenue
"""

from fastapi import APIRouter
from datetime import datetime, timezone

from backend.database import order_collection, product_collection

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/today-sales")
async def get_today_sales():
    """
    Total sales and order count for TODAY only — for the manager
    dashboard's headline number. We compare the date portion of each
    order's created_at (an ISO string like '2026-07-28T14:30:00...')
    against today's date.
    """
    today_str = datetime.now(timezone.utc).date().isoformat()

    total = 0.0
    count = 0
    async for order in order_collection.find():
        if order["created_at"].startswith(today_str):
            total += order["total"]
            count += 1

    return {"date": today_str, "total_sales": round(total, 2), "orders_count": count}


@router.get("/summary")
async def get_summary():
    """
    One dict of the numbers a manager wants at a glance. We loop through
    orders once and add things up in Python — simple and easy to follow.
    (For a much bigger dataset you'd use MongoDB's aggregation pipeline
    instead, but for a learning project, a plain loop is easier to read.)
    """
    total_sales = 0.0
    orders_count = 0
    active_orders = 0

    async for order in order_collection.find():
        total_sales += order["total"]
        orders_count += 1
        if order["status"] in ("pending", "preparing"):
            active_orders += 1

    low_stock_count = await product_collection.count_documents({"stock": {"$lte": 5}})

    return {
        "total_sales": round(total_sales, 2),
        "orders_count": orders_count,
        "active_orders": active_orders,
        "low_stock_count": low_stock_count,
    }


@router.get("/top-products")
async def get_top_products(limit: int = 5):
    """
    Figure out which products sold the most, by looking at every
    order's line items and tallying up quantity + revenue per product.
    """
    totals: dict[str, dict] = {}

    async for order in order_collection.find():
        for item in order["items"]:
            key = item["product_id"]
            if key not in totals:
                totals[key] = {"name": item["name"], "units_sold": 0, "revenue": 0.0}
            totals[key]["units_sold"] += item["quantity"]
            totals[key]["revenue"] += item["price"] * item["quantity"]

    # Sort by revenue, highest first, and only keep the top `limit`.
    ranked = sorted(totals.values(), key=lambda p: p["revenue"], reverse=True)
    return ranked[:limit]
