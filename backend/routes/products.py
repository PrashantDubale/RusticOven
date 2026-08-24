"""
routes/products.py
-------------------
This file defines the actual URLs (endpoints) for working with products:
  GET    /products        -> list all products
  POST   /products         -> create a new product
  PUT    /products/{id}    -> update an existing product
  DELETE /products/{id}    -> remove a product

Why put routes in their own file instead of main.py?
Because soon you'll also have routes for orders, customers, staff, etc.
If everything lived in main.py, that one file would grow to thousands
of lines. Instead, each "resource" (products, orders...) gets its own
small file, and main.py just plugs them all together. This pattern is
called an "APIRouter" in FastAPI.
"""

from fastapi import APIRouter, HTTPException, Depends
from bson import ObjectId

from backend.database import product_collection
from backend.models import ProductIn, ProductOut, ProductUpdate
from backend.deps import require_manager

router = APIRouter(prefix="/products", tags=["products"])


def product_helper(doc) -> dict:
    """
    MongoDB gives every document an "_id" field of type ObjectId —
    a special MongoDB type, not a plain string. FastAPI/Pydantic can't
    send an ObjectId back as JSON directly, so this helper converts a
    raw MongoDB document into the plain dict shape our ProductOut model
    expects (with "id" as a string).
    """
    return {
        "id": str(doc["_id"]),
        "name": doc["name"],
        "description": doc["description"],
        "category": doc["category"],
        "price": doc["price"],
        "image": doc.get("image"),
        "is_veg": doc["is_veg"],
        "stock": doc["stock"],
        "is_featured": doc.get("is_featured", False),  # .get() with a
        # default, since products created before this field existed
        # won't have it in MongoDB — this way old data doesn't crash.
    }


@router.get("/", response_model=list[ProductOut])
async def list_products():
    """Return every product in the menu."""
    products = []
    # "async for" streams documents one at a time instead of loading
    # everything into memory at once — this is the async/Motor way of
    # doing what you'd write as a for-loop over a pymongo cursor.
    async for doc in product_collection.find():
        products.append(product_helper(doc))
    return products


@router.get("/featured", response_model=list[ProductOut])
async def featured_products():
    """Products the manager has marked as featured, for the Home page."""
    products = []
    async for doc in product_collection.find({"is_featured": True}):
        products.append(product_helper(doc))
    return products


@router.post("/", response_model=ProductOut)
async def create_product(product: ProductIn, manager=Depends(require_manager)):
    """Add a new product to the menu. Manager-only — see backend/deps.py."""
    # .model_dump() turns the Pydantic model back into a plain dict,
    # which is what Motor needs to insert into MongoDB.
    result = await product_collection.insert_one(product.model_dump())
    new_doc = await product_collection.find_one({"_id": result.inserted_id})
    return product_helper(new_doc)


@router.get("/{product_id}", response_model=ProductOut)
async def get_product(product_id: str):
    """Get one product by its id."""
    if not ObjectId.is_valid(product_id):
        raise HTTPException(status_code=400, detail="Invalid product id")
    doc = await product_collection.find_one({"_id": ObjectId(product_id)})
    if doc is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return product_helper(doc)


@router.put("/{product_id}", response_model=ProductOut)
async def update_product(product_id: str, product: ProductUpdate, manager=Depends(require_manager)):
    """Update one or more fields of an existing product. Manager-only."""
    if not ObjectId.is_valid(product_id):
        raise HTTPException(status_code=400, detail="Invalid product id")

    # exclude_unset=True means: only include fields the caller actually
    # sent. If the Streamlit form only sends {"price": 250}, we don't
    # want to accidentally overwrite name/description/etc. with None.
    update_data = product.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")

    result = await product_collection.update_one(
        {"_id": ObjectId(product_id)}, {"$set": update_data}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")

    updated_doc = await product_collection.find_one({"_id": ObjectId(product_id)})
    return product_helper(updated_doc)


@router.delete("/{product_id}")
async def delete_product(product_id: str, manager=Depends(require_manager)):
    """Remove a product from the menu entirely. Manager-only — see backend/deps.py."""
    if not ObjectId.is_valid(product_id):
        raise HTTPException(status_code=400, detail="Invalid product id")
    result = await product_collection.delete_one({"_id": ObjectId(product_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product deleted"}
