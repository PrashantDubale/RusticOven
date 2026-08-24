"""
routes/reviews.py
-------------------
Customer reviews on menu items.

  GET  /reviews/                    -> all reviews, newest first
  GET  /reviews/product/{product_id} -> reviews for one product
  POST /reviews/                     -> submit a new review
"""

from datetime import datetime, timezone

from fastapi import APIRouter

from backend.database import review_collection
from backend.models import ReviewIn, ReviewOut

router = APIRouter(prefix="/reviews", tags=["reviews"])


def review_helper(doc) -> dict:
    return {
        "id": str(doc["_id"]),
        "product_id": doc["product_id"],
        "product_name": doc["product_name"],
        "customer_name": doc["customer_name"],
        "rating": doc["rating"],
        "comment": doc.get("comment"),
        "created_at": doc["created_at"],
    }


@router.get("/", response_model=list[ReviewOut])
async def list_reviews():
    reviews = []
    async for doc in review_collection.find().sort("created_at", -1):
        reviews.append(review_helper(doc))
    return reviews


@router.get("/product/{product_id}", response_model=list[ReviewOut])
async def reviews_for_product(product_id: str):
    reviews = []
    async for doc in review_collection.find({"product_id": product_id}).sort("created_at", -1):
        reviews.append(review_helper(doc))
    return reviews


@router.post("/", response_model=ReviewOut)
async def create_review(review: ReviewIn):
    doc = review.model_dump()
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    result = await review_collection.insert_one(doc)
    new_doc = await review_collection.find_one({"_id": result.inserted_id})
    return review_helper(new_doc)
