"""
utils.py
--------
Small, pure helper functions — no database, no FastAPI, just plain
calculations. Translated from your design's lib/utils-cafe.ts.

Keeping these separate from routes/ means they're easy to test on
their own, and both the backend AND frontend could import from a file
like this if needed (though here, mainly the backend uses it, since
it does the order-total math).
"""

TAX_RATE = 0.18  # 18% GST, matching the design's default


def calculate_tax(amount: float, tax_rate: float = TAX_RATE) -> float:
    """Given a subtotal, return just the tax amount."""
    return round(amount * tax_rate, 2)


def calculate_total(subtotal: float, tax_rate: float = TAX_RATE) -> float:
    """Given a subtotal, return subtotal + tax."""
    return round(subtotal + calculate_tax(subtotal, tax_rate), 2)


def format_price(price: float) -> str:
    """Format a number as Indian Rupees, e.g. 250 -> '₹250.00'."""
    return f"₹{price:,.2f}"


def get_stock_status(stock: int, minimum: int = 5) -> str:
    """Classify stock level, same thresholds as the design."""
    if stock == 0:
        return "out-of-stock"
    if stock <= minimum:
        return "low-stock"
    return "in-stock"


def generate_order_id() -> str:
    """
    Human-friendly order reference like 'ORD-7F3K2A'.
    Mongo already gives every order a unique _id, so this isn't used
    for lookups — it's just a nicer label to show on screen.
    """
    import random
    import string

    suffix = "".join(random.choices(string.ascii_uppercase + string.digits, k=6))
    return f"ORD-{suffix}"
