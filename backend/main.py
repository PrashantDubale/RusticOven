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

import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routes import products, orders, customers, staff, analytics, auth, pantry, offers, reviews, attendance, tables

load_dotenv()

app = FastAPI(title="Cafe Management API")

# The frontend used to be Streamlit, running server-side in Python —
# no browser CORS restrictions applied to it. Now that it's Next.js,
# every request comes directly from the BROWSER at localhost:3000, a
# different origin than this API at localhost:8000 — without this,
# every fetch() call from the frontend is silently blocked by the
# browser with a CORS error (or, if this middleware is missing
# entirely, the browser's preflight OPTIONS request gets a 405
# Method Not Allowed, since no route explicitly handles OPTIONS).
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in os.getenv(
        "CORS_ORIGINS",
        "http://localhost:3000,http://127.0.0.1:3000",
    ).split(",") if origin.strip()],
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
    return {"message": "Cafe Management API is running"}
