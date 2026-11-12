# Rustic Oven

Restaurant ordering and management app with a Next.js customer website and FastAPI/MongoDB API. The old Streamlit frontend has been removed from this release.

## Menu

The sample menu contains 22 dishes. Each has its own optimized WebP photo under `frontend/public/images/dishes/`:

- **Sandwiches:** Bread Butter, Veg Sandwich, Cheese Sandwich, Chutney Sandwich, Paneer Sandwich, Jain Sandwich, Grilled Cheese
- **Burgers:** Veg Burger, Falafel Burger, Paneer Burger
- **Hand-tossed pizza:** Margherita Pizza, Neapolitan Pizza, Farm House Pizza, Veg Delight Pizza, Rustic Oven Special Pizza
- **Fries:** Salted Fries, Peri Peri Fries, Cheese Fries, Peri Peri Cheese Fries
- **Beverages:** Hot Coffee, Cold Coffee, Cold Coffee with Crush

Prices in `backend/seed_data.py` are sample INR prices and can be changed there or in the manager product screen. Seeding replaces the existing products collection, so run it only when you intend to replace that menu.

## Run locally

1. Start MongoDB. Copy `backend/.env.example` to `backend/.env` and set `MONGO_URI`, `DB_NAME`, and a long random `JWT_SECRET`.
2. From the project root, install backend dependencies and seed the menu if your database does not already contain it:

   ```powershell
   pip install -r backend/requirements.txt
   python -m backend.seed_data
   $env:ADMIN_NAME = "Your Name"
   $env:ADMIN_EMAIL = "you@example.com"
   $env:ADMIN_PASSWORD = "use-a-long-unique-password"
   python -m backend.seed_admin
   uvicorn backend.main:app --reload
   ```

3. In another terminal, configure the frontend and run it:

   ```sh
   cd frontend
   npm install
   # Copy .env.example to .env.local (the default API URL is localhost:8000)
   npm run dev
   ```

The website runs at `http://localhost:3000`; the API docs are at `http://localhost:8000/docs`.

## Publish

The production frontend is already connected to GitHub (`main`, project root `frontend`) and deploys when changes are pushed. The existing Render API service also watches `main` on the Free plan. MongoDB Atlas is the hosted database.

1. In Atlas, create a database user limited to `cafe_db` and allow the Render service to connect. Keep the Atlas URI and credentials private.
2. In Render, set `MONGO_URI`, `DB_NAME=cafe_db`, `JWT_SECRET`, and `CORS_ORIGINS=https://rustic-oven.vercel.app`. Do not commit these secrets.
3. In Vercel, keep `NEXT_PUBLIC_API_URL` set to `https://rusticoven.onrender.com` and the project root set to `frontend`.
4. Seed the hosted database only if the menu is empty. `python -m backend.seed_data` replaces the products collection. To create a manager, set unique `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` variables in a trusted shell before running `python -m backend.seed_admin`.

The favicon, ICO icon, and Apple touch icon use the supplied Rustic Oven emblem. Never commit `.env`, `.env.local`, or real credentials. This project is a portfolio/demo; update sample menu prices and contact details before using it for a real restaurant.
