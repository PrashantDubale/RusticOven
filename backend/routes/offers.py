"""
routes/offers.py
------------------
Cafe-wide promotions the manager can create from the dashboard, shown
to customers on the Home page.

  GET  /offers/           -> list all offers
  GET  /offers/active      -> only currently-active offers (for Home page)
  POST /offers/            -> create a new offer
  PUT  /offers/{id}/toggle -> flip an offer active/inactive
"""

from fastapi import APIRouter, HTTPException
from bson import ObjectId

from backend.database import offer_collection
from backend.models import OfferIn, OfferOut

router = APIRouter(prefix="/offers", tags=["offers"])


def offer_helper(doc) -> dict:
    return {
        "id": str(doc["_id"]),
        "title": doc["title"],
        "description": doc["description"],
        "discount_percent": doc["discount_percent"],
        "active": doc["active"],
    }


@router.get("/", response_model=list[OfferOut])
async def list_offers():
    offers = []
    async for doc in offer_collection.find():
        offers.append(offer_helper(doc))
    return offers


@router.get("/active", response_model=list[OfferOut])
async def active_offers():
    offers = []
    async for doc in offer_collection.find({"active": True}):
        offers.append(offer_helper(doc))
    return offers


@router.post("/", response_model=OfferOut)
async def create_offer(offer: OfferIn):
    result = await offer_collection.insert_one(offer.model_dump())
    new_doc = await offer_collection.find_one({"_id": result.inserted_id})
    return offer_helper(new_doc)


@router.put("/{offer_id}/toggle", response_model=OfferOut)
async def toggle_offer(offer_id: str):
    if not ObjectId.is_valid(offer_id):
        raise HTTPException(status_code=400, detail="Invalid offer id")
    doc = await offer_collection.find_one({"_id": ObjectId(offer_id)})
    if doc is None:
        raise HTTPException(status_code=404, detail="Offer not found")
    await offer_collection.update_one(
        {"_id": ObjectId(offer_id)}, {"$set": {"active": not doc["active"]}}
    )
    updated = await offer_collection.find_one({"_id": ObjectId(offer_id)})
    return offer_helper(updated)
