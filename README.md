## Live Demo

Frontend: https://shopflow-admin-1.onrender.com  
Backend API: https://shopflow-admin.onrender.com  

### Demo Credentials
Email: admin@shopflow.dev  
Password: admin123

## Note: If the demo is slow or unavailable, it may be due to free hosting (server sleep). Please refer to the GitHub code or run locally.

## Architecture

Frontend (React + Vite)  
↓  
FastAPI Backend  
↓  
Database (SQLite + SQLAlchemy)

### Features
- Authentication (JWT)
- Product Management (CRUD)
- Order Processing
- Analytics Dashboard

# ShopFlow - Portfolio E-commerce Admin Dashboard

ShopFlow is a recruiter-ready full-stack admin dashboard for e-commerce operations.  
It focuses on real product/admin workflows with polished SaaS-style UI, production-minded backend structure, and a smooth local demo experience.

## Project Overview

ShopFlow simulates an internal operations tool that a modern commerce team would use to manage products, process orders, and track business performance.  
The app is intentionally scoped to be realistic but maintainable for a first serious full-stack portfolio project.

## Core Features

- Secure auth flow with JWT (`register`, `login`, `me`)
- Role-based access control (`admin`, `staff`)
- Premium dark dashboard UI with responsive sidebar and top nav
- Analytics overview with KPI cards, revenue trend, status breakdown, and activity feed
- Product management with:
  - search + category filter
  - server-side pagination
  - stock/status badges
  - create/edit modal with client validation
  - safe delete behavior
- Order management with:
  - search + status/date filters
  - server-side pagination
  - status updates
  - order details modal
- Toast notifications, loading skeletons, empty/error states
- Rich seeded demo data for immediate first impression

## Why This Project Stands Out

- Designed as a realistic internal SaaS product, not a tutorial clone
- Prioritizes UX details recruiters notice: resilient states, consistent data hierarchy, premium visual system
- Uses production-style backend/frontend separation with clear API contracts and extensible structure
- Includes graceful fallback behavior so demos remain usable even with temporary API issues

## Tech Stack

### Frontend
- React + Vite
- Tailwind CSS
- Recharts
- Framer Motion
- Lucide Icons
- Axios + React Router

### Backend
- FastAPI
- SQLAlchemy
- Pydantic
- JWT (`python-jose`)
- Password hashing (`passlib`)
- SQLite for local development
- PostgreSQL-ready data layer pattern

## Folder Structure

```bash
ShopFlow/
  backend/
    app/
      main.py
      database.py
      models.py
      schemas.py
      auth.py
      dependencies.py
      routers/
        auth.py
        products.py
        orders.py
        analytics.py
    requirements.txt
  frontend/
    src/
      api/
      components/
      layouts/
      pages/
      utils/
```

## Local Setup

### 1) Clone and enter project

```bash
git clone <your-repo-url>
cd ShopFlow
```

### 2) Run backend

```bash
cd backend
python -m venv .venv
# PowerShell
.venv\Scripts\python -m pip install -r requirements.txt
.venv\Scripts\python -m uvicorn app.main:app --reload
```

Backend URL: [http://127.0.0.1:8000](http://127.0.0.1:8000)

### 3) Run frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend URL: [http://localhost:5173](http://localhost:5173)

## Environment Variables

### Backend (`backend/.env.example`)
- `DATABASE_URL=sqlite:///./shopflow.db`
- `SECRET_KEY=change-me-in-production`

### Frontend (`frontend/.env.example`)
- `VITE_API_URL=http://127.0.0.1:8000`

## Demo Credentials

- Email: `admin@shopflow.dev`
- Password: `admin123`
- Staff (optional): `maya@shopflow.dev` / `staff123`

## API Docs

- Swagger UI: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

## Architecture Diagram

```text
[ React + Vite Dashboard ]
          |
          | REST / JSON
          v
[ FastAPI API Layer ]
  | Auth + RBAC
  | Products / Orders / Analytics
          |
          v
[ SQLAlchemy ORM ]
          |
          v
[ SQLite (dev) / PostgreSQL (prod) ]
```

## Screenshots

Add screenshots here for portfolio polish:

- `docs/screenshots/login.png`
- `docs/screenshots/dashboard.png`
- `docs/screenshots/products.png`
- `docs/screenshots/orders.png`

## Deployment Notes

- Backend: Render / Railway / Fly.io
- Frontend: Vercel / Netlify
- Configure `VITE_API_URL` to deployed backend URL
- Move secrets to environment variables in production
- Add HTTPS + tighter CORS + token lifecycle hardening for production readiness

## Suggested Demo Walkthrough (For Recruiters)

1. Sign in with admin credentials and land on the analytics dashboard.





2. Open Products: filter by category, search by keyword, then create/edit a product.
3. Open Orders: search by order number, inspect customer details, and update status.
4. Return to Dashboard and explain how summary metrics connect to operational workflows.
