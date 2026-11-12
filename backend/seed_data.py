"""
seed_data.py
------------
A one-off script (not part of the running app) that inserts your
REAL menu into MongoDB — pulled from your Cafe_Menu.docx. This exists
so your Menu page shows your actual items instead of placeholder data.

Note on prices: your docx lists ingredients and recipes, but no
prices. I picked reasonable placeholder prices (₹) below — go to the
Products page in the app and edit any of them once it's running;
that's exactly what the edit form on that page is for.

Run it once, from the RusticOven folder:
    python -m backend.seed_data

Safe to run more than once — it clears the products collection first,
so you won't end up with duplicates.
"""

import asyncio
from backend.database import product_collection

SAMPLE_PRODUCTS = [
    # ---------------- Sandwiches ----------------
    {
        "name": "Bread Butter",
        "description": "Simple bread slice and melted butter",
        "category": "sandwiches", "price": 79.0, "image": "/images/dishes/bread-butter.webp", "is_veg": True, "stock": 30,
    },
    {
        "name": "Veg Sandwich",
        "description": "Non-grilled, 3 slices of bread, green chutney, tomato, cucumber, onion, beetroot (optional), sandwich masala",
        "category": "sandwiches", "price": 129.0, "image": "/images/dishes/veg-sandwich.webp", "is_veg": True, "stock": 30,
    },
    {
        "name": "Cheese Sandwich",
        "description": "Grilled sandwich with melted cheese",
        "category": "sandwiches", "price": 139.0, "image": "/images/dishes/cheese-sandwich.webp", "is_veg": True, "stock": 30,
    },
    {
        "name": "Chutney Sandwich",
        "description": "Simple grilled chutney sandwich",
        "category": "sandwiches", "price": 119.0, "image": "/images/dishes/chutney-sandwich.webp", "is_veg": True, "stock": 30,
    },
    {
        "name": "Paneer Sandwich",
        "description": "Marinated grilled paneer sandwich",
        "category": "sandwiches", "price": 159.0, "image": "/images/dishes/paneer-sandwich.webp", "is_veg": True, "stock": 25,
    },
    {
        "name": "Jain Sandwich",
        "description": "Grilled sandwich, no onion and garlic mayo",
        "category": "sandwiches", "price": 139.0, "image": "/images/dishes/jain-sandwich.webp", "is_veg": True, "stock": 25,
    },
    {
        "name": "Grilled Cheese",
        "description": "Cheddar / American cheese with 2 slices, grilled with butter",
        "category": "sandwiches", "price": 149.0, "image": "/images/dishes/grilled-cheese.webp", "is_veg": True, "stock": 30,
    },

    # ---------------- Burgers ----------------
    {
        "name": "Veg Burger",
        "description": "Veg burger patty, pickled onion/jalapeno, tomato, burger sauce or chili garlic sauce",
        "category": "burgers", "price": 179.0, "image": "/images/dishes/veg-burger.webp", "is_veg": True, "stock": 25,
    },
    {
        "name": "Falafel Burger",
        "description": "Same recipe as veg burger, with a falafel patty instead of the veg patty",
        "category": "burgers", "price": 189.0, "image": "/images/dishes/falafel-burger.webp", "is_veg": True, "stock": 20,
    },
    {
        "name": "Paneer Burger",
        "description": "Marinated paneer, same marinade as the paneer sandwich",
        "category": "burgers", "price": 199.0, "image": "/images/dishes/paneer-burger.webp", "is_veg": True, "stock": 20,
    },

    # ---------------- Pizza (Hand Tossed) ----------------
    {
        "name": "Margherita Pizza",
        "description": "Hand tossed base, tomato sauce, mozzarella cheese, cheese spread, basil, vegetable oil",
        "category": "pizza", "price": 299.0, "image": "/images/dishes/margherita-pizza.webp", "is_veg": True, "stock": 20,
    },
    {
        "name": "Neapolitan Pizza",
        "description": "Hand tossed base, tomato sauce, basil, a mix of different cheeses",
        "category": "pizza", "price": 319.0, "image": "/images/dishes/neapolitan-pizza.webp", "is_veg": True, "stock": 20,
    },
    {
        "name": "Farm House Pizza",
        "description": "Hand tossed base, tomato sauce, bell pepper, onion, tomato, green olive, corn",
        "category": "pizza", "price": 329.0, "image": "/images/dishes/farm-house-pizza.webp", "is_veg": True, "stock": 20,
    },
    {
        "name": "Veg Delight Pizza",
        "description": "Hand tossed base, tomato sauce, onion, tomato, bell pepper, cheese",
        "category": "pizza", "price": 309.0, "image": "/images/dishes/veg-delight-pizza.webp", "is_veg": True, "stock": 20,
    },
    {
        "name": "Rustic Oven Special Pizza",
        "description": "Hand tossed base, cheddar, tomato sauce, basil, green olives, pesto drizzle",
        "category": "pizza", "price": 379.0, "image": "/images/dishes/rustic-oven-special-pizza.webp", "is_veg": True, "stock": 15,
    },

    # ---------------- Fries ----------------
    {
        "name": "Salted Fries",
        "description": "Classic salted fries",
        "category": "fries", "price": 99.0, "image": "/images/dishes/salted-fries.webp", "is_veg": True, "stock": 40,
    },
    {
        "name": "Peri Peri Fries",
        "description": "Fries tossed in peri peri seasoning",
        "category": "fries", "price": 119.0, "image": "/images/dishes/peri-peri-fries.webp", "is_veg": True, "stock": 40,
    },
    {
        "name": "Cheese Fries",
        "description": "Fries loaded with melted cheese",
        "category": "fries", "price": 139.0, "image": "/images/dishes/cheese-fries.webp", "is_veg": True, "stock": 35,
    },
    {
        "name": "Peri Peri Cheese Fries",
        "description": "Peri peri seasoned fries loaded with melted cheese",
        "category": "fries", "price": 149.0, "image": "/images/dishes/peri-peri-cheese-fries.webp", "is_veg": True, "stock": 35,
    },

    # ---------------- Beverages ----------------
    {
        "name": "Hot Coffee",
        "description": "Freshly brewed hot coffee",
        "category": "beverages", "price": 89.0, "image": "/images/dishes/hot-coffee.webp", "is_veg": True, "stock": 50,
    },
    {
        "name": "Cold Coffee",
        "description": "Chilled coffee blended with milk",
        "category": "beverages", "price": 109.0, "image": "/images/dishes/cold-coffee.webp", "is_veg": True, "stock": 50,
    },
    {
        "name": "Cold Coffee with Crush",
        "description": "Cold coffee topped with a crushed-ice finish",
        "category": "beverages", "price": 129.0, "image": "/images/dishes/cold-coffee-with-crush.webp", "is_veg": True, "stock": 50,
    },
]

# Give every menu item a stable, local photo URL. The images live in the
# Next.js public directory and are served at /images/dishes/<slug>.webp.
for product in SAMPLE_PRODUCTS:
    slug = product["name"].lower().replace(" ", "-")
    product["image"] = f"/images/dishes/{slug}.webp"


async def seed():
    # Clear existing products first, so re-running this script doesn't
    # keep piling up duplicate entries.
    await product_collection.delete_many({})
    result = await product_collection.insert_many(SAMPLE_PRODUCTS)
    print(f"Inserted {len(result.inserted_ids)} menu items.")


if __name__ == "__main__":
    # asyncio.run() is how you execute an async function from a plain
    # script — FastAPI normally does this for you, but here there's no
    # server involved, just a script we run once by hand.
    asyncio.run(seed())
