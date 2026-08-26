# 🍕 Rustic Oven — Full-Stack Restaurant Ordering & Management Platform

A full-stack web app for a wood-fired restaurant: a public ordering site for customers and a complete operations dashboard for managers — menu, orders, inventory, staff, purchases, and analytics — all backed by a real database.

<!-- Screenshots -->
![Homepage](./docs/screenshot-home.png)
![Menu](./docs/screenshot-menu.png)
![Manager Dashboard](./docs/screenshot-dashboard.png)

## Live Demo

<!-- Add your deployed URL here once hosted, e.g.: https://rustic-oven.vercel.app -->

## Features

**Customer-facing**
- Browse the full menu with search, category filters, and sorting
- Product detail pages with real photography
- Shopping cart and checkout flow
- Customer account with order history

**Manager dashboard**
- Live sales overview with revenue and order trends
- Order management with status updates (pending → preparing → ready → delivered)
- Product catalog CRUD (create, edit, delete menu items)
- Inventory & expiry tracking for pantry ingredients
- Staff management
- Purchase logging (incoming stock)
- Sales reports and analytics

Fully responsive across mobile, tablet, and desktop.

## Tech Stack

**Frontend**
- [Next.js](https://nextjs.org/) 16 (App Router) + React 19
- Tailwind CSS 4
- [@base-ui/react](https://base-ui.com/) for accessible, styled components (dropdowns, etc.)
- Lucide icons

**Backend**
- [FastAPI](https://fastapi.tiangolo.com/) (Python)
- [MongoDB](https://www.mongodb.com/) via Motor (async driver)
- JWT-based authentication, bcrypt password hashing

## Project Structure

```
RusticOven/
├── frontend/          Next.js app (customer site + manager dashboard)
│   ├── app/             Pages (App Router)
│   ├── components/      Shared UI components
│   ├── lib/              Utilities, formatting, product-image mapping
│   └── services/          API client functions
└── backend/            FastAPI app
    ├── main.py           App entrypoint
    ├── routes/            API route handlers
    ├── models.py          Pydantic schemas
    ├── database.py        MongoDB connection
    └── seed_*.py          Scripts to seed sample data
```

## Running Locally

Requires Node.js 18+, Python 3.10+, and a local or Atlas MongoDB instance.

**1. Backend**
```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS/Linux
pip install -r requirements.txt

# Create backend/.env from backend/.env.example and set:
#   MONGO_URI=mongodb://localhost:27017
#   DB_NAME=cafe_db
#   JWT_SECRET=<any long random string>

uvicorn backend.main:app --reload
```
Runs at `http://localhost:8000` (interactive API docs at `/docs`).

**2. Seed sample data** (from the project root, in a second terminal)
```bash
python -m backend.seed_data
python -m backend.seed_admin
python -m backend.seed_staff
python -m backend.seed_tables
```
Creates a manager login: `dubale@admin.com` / `Admin@123`

**3. Frontend**
```bash
cd frontend
npm install
npm run dev
```
Runs at `http://localhost:3000`.

## License

This project is for portfolio/demonstration purposes.

## Deploying to the Internet

The recommended deployment is Vercel for `frontend/`, Render for `backend/`, and the existing MongoDB Atlas cluster.

### Before deploying

1. Rotate the MongoDB Atlas database password, `JWT_SECRET`, and manager credentials if the values in any local `.env` file have ever been shared.
2. In MongoDB Atlas, allow the Render service's outbound IPs or use the provider's documented network-access option. Keep database authentication enabled.
3. Push the repository to GitHub. It already has a remote configured for `PrashantDubale/RusticOven`.

### Backend on Render

Create a Web Service from the repository. Render can use `render.yaml` in the repository root, or configure these values manually:

- Root directory: `.`
- Build command: `pip install -r backend/requirements.txt`
- Start command: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`

Set these environment variables in Render:

```text
MONGO_URI=<rotated MongoDB Atlas connection string>
DB_NAME=cafe_db
JWT_SECRET=<long random secret>
CORS_ORIGINS=https://<your-vercel-project>.vercel.app
```

Copy the resulting Render URL, for example `https://rustic-oven-api.onrender.com`.

### Frontend on Vercel

Import the GitHub repository into Vercel and set the project root directory to `frontend`. The existing Next.js build settings are sufficient. Add this environment variable before deploying:

```text
NEXT_PUBLIC_API_URL=https://<your-render-service>.onrender.com
```

After the first deployment, replace `CORS_ORIGINS` in Render with the exact final Vercel URL and redeploy the backend. Visit the frontend URL and test signup, login, menu loading, checkout, and manager login.

### Demo data

After the backend is live, run the seed scripts once from a local checkout configured with the production `MONGO_URI`:

```bash
python -m backend.seed_data
python -m backend.seed_admin
python -m backend.seed_staff
python -m backend.seed_tables
```

Do not run seed scripts against production more than once unless they are idempotent and you have verified the effect.
