"""
main.py
-------
This is the entrypoint of the backend — the file you actually run.
Its only job is to create the FastAPI app and plug in the routers
from the routes/ folder.

Run it with (from the RusticOven folder):
    uvicorn backend.main:app --reload

Then open http://127.0.0.1:8000/docs — FastAPI auto-generates an
interactive API doc page from your Pydantic models. This is one of
the best ways to test your backend before the frontend even exists.
"""

import logging
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pymongo.errors import PyMongoError
from backend.database import client, database
from backend.routes import products, orders, customers, staff, analytics, auth, pantry, offers, reviews, attendance, tables

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        try:
            await database.command("ping")
        except PyMongoError:
            logger.exception("MongoDB connection failed during startup")
            raise

        logger.info("Connected to MongoDB database '%s'", database.name)
        yield
    finally:
        client.close()


app = FastAPI(title="Cafe Management API", lifespan=lifespan)

# The frontend used to be Streamlit, running server-side in Python —
# no browser CORS restrictions applied to it. Now that it's Next.js,
# every request comes directly from the BROWSER at localhost:3000, a
# different origin than this API at localhost:8000 — without this,
# every fetch() call from the frontend is silently blocked by the
# browser with a CORS error (or, if this middleware is missing
# entirely, the browser's preflight OPTIONS request gets a 405
# Method Not Allowed, since no route explicitly handles OPTIONS).
configured_origins = os.getenv("FRONTEND_ORIGINS") or os.getenv(
    "CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000"
)
frontend_origins = [origin.strip() for origin in configured_origins.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        *frontend_origins,
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],  # includes Authorization, used by
    # require_manager() in deps.py for manager-only write endpoints.
)

# include_router plugs each resource's endpoints into this app.
# One line per resource — main.py stays short even as the app grows.
app.include_router(products.router)
app.include_router(orders.router)
app.include_router(customers.router)
app.include_router(staff.router)
app.include_router(analytics.router)
app.include_router(auth.router)
app.include_router(pantry.router)
app.include_router(offers.router)
app.include_router(reviews.router)
app.include_router(attendance.router)
app.include_router(tables.router)


@app.get("/")
async def root():
    """A simple health-check so you know the server + Mongo are alive."""
    await database.command("ping")
    return {"message": "Cafe Management API is running"}
