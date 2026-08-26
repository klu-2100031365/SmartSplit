# SmartSplit — Bill Splitting & Personal Expense Manager

SmartSplit is a full-stack web application for **shared expense tracking**, **trip bill splitting**, and **personal daily spending**. It uses a **monorepo** layout with a **Next.js** frontend and a **FastAPI** backend backed by **PostgreSQL**.

---

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Frontend Routes](#frontend-routes)
- [Backend API](#backend-api)
- [Database Schema](#database-schema)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Scripts & Commands](#scripts--commands)
- [Default Admin Account](#default-admin-account)
- [Roadmap & Known Gaps](#roadmap--known-gaps)

---

## Features

### Authentication & Sessions

- User registration and login
- JWT bearer-token authentication
- Session persistence via `localStorage` (token + user profile)
- Protected routes on the frontend (`ProtectedRoute`)
- Admin users are redirected from the dashboard to `/admin`

### Dashboard

- Overview of total tracked expenses and active trips
- Pending settlements count with per-module breakdown
- Quick-access cards for Trips, Daily Expenses, Activities, Bills, and SIPs
- Animated landing page with hero, features, how-it-works, stats, and CTA sections

### Trips Module

- Create, edit, and view trips with custom icons or images
- Multi-currency support per trip
- Add and manage participants
- Add expenses with categories (Food, Transport, Shopping, etc.)
- Multi-payer and custom split-among support
- Settlement calculation (who owes whom)
- Analytics: category breakdown, daily spend charts, per-participant stats
- Share modal and activity log UI (partial backend support — see [Roadmap](#roadmap--known-gaps))

### Daily Expenses

- Track personal everyday spending
- Default categories seeded per user (Food & Dining, Transport, Shopping, Bills, Entertainment, Health, Home, Others)
- Payment methods: Cash, Card, UPI, Net Banking, Other
- Monthly salary setting with spending insights (safe / caution / overspending)
- Category breakdown charts and stats
- Sync from other modules (trips, dining, movies, play) — UI ready; sync endpoints return stub counts
- Search and filter recent expenses

### Activities (Dining, Movies, Play)

- Dedicated hubs under `/activities` for dining, movies, and play events
- Event cards with expense summaries and navigation to detail views
- Reuses the trip/expense engine with activity-specific `type` values
- GIF-based category visuals and group expense splitting

### Bills & Subscriptions

- Track recurring bills and subscriptions
- Monthly totals (bills vs. subs)
- Upcoming due dates and reminder indicators
- Auto-pay toggle and active/inactive status
- *Note: UI is complete; backend currently returns stub/empty data (no DB tables yet)*

### SIPs & Investments

- Placeholder module at `/sips` (“coming soon”)
- Chat assistant includes SIP/investment knowledge for guidance

### Profile & Settings

- Edit name, phone, default currency, timezone, and language
- Notification preferences
- Trip history and expense overview on profile
- **AI chat assistant** on the profile page (OpenAI when configured, rule-based fallback otherwise)

### Admin Panel

- List all registered users
- Delete users
- *Note: admin route protection on the API is not yet enforced*

### Utility Tools (Navbar)

- Built-in **calculator** modal
- **Currency converter** with live exchange rates
- **Dark / light theme** toggle
- Smooth scroll (Lenis) and scroll progress bar

### Public Share Links

- Guest-facing share page at `/share/[token]`
- Guest name flow via app context
- *Note: share token resolution returns stub data on the backend*

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Browser (localhost:3000)                 │
│  Next.js 16 App Router · React 19 · Tailwind CSS 4          │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────┐ │
│  │ App Pages   │  │ API Routes   │  │ lib/api → FastAPI   │ │
│  │ /trips etc. │  │ /api/exchange│  │ Bearer JWT auth     │ │
│  └─────────────┘  └──────────────┘  └──────────┬──────────┘ │
└────────────────────────────────────────────────┼────────────┘
                                                 │ HTTP (CORS)
┌────────────────────────────────────────────────▼────────────┐
│                  FastAPI Backend (localhost:8000)          │
│  ┌──────────┐  ┌───────────┐  ┌──────────────────────────┐  │
│  │ Routes   │→ │ Services  │→ │ SQLAlchemy Models        │  │
│  │ /auth    │  │ daily_exp │  │ users, trips, expenses…  │  │
│  │ /trips   │  │ chat_*    │  └────────────┬─────────────┘  │
│  └──────────┘  └───────────┘               │                │
└────────────────────────────────────────────┼────────────────┘
                                             │
                              ┌──────────────▼──────────────┐
                              │   PostgreSQL (smartsplit)   │
                              └─────────────────────────────┘
```

**Data flow:** The frontend calls the FastAPI REST API through `frontend/lib/api/client.ts`. JWT tokens are stored in `localStorage` and sent as `Authorization: Bearer <token>`. Exchange-rate endpoints are served by Next.js API routes (`/api/exchange-rates`) using public ECB/ER APIs.

---

## Tech Stack

| Layer | Technologies |
|-------|--------------|
| **Frontend** | Next.js 16, React 19, TypeScript 5, Tailwind CSS 4, Framer Motion, Lenis, Lucide React, shadcn/ui |
| **Backend** | FastAPI, Uvicorn, Pydantic v2, SQLAlchemy 2, Alembic |
| **Database** | PostgreSQL (`psycopg` driver) |
| **Auth** | JWT (python-jose), bcrypt (passlib) |
| **AI Chat** | OpenAI API (optional) + rule-based fallback |

---

## Project Structure

```
SmartSplit/
│
├── README.md                          # This file
├── .gitignore
├── .vscode/
│   └── settings.json
│
├── backend/                           # FastAPI application
│   ├── README.md
│   ├── requirements.txt
│   ├── alembic.ini
│   │
│   ├── alembic/
│   │   ├── env.py
│   │   ├── script.py.mako
│   │   └── versions/                  # Database migrations
│   │       ├── 9b0448c895e4_create_users_table.py
│   │       ├── b52385221b80_add_trips_participants_and_expenses.py
│   │       ├── 0f988ba10e4a_add_user_profile_fields.py
│   │       ├── 6a8c11c511d7_add_profile_fields_to_user.py
│   │       ├── 267bc64a5aa2_add_created_at_last_login_and_profile_.py
│   │       ├── 7da57c4e16b6_add_login_count_and_total_expenses.py
│   │       ├── b99ac05d4dd7_add_is_admin_to_users.py
│   │       ├── f3f00c65e9f3_fix_missing_profile_fields.py
│   │       └── c8e1f2a3b4d5_add_daily_expenses_tables.py
│   │
│   ├── app/
│   │   ├── main.py                    # FastAPI app entry + CORS middleware
│   │   ├── models.py                  # SQLAlchemy ORM models
│   │   │
│   │   ├── api/
│   │   │   ├── router.py              # Mounts all route modules
│   │   │   ├── deps.py                # get_db, get_current_user_id (JWT)
│   │   │   └── routes/
│   │   │       ├── auth.py            # POST /auth/register, /auth/login
│   │   │       ├── dashboard.py       # GET /me/stats
│   │   │       ├── me.py              # Profile, salary, trip-shares
│   │   │       ├── trips.py           # Trips, participants, expenses CRUD
│   │   │       ├── participants.py    # PATCH /participants/{id}
│   │   │       ├── daily_expenses.py  # Daily expenses + categories + stats
│   │   │       ├── activities.py      # Dining / movies / play event lists
│   │   │       ├── bills.py           # Recurring bills (stub)
│   │   │       ├── share.py           # Public share token lookup (stub)
│   │   │       ├── admin.py           # User management
│   │   │       └── chat.py            # POST /chat/message
│   │   │
│   │   ├── core/
│   │   │   ├── config.py              # Settings from .env
│   │   │   └── security.py            # Password hashing + JWT
│   │   │
│   │   ├── db/
│   │   │   ├── base.py                # SQLAlchemy DeclarativeBase
│   │   │   └── session.py             # Engine + SessionLocal
│   │   │
│   │   ├── schemas/                   # Pydantic request/response models
│   │   │   ├── auth.py
│   │   │   ├── trips.py
│   │   │   ├── daily_expenses.py
│   │   │   ├── bills.py
│   │   │   ├── me.py
│   │   │   ├── chat.py
│   │   │   ├── share.py
│   │   │   └── common.py              # APIModel (camelCase aliases)
│   │   │
│   │   └── services/
│   │       ├── daily_expenses.py      # DB-backed daily expense logic
│   │       ├── chat_context.py        # Builds user context for AI
│   │       └── chat_assistant.py      # OpenAI + fallback replies
│   │
│   └── scripts/
│       ├── init_db.py                 # create_all + seed admin user
│       └── fix_alembic.py             # Alembic version repair utility
│
└── frontend/                          # Next.js application
    ├── README.md
    ├── package.json
    ├── next.config.ts
    ├── tsconfig.json                  # Path alias: @/* → frontend/*
    ├── postcss.config.mjs
    ├── components.json                # shadcn configuration
    │
    ├── app/                           # Next.js App Router
    │   ├── layout.tsx                 # Root layout (providers, smooth scroll)
    │   ├── page.tsx                   # Landing page (/)
    │   ├── globals.css
    │   ├── providers.tsx              # ErrorBoundary, Motion, AppContext
    │   ├── loading.tsx
    │   ├── not-found.tsx
    │   │
    │   ├── login/page.tsx
    │   ├── register/page.tsx
    │   ├── dashboard/page.tsx
    │   ├── profile/page.tsx
    │   ├── admin/page.tsx
    │   ├── trips/
    │   │   ├── page.tsx
    │   │   └── [id]/page.tsx
    │   ├── daily-expenses/page.tsx
    │   ├── bills/page.tsx
    │   ├── sips/page.tsx
    │   ├── activities/
    │   │   ├── page.tsx
    │   │   ├── dining/page.tsx
    │   │   ├── dining/[eventname]/page.tsx
    │   │   ├── movies/page.tsx
    │   │   ├── movies/[eventname]/page.tsx
    │   │   ├── play/page.tsx
    │   │   └── play/[eventname]/page.tsx
    │   ├── share/[token]/page.tsx
    │   │
    │   └── api/                       # Next.js server routes
    │       └── exchange-rates/
    │           ├── route.ts
    │           └── history/route.ts
    │
    ├── components/
    │   ├── auth/
    │   │   ├── AuthPage.tsx
    │   │   └── ProtectedRoute.tsx
    │   ├── layout/
    │   │   ├── AppShell.tsx
    │   │   ├── Navbar.tsx
    │   │   ├── Footer.tsx
    │   │   └── Loader.tsx
    │   ├── trips/
    │   │   └── TripDetail.tsx
    │   ├── activities/
    │   │   ├── ActivityEventCard.tsx
    │   │   └── ActivityEventDetail.tsx
    │   ├── cards/
    │   │   ├── TripCard.tsx
    │   │   ├── ExpenseCard.tsx
    │   │   └── BalanceCard.tsx
    │   ├── charts/
    │   │   ├── ExpenseChart.tsx
    │   │   ├── BalanceChart.tsx
    │   │   └── CurrencyTrendChart.tsx
    │   ├── chat/
    │   │   └── ProfileChatbot.tsx
    │   ├── landing/
    │   │   ├── LandingFeatures.tsx
    │   │   ├── LandingHowItWorks.tsx
    │   │   ├── LandingStats.tsx
    │   │   └── LandingCTA.tsx
    │   ├── sections/
    │   │   └── HeroSection.tsx
    │   ├── modals/
    │   │   ├── AddTripModal.tsx
    │   │   ├── AddExpenseModal.tsx
    │   │   ├── AddDailyExpenseModal.tsx
    │   │   ├── AddActivityEventModal.tsx
    │   │   ├── AddRecurringItemModal.tsx
    │   │   ├── ShareModal.tsx
    │   │   ├── ActivityLogModal.tsx
    │   │   ├── SyncSourcesModal.tsx
    │   │   ├── CalculatorModal.tsx
    │   │   └── CurrencyConverterModal.tsx
    │   ├── motion/
    │   │   ├── MotionProvider.tsx
    │   │   ├── PageTransition.tsx
    │   │   └── Reveal.tsx
    │   └── ui/
    │       ├── Button.tsx, Card.tsx, Modal.tsx, Input.tsx, Select.tsx
    │       ├── ModuleCard.tsx, Badge.tsx, CurrencySelector.tsx
    │       ├── SmartSplitLogo.tsx, SmoothScroll.tsx
    │       └── animated-theme-toggler.tsx, Text3DFlip.tsx
    │
    ├── context/
    │   └── AppContext.tsx             # Auth, Theme, Currency, Splash contexts
    │
    ├── lib/
    │   ├── api/
    │   │   ├── index.ts               # Unified `api` export
    │   │   ├── client.ts              # HTTP client + ApiError
    │   │   ├── auth.ts
    │   │   ├── trips.ts
    │   │   ├── dailyExpenses.ts
    │   │   ├── activities.ts
    │   │   ├── bills.ts
    │   │   ├── dashboard.ts
    │   │   ├── profile.ts
    │   │   ├── share.ts
    │   │   ├── admin.ts
    │   │   ├── chat.ts
    │   │   └── types.ts
    │   ├── server/
    │   │   └── exchangeProviders.ts   # Frankfurter + ER-API providers
    │   ├── constants.ts               # Category styles, trip icons, currencies
    │   ├── formatters.ts
    │   └── utils.ts
    │
    ├── types/
    │   └── index.ts                   # Shared TypeScript interfaces
    │
    └── public/                        # Static assets (GIFs, logos, SVGs)
```

---

## Frontend Routes

| Route | Description | Auth |
|-------|-------------|------|
| `/` | Marketing landing page | Public |
| `/login` | Sign in | Public |
| `/register` | Create account | Public |
| `/dashboard` | User overview & quick access | Protected |
| `/trips` | Trip list | Protected |
| `/trips/[id]` | Trip detail, expenses, settlements | Protected |
| `/daily-expenses` | Personal spending tracker | Protected |
| `/activities` | Activities hub | Protected |
| `/activities/dining` | Dining events | Protected |
| `/activities/dining/[eventname]` | Dining event detail | Protected |
| `/activities/movies` | Movie events | Protected |
| `/activities/movies/[eventname]` | Movie event detail | Protected |
| `/activities/play` | Play / games events | Protected |
| `/activities/play/[eventname]` | Play event detail | Protected |
| `/bills` | Bills & subscriptions | Protected |
| `/sips` | SIPs placeholder | Protected |
| `/profile` | Profile + AI chatbot | Protected |
| `/admin` | User management | Admin (UI only) |
| `/share/[token]` | Guest share view | Public |

---

## Backend API

Interactive docs: **http://localhost:8000/docs**

| Prefix | Endpoints | Status |
|--------|-----------|--------|
| `POST /auth/register` | Create user | ✅ |
| `POST /auth/login` | Login, returns JWT | ✅ |
| `GET /me/stats` | Dashboard statistics | ✅ |
| `GET/PUT /me/profile` | User profile | ✅ |
| `GET/PUT /me/salary` | Monthly salary | ✅ |
| `GET /me/trip-shares` | Per-trip user shares | ✅ |
| `GET/POST /trips` | List / create trips | ✅ |
| `PATCH /trips/{id}` | Update trip | ✅ |
| `GET /trips/{id}/view` | Full trip detail + analytics | ✅ |
| `POST /trips/{id}/participants` | Add participant | ✅ |
| `DELETE /trips/{id}/participants/{pid}` | Remove participant | ✅ |
| `POST /trips/{id}/expenses` | Add expense | ✅ |
| `PATCH/DELETE /trips/{id}/expenses/{eid}` | Update / delete expense | ✅ |
| `PATCH /participants/{id}` | Rename participant | ✅ |
| `GET/POST /daily-expenses` | List / create daily expenses | ✅ |
| `PATCH/DELETE /daily-expenses/{id}` | Update / delete | ✅ |
| `GET /daily-expenses/categories` | User categories (auto-seeded) | ✅ |
| `GET /daily-expenses/stats` | Spending statistics | ✅ |
| `POST /daily-expenses/sync` | Sync from modules | Stub |
| `POST /daily-expenses/unsync` | Unsync expenses | Stub |
| `GET /activities/{type}/events` | Activity event lists | Stub (empty) |
| `GET/POST /bills/items` | Recurring items | Stub |
| `GET /bills/overview` | Bills overview | Stub |
| `GET /share/{token}` | Share link data | Stub |
| `GET /admin/users` | List users | ✅ |
| `DELETE /admin/users/{id}` | Delete user | ✅ |
| `POST /chat/message` | AI chat reply | ✅ |

---

## Database Schema

| Table | Purpose |
|-------|---------|
| `users` | Accounts, profile, salary, admin flag, preferences |
| `trips` | Trips and activity events (`type`: trip, dining, movies, play) |
| `participants` | Members per trip/event |
| `expenses` | Shared expenses per trip (paid_by, split_among as JSON) |
| `daily_categories` | Per-user expense categories |
| `daily_expenses` | Per-user personal expenses with optional sync metadata |

Relationships: `User` → many `Trip` → many `Participant` / `Expense`. `User` → many `DailyCategory` / `DailyExpense`.

---

## Getting Started

### Prerequisites

- **Node.js** 18+ (for the frontend)
- **Python** 3.11+ (for the backend)
- **PostgreSQL** with a database named `smartsplit` (or adjust `DATABASE_URL`)

### 1. Clone the repository

```bash
git clone https://github.com/DatlaSudeepVarma/SmartSplit.git
cd SmartSplit
```

### 2. Backend setup

```bash
cd backend
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS / Linux
source .venv/bin/activate

pip install -r requirements.txt
```

Create `backend/.env` (copy from a local template — **never commit this file**):

```env
DATABASE_URL=postgresql+psycopg://USER:PASSWORD@HOST:5432/DATABASE
SECRET_KEY=<generate-a-long-random-string>
ACCESS_TOKEN_EXPIRE_MINUTES=10080
OPENAI_API_KEY=<your-openai-api-key>   # optional — enables AI chat
OPENAI_MODEL=gpt-4o-mini
```

Generate a secret key locally, for example:

```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

Run migrations:

```bash
alembic upgrade head
```

Or initialize tables and seed a development admin user (local only):

```bash
python scripts/init_db.py
```

> **Security:** Review and customize credentials in `backend/scripts/init_db.py` before running. Do not use seeded development accounts in production.

Start the API server:

```bash
uvicorn app.main:app --reload --port 8000
```

API: http://localhost:8000 · Docs: http://localhost:8000/docs

### 3. Frontend setup

```bash
cd frontend
npm install
```

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Start the dev server:

```bash
npm run dev
```

App: http://localhost:3000

### 4. Production build (frontend)

```bash
npm run build
npm run start
```

---

## Environment Variables

> **Do not commit secrets.** Keep `backend/.env` and `frontend/.env.local` out of version control (see `.gitignore`).

### Backend (`backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string (`postgresql+psycopg://USER:PASSWORD@HOST:PORT/DB`) |
| `SECRET_KEY` | Yes | Long random string for JWT signing — generate per environment |
| `ALGORITHM` | No | JWT algorithm (default: `HS256`) |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | No | Token lifetime (default: 7 days) |
| `CORS_ORIGINS` | No | Comma-separated allowed origins for production |
| `OPENAI_API_KEY` | No | Optional OpenAI key for profile chatbot |
| `OPENAI_MODEL` | No | OpenAI model name (default: `gpt-4o-mini`) |

### Frontend (`frontend/.env.local`)

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Yes | FastAPI base URL (e.g. `http://localhost:8000` in development) |

Exchange-rate routes use public APIs (Frankfurter ECB, open.er-api.com) and require no API keys.

---

## Scripts & Commands

### Frontend (`frontend/`)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js dev server on port 3000 |
| `npm run build` | Production build |
| `npm run start` | Run production server |
| `npm run lint` | Run ESLint |

### Backend (`backend/`)

| Command | Description |
|---------|-------------|
| `uvicorn app.main:app --reload` | Start API with hot reload |
| `alembic upgrade head` | Apply all migrations |
| `alembic revision --autogenerate -m "msg"` | Create a new migration |
| `python scripts/init_db.py` | Create tables + optional local admin seed |
| `python scripts/fix_alembic.py` | Reset Alembic version (utility) |

---

## Security (public repository)

This repo is public. Treat the following as mandatory for any deployment:

1. **Environment files** — Never commit `backend/.env`, `frontend/.env.local`, or real API keys.
2. **`SECRET_KEY`** — Use a unique, randomly generated value per environment.
3. **Database** — Use strong database credentials; do not rely on local-only defaults.
4. **Admin seed** — If you run `scripts/init_db.py`, change seeded admin credentials before exposing the app.
5. **Production** — Restrict `CORS_ORIGINS`, use HTTPS, and rotate secrets if they were ever exposed.

---

## Roadmap & Known Gaps

| Area | Status |
|------|--------|
| Trip delete (`DELETE /trips/{id}`) | Frontend calls it; backend not implemented |
| Share link generation & resolution | UI exists; backend returns stub data |
| Activity log / revert endpoints | UI stubs |
| Bills & subscriptions persistence | UI complete; no DB tables yet |
| SIPs module | Placeholder page only |
| Activity list endpoints (`/activities/*/events`) | Return empty arrays |
| Daily expense sync from modules | Returns `count: 0` |
| Admin API authorization | No server-side admin guard |

#Goal
The main goal of SmartSplit is to provide a simple and reliable solution for managing both shared and personal finances without relying on manual calculations. Whether it is splitting a restaurant bill, managing expenses during a trip, or tracking everyday spending, SmartSplit brings these workflows together in a single application.


---

## License

This project is for educational and personal use. See repository settings for license details.

---

**SmartSplit** — Split rent, trips, and bills simply.
💸 SmartSplit – Bill Splitting & Personal Expense Manager
SmartSplit is a full-stack web application designed to make bill splitting, trip expenses, and daily spending tracking simple and intuitive.
The project is built using a monorepo structure with a modern Next.js frontend and a scalable FastAPI backend.

🚀 Features
🔐 Authentication
User registration & login
Token-based session handling
LocalStorage-based client persistence
📊 Dashboard
Total expenses overview
Active trips count
Pending settlements
Quick access modules
Smooth UI animations
🧳 Trips Module
Create and track trips
Add participants
Add trip expenses
Cost split per member
Settlement calculation
📝 Daily Expenses
Track daily personal spending
Add recurring expenses
Category-based grouping
🎬 Activities (Dining, Movies, Play)
Add activity events
Manage activity logs
Expense division per group
💳 Bills & Subscriptions
Track monthly bills
Autopay indicators
Bill reminders (future)
📈 SIPs & Investments
Maintain SIP list
Investment goals overview
🏗️ Project Structure
