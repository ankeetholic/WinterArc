# ❄️ Winter Arc — Consistency & Hypertrophy Platform

A high-performance personal consistency, timetable execution, and workout hypertrophy tracking platform built for disciplined daily progress.

> **"Track the work. Build consistency. Force progressive overload."**

---

## 🚀 Key Features

* 🌅 **Customizable Chronological Timetable & Habit Engine:**
  * Build and organize your own custom daily routine with exact time-blocks, ordering, and priority categories.
  * **Day-of-Week Intelligence:** Set custom active days for any habit (e.g., automatically exclude school/work tasks on weekends).
* 📊 **7-Day Matrix Heatmap (Sun–Sat):**
  * Fully labeled GitHub-style consistency grid with month headers and interactive **Past Day Inspection**.
* 🏋️‍♂️ **Hypertrophy Workout & Routine Tracker:**
  * Track custom or pre-configured workout splits (e.g., Chest/Triceps, Back/Biceps, Delts, Legs, and dedicated Home sessions).
* 🎯 **1-Click Progressive Overload Engine:**
  * Calculates exact **Double Progression** targets directly from each user's logged database sets (+2.5kg compounds, +1.25kg isolations).
  * **Auto-Fill Weight:** 1 click populates suggested working weights into your sets.
  * Generates tailored warm-up schemes (50%, 75%, 90% prep sets).
* ☁️ **Cloud Database (Supabase PostgreSQL):**
  * Fully connected to online PostgreSQL with connection pooling.
* 📱 **Mobile Ready for Flutter (Android):**
  * Standard REST API with JWT Bearer authentication ready for native mobile integration.
* 🐳 **Docker Production Ready:**
  * Full container orchestration with `docker-compose.yml`.

---

## 🛠️ Tech Stack

```text
                                 Winter Arc Monorepo
                                          │
                    ┌─────────────────────┴─────────────────────┐
                    │                                           │
            🖥️ Next.js 14 Web                           📱 Flutter Android
         (React, TypeScript, Tailwind)                (Dart, Mobile App Client)
                    │                                           │
                    └─────────────────────┬─────────────────────┘
                                          │
                                       REST API
                                          │
                                          ▼
                                🐍 Django 5 + DRF
                                 (Business Logic & AI)
                                          │
                                          ▼
                            ☁️ Supabase PostgreSQL
```

* **Backend:** Django 5, Django REST Framework, SimpleJWT, Gunicorn, Psycopg2
* **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Lucide Icons
* **Database:** Online Supabase PostgreSQL
* **Containerization:** Docker & Docker Compose

---

## ⚡ Quick Start Guide

### Option 1: Run with Docker (Recommended)

Make sure Docker is installed, then run:

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/winter-arc.git
cd winter-arc

# 2. Configure environment variables
cp .env.example .env
# Fill in your DATABASE_URL and GEMINI_API_KEY in .env

# 3. Start full application (Backend + Frontend)
docker compose up --build
```

* **Web App:** [http://localhost:3000](http://localhost:3000)
* **Backend API Health:** [http://localhost:8000/api/v1/health/](http://localhost:8000/api/v1/health/)

---

### Option 2: Local Manual Setup

#### 1. Backend (Django)

```bash
# Navigate to API
cd apps/api

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Seed timetable and initial routines
python seed_user_arc.py

# Run backend server
python manage.py runserver 8000
```

#### 2. Frontend (Next.js)

```bash
# Navigate to Web
cd apps/web

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📡 REST API Reference (`/api/v1/`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/health/` | System Health Check |
| `POST` | `/api/v1/auth/register/` | Register new athlete account |
| `POST` | `/api/v1/auth/login/` | Obtain JWT Access & Refresh tokens |
| `GET` | `/api/v1/auth/me/` | Current user profile |
| `GET` | `/api/v1/goals/today/` | Today's active chronological timetable |
| `POST` | `/api/v1/daily-logs/toggle/` | 1-Tap habit completion toggle |
| `GET` | `/api/v1/analytics/heatmap/` | 7-Day Sun–Sat consistency heatmap |
| `GET` | `/api/v1/workouts/templates/` | Prescribed weekly routine templates |
| `GET` | `/api/v1/workouts/` | Logged workout session history |
| `POST` | `/api/v1/workouts/{id}/log-set/` | Record weight & reps for a working set |
| `GET` | `/api/v1/workouts/prs/` | Max personal records (PRs) |
| `POST` | `/api/v1/ai/progressive-overload/` | Compute 1-click double progression target |

---

## 🧪 Testing

Run all 29 automated unit and integration tests:

```bash
python apps/api/manage.py test apps.accounts apps.arcs apps.goals apps.tracking apps.analytics apps.workouts apps.ai
```

---

## 🔒 Security & Git Hygiene

* Secrets and environment variables (`.env`) are strictly excluded from version control.
* Raw specifications and documents (`docs/`) are ignored via `.gitignore` to keep the repository focused on pure application code.
* All database credentials use connection-pooled TLS encryption.

---

## 📜 License

MIT License © 2026 Winter Arc Consistency Platform.
