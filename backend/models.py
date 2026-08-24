"""
models.py
---------
This file defines the SHAPE of our data using Pydantic.

Why bother, when MongoDB doesn't force a schema?
That's exactly the point. MongoDB will happily accept messy, inconsistent
data (a product with no price, a typo'd field name, a string where you
meant a number). Pydantic is how WE, on the Python side, enforce a
consistent shape before anything gets saved or sent out. FastAPI also
uses these same models to auto-generate API docs and to reject bad
requests automatically.

We took the field list straight from your design's Product type
(lib/types.ts) and translated it into Python.
"""

from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


# An Enum restricts a field to a fixed set of choices — just like the
# ProductCategory union type in your design ('sandwiches' | 'burgers' | ...).
# This means someone can't accidentally create a product with
# category="pzza" (typo) — Pydantic will reject it.
class ProductCategory(str, Enum):
    sandwiches = "sandwiches"
    burgers = "burgers"
    pizza = "pizza"
    fries = "fries"
    beverages = "beverages"


# This is the shape of a product when someone CREATES or UPDATES one.
# Notice there's no "id" field here — MongoDB generates that for us
# automatically when we insert a document.
class ProductIn(BaseModel):
    name: str
    description: str
    category: ProductCategory
    price: float = Field(..., gt=0, description="Price in rupees, must be positive")
    image: Optional[str] = None
    is_veg: bool = True
    stock: int = Field(0, ge=0, description="Units currently in stock")
    is_featured: bool = False  # shown on the Home page's "Featured" section


# This is the shape of a product when we SEND IT BACK to the frontend.
# It's the same as ProductIn, but with an "id" added, since by the time
# we're reading it back out of MongoDB, it already has one.
class ProductOut(ProductIn):
    id: str


# This is the shape used when EDITING a product. Every field is
# Optional — because when you edit, you might only want to change the
# price and leave everything else untouched. If every field were
# required like in ProductIn, you'd be forced to re-send the whole
# product just to change one number.
class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[ProductCategory] = None
    price: Optional[float] = Field(None, gt=0)
    image: Optional[str] = None
    is_veg: Optional[bool] = None
    stock: Optional[int] = Field(None, ge=0)
    is_featured: Optional[bool] = None


# ---------------------------------------------------------------------
# ORDERS — from lib/types.ts: OrderStatus, OrderItem, Order
# ---------------------------------------------------------------------

class OrderStatus(str, Enum):
    pending = "pending"
    preparing = "preparing"
    ready = "ready"
    delivered = "delivered"
    cancelled = "cancelled"


# One line item inside an order — "2x Margherita Pizza", for example.
class OrderItem(BaseModel):
    product_id: str
    name: str            # copied in at order time, so the order still
    price: float          # makes sense even if the product is later
    quantity: int = Field(..., gt=0)  # renamed or its price changes


class OrderType(str, Enum):
    takeaway = "takeaway"
    dine_in = "dine_in"


class OrderIn(BaseModel):
    customer_name: str
    items: list[OrderItem]
    notes: Optional[str] = None
    order_type: OrderType = OrderType.takeaway
    # Only set when order_type == dine_in — which table this order
    # belongs to, so the kitchen/manager knows where to send the food.
    table_number: Optional[int] = None
    # subtotal/tax/total are NOT here — the backend calculates those
    # itself in routes/orders.py, from the items list. We never trust
    # a total sent by the frontend, since that could be tampered with.


class OrderOut(BaseModel):
    id: str
    customer_name: str
    items: list[OrderItem]
    subtotal: float
    tax: float
    total: float
    status: OrderStatus
    notes: Optional[str] = None
    order_type: OrderType = OrderType.takeaway
    table_number: Optional[int] = None
    created_at: str


class OrderStatusUpdate(BaseModel):
    status: OrderStatus


# ---------------------------------------------------------------------
# CUSTOMERS — from lib/types.ts: Customer (extends User)
# ---------------------------------------------------------------------

class CustomerIn(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None


class CustomerOut(CustomerIn):
    id: str
    loyalty_points: int = 0
    total_orders: int = 0
    total_spent: float = 0.0


# ---------------------------------------------------------------------
# PANTRY — ingredient stock, for the manager's "expiring soon" /
# "recently added" widgets on the dashboard
# ---------------------------------------------------------------------

class PantryItemIn(BaseModel):
    name: str
    quantity: float
    unit: str  # e.g. "kg", "litres", "packets"
    expiry_date: str  # ISO date string, e.g. "2026-08-15"


class PantryItemOut(PantryItemIn):
    id: str
    added_date: str


# ---------------------------------------------------------------------
# OFFERS — cafe-wide promotions the manager can create
# ---------------------------------------------------------------------

class OfferIn(BaseModel):
    title: str
    description: str
    discount_percent: float = Field(..., gt=0, le=100)
    active: bool = True


class OfferOut(OfferIn):
    id: str


# ---------------------------------------------------------------------
# REVIEWS — customer reviews on a specific product
# ---------------------------------------------------------------------

class ReviewIn(BaseModel):
    product_id: str
    product_name: str
    customer_name: str
    rating: int = Field(..., ge=1, le=5)
    comment: Optional[str] = None


class ReviewOut(ReviewIn):
    id: str
    created_at: str


# ---------------------------------------------------------------------
# TABLES — for the "Dine Here" page: pick a table before picking dishes
# ---------------------------------------------------------------------

class TableStatus(str, Enum):
    available = "available"
    occupied = "occupied"


class TableIn(BaseModel):
    number: int
    capacity: int = Field(4, gt=0, description="How many seats this table has")


class TableOut(TableIn):
    id: str
    status: TableStatus = TableStatus.available
    # Who's currently sitting there, so a manager glancing at the
    # table map can see it, not just "occupied".
    occupied_by: Optional[str] = None


class TableSelect(BaseModel):
    customer_name: str
