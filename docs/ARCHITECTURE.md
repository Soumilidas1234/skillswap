# SkillSwap AI — Full Architecture Documentation

> **Version:** 1.0  
> **Last updated:** June 2026  
> **Stack:** React 19 + Vite + TypeScript | PHP 8.3 MVC REST API | MySQL 8.0+

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [High-Level Architecture](#2-high-level-architecture)
3. [Project Structure](#3-project-structure)
4. [Frontend Architecture](#4-frontend-architecture)
5. [Backend Architecture](#5-backend-architecture)
6. [Database Architecture](#6-database-architecture)
7. [Core Functionality & Business Flows](#7-core-functionality--business-flows)
8. [Security Architecture](#8-security-architecture)
9. [API Reference Summary](#9-api-reference-summary)
10. [Deployment Architecture](#10-deployment-architecture)
11. [Local Development](#11-local-development)
12. [Environment Variables](#12-environment-variables)

---

## 1. System Overview

**SkillSwap AI** is a peer-to-peer skill exchange platform. Users can:

- Register and authenticate with JWT
- List skills they can teach
- Browse skills and send learning requests
- Complete sessions and earn **points**
- Unlock **achievements** (badges)
- Receive **certificates** (session + milestone types with QR verification)
- Compete on a **leaderboard**
- Manage profiles, notifications, and (for admins) the entire platform

The application follows a **decoupled SPA + REST API** pattern:

| Layer | Technology | Port (local) |
|-------|-----------|--------------|
| Frontend | React 19, Vite 8, TypeScript, Tailwind CSS v4 | `5173` |
| Backend | PHP 8.3, custom MVC, Composer | `8000` |
| Database | MySQL 8.0+ | `3306` |

---

## 2. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Browser (Client)                         │
│  React SPA  •  React Router  •  Redux  •  Axios  •  localStorage│
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTPS / HTTP
                             │ Authorization: Bearer <JWT>
                             │ X-CSRF-Token: <token>
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Backend (PHP REST API)                      │
│  api/index.php → Middleware → Router → Controllers → Models     │
└────────────────────────────┬────────────────────────────────────┘
                             │ PDO (prepared statements)
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                     MySQL Database (skillswap_ai)               │
│  users • skills • requests • certificates • achievements • …    │
└─────────────────────────────────────────────────────────────────┘
```

### Request lifecycle

1. Browser sends HTTP request to `VITE_API_URL` (e.g. `http://localhost:8000/api/...`)
2. PHP built-in server routes all requests through `backend/api/index.php`
3. Middleware runs: **CORS** → **CSRF** → **Rate limiting**
4. `Router` matches method + path to a controller method
5. Controller validates input, calls models, returns JSON via `Response` helper
6. Frontend Axios interceptor attaches JWT + CSRF token automatically

---

## 3. Project Structure

```
skillswap-ai/
├── frontend/                  # React SPA
│   ├── src/
│   │   ├── App.tsx            # Routes & providers
│   │   ├── main.tsx           # Entry point
│   │   ├── pages/             # Route-level page components
│   │   ├── components/        # Reusable UI (layout, SkillCard, etc.)
│   │   ├── context/           # AuthContext, ThemeContext
│   │   ├── services/          # Axios API layer (api.ts, index.ts)
│   │   ├── store/             # Redux Toolkit store
│   │   └── lib/               # Utilities, images
│   ├── .env                   # VITE_API_URL
│   └── package.json
│
├── backend/                   # PHP REST API
│   ├── api/
│   │   └── index.php          # Single entry point
│   ├── config/
│   │   ├── App.php            # Env loader
│   │   └── Database.php       # PDO singleton
│   ├── controllers/           # HTTP handlers (11 controllers)
│   ├── models/                # Data access layer
│   ├── middleware/            # CORS, Auth, CSRF, RateLimit
│   ├── helpers/               # JWT, Validator, Sanitizer, Response
│   ├── routes/
│   │   └── Router.php         # Route definitions & dispatch
│   ├── uploads/               # Avatar & thumbnail storage
│   ├── vendor/                # Composer dependencies
│   └── .env                   # DB, JWT, CORS config
│
├── database/
│   ├── schema.sql             # Base schema (all tables)
│   ├── seed.sql               # Admin user, categories, achievements
│   └── migrations/
│       └── 002_milestone_certificates.sql  # Required migration
│
├── scripts/                   # PowerShell setup/start scripts
├── docs/                      # Documentation
├── run-frontend.bat           # Manual frontend launcher (Windows)
├── run-backend.bat            # Manual backend launcher (Windows)
└── requirements.txt           # System dependency guide
```

---

## 4. Frontend Architecture

### 4.1 Tech stack

| Package | Purpose |
|---------|---------|
| React 19 | UI framework |
| Vite 8 | Dev server & production bundler |
| TypeScript | Type safety |
| React Router DOM 7 | Client-side routing |
| Redux Toolkit | Global state (minimal usage) |
| Axios | HTTP client |
| React Hook Form | Form validation |
| Framer Motion | Animations |
| Tailwind CSS v4 | Styling |
| Radix UI | Accessible primitives (dialog, dropdown, tabs…) |
| Lucide React | Icons |
| react-hot-toast | Toast notifications |
| Chart.js + react-chartjs-2 | Admin analytics charts |
| jsPDF + html2canvas | Certificate PDF download |
| qrcode.react | QR codes on certificates |

### 4.2 Application bootstrap

```
main.tsx
  └── App.tsx
        ├── Redux Provider (store)
        ├── ThemeProvider (dark/light mode)
        ├── AuthProvider (JWT session)
        └── BrowserRouter
              └── Suspense + lazy-loaded pages
```

### 4.3 Routing structure

| Layout | Routes | Auth required |
|--------|--------|---------------|
| **PublicLayout** | `/`, `/about`, `/features`, `/contact`, `/privacy`, `/terms`, `/browse`, `/skills/:id`, `/categories`, `/leaderboard` | No |
| **AuthLayout** | `/login`, `/register`, `/forgot-password` | No (redirect if logged in) |
| **DashboardLayout** | `/dashboard`, `/profile`, `/my-skills`, `/skills/add`, `/requests`, `/notifications`, `/achievements`, `/certificates`, `/admin` | Yes |

All dashboard routes are protected by `DashboardLayout`, which redirects unauthenticated users to `/login`.

### 4.4 State management

| State type | Location | Details |
|------------|----------|---------|
| Auth (user, token) | `AuthContext` + `localStorage` | `token`, `csrf_token`, `user` JSON |
| Theme | `ThemeContext` + `localStorage` | `light` / `dark` |
| Server data | Page-level `useState` + service calls | Fetched on mount via Axios |
| Global UI | Redux store | Minimal; extensible for future features |

### 4.5 API service layer (`frontend/src/services/`)

All backend communication goes through typed service modules:

```typescript
// api.ts — Axios instance with interceptors
baseURL: import.meta.env.VITE_API_URL  // http://localhost:8000/api

// Request interceptor: attaches Authorization + X-CSRF-Token
// Response interceptor: handles 401 (redirect login), CSRF retry
```

| Service | Endpoints used |
|---------|---------------|
| `authService` | register, login, logout, me, forgot-password |
| `userService` | profile, dashboard, public profile |
| `skillService` | browse, CRUD, popular, my skills |
| `requestService` | incoming/outgoing requests, accept/reject/complete/cancel |
| `notificationService` | list, unread count, mark read |
| `categoryService` | all categories, top categories |
| `leaderboardService` | full leaderboard, preview |
| `achievementService` | all achievements, my achievements |
| `certificateService` | list, milestones, verify, download |
| `statsService` | public site statistics (landing page) |
| `adminService` | dashboard, users, skills, requests management |
| `uploadService` | avatar & skill thumbnail uploads |

### 4.6 Key pages & responsibilities

| Page | Route | Function |
|------|-------|----------|
| LandingPage | `/` | Hero, stats, popular skills, categories, leaderboard preview |
| LoginPage / RegisterPage | `/login`, `/register` | Authentication |
| DashboardPage | `/dashboard` | User overview, stats, recent activity |
| BrowseSkillsPage | `/browse` | Search/filter skills |
| SkillDetailPage | `/skills/:id` | Skill details + send learning request |
| MySkillsPage / AddSkillPage | `/my-skills`, `/skills/add` | Manage own skills |
| RequestsPage | `/requests` | Incoming & outgoing learning requests |
| AchievementsPage | `/achievements` | Unlocked & locked badges |
| CertificatesPage | `/certificates` | View/download certificates |
| LeaderboardPage | `/leaderboard` | Rankings by points |
| AdminDashboardPage | `/admin` | Platform analytics & moderation |
| ProfilePage | `/profile` | Edit profile, social links, avatar |

### 4.7 Build & output

```bash
cd frontend
npm run build    # Output: frontend/dist/
npm run preview  # Preview production build locally
```

Production build is a static SPA deployed to Vercel/Netlify. All API calls go to the external backend URL configured in `VITE_API_URL`.

---

## 5. Backend Architecture

### 5.1 Pattern: Custom MVC

The backend is **not** Laravel or Symfony — it is a lightweight custom MVC:

| Layer | Directory | Responsibility |
|-------|-----------|----------------|
| **Entry** | `api/index.php` | Bootstrap, middleware, dispatch |
| **Routes** | `routes/Router.php` | URL → controller method mapping |
| **Controllers** | `controllers/` | HTTP logic, validation, response |
| **Models** | `models/` | Database queries (PDO) |
| **Middleware** | `middleware/` | Cross-cutting concerns |
| **Helpers** | `helpers/` | JWT, validation, sanitization, JSON response |
| **Config** | `config/` | Environment & database connection |

### 5.2 Entry point flow

```php
// backend/api/index.php
require vendor/autoload.php
App::loadEnv()                    // Load .env via vlucas/phpdotenv
CorsMiddleware::handle()          // CORS headers + OPTIONS preflight
CsrfMiddleware::validate()        // CSRF check on mutating requests
RateLimitMiddleware::handle()     // IP-based rate limiting
Router->dispatch(method, uri)     // Route to controller
```

### 5.3 Controllers

| Controller | Responsibility |
|------------|----------------|
| `AuthController` | Register, login, logout, me, forgot-password |
| `UserController` | Profile CRUD, dashboard data, public profiles |
| `SkillController` | Skill CRUD, browse with filters, popular skills |
| `RequestController` | Learning request workflow (pending → completed) |
| `NotificationController` | User notifications |
| `CategoryController` | Category CRUD (admin) |
| `LeaderboardController` | Rankings by points |
| `CertificateController` | Certificates list, verify, milestones |
| `AchievementController` | Achievement definitions & user badges |
| `StatsController` | Public site statistics |
| `AdminController` | Admin dashboard, user/skill/request moderation |
| `UploadController` | Avatar & thumbnail file uploads |

### 5.4 Models

| Model | Table(s) |
|-------|----------|
| `User` | `users` |
| `Skill` | `skills` |
| `LearningRequest` | `requests` |
| `Category` | `categories` |
| `Notification` | `notifications` |
| `Achievement` | `achievements`, `user_achievements` |
| `Certificate` | `certificates` |
| `CertificateMilestone` | `certificate_milestones`, `user_category_points` |
| `Points` | `points_history`, `users.points` |
| `ActivityLog` | `activity_logs` |

All models extend `BaseModel`, which provides a shared PDO connection via `Database::getConnection()`.

### 5.5 Middleware

| Middleware | Purpose |
|------------|---------|
| `CorsMiddleware` | Sets `Access-Control-Allow-*` headers from `CORS_ORIGINS` |
| `CsrfMiddleware` | Validates `X-CSRF-Token` header on POST/PUT/DELETE |
| `RateLimitMiddleware` | Limits requests per IP per endpoint (configurable window) |
| `AuthMiddleware` | Validates JWT Bearer token, loads user, checks suspension |

### 5.6 Authentication (JWT)

```
Register/Login
  → password_hash (bcrypt, cost 12) on register
  → password_verify on login
  → JWT generated via firebase/php-jwt (HS256)
  → Payload: { user_id, role, iat, exp }
  → CSRF token stored in csrf_tokens table
  → Returned: { user, token, csrf_token }
```

| Token | Expiry | Trigger |
|-------|--------|---------|
| Standard | 86400s (24h) | Normal login |
| Remember me | 604800s (7d) | Login with `remember: true` |

Protected routes call `AuthMiddleware::handle(true)`. Admin routes call `AuthMiddleware::requireAdmin()`.

### 5.7 Response format

All API responses follow a consistent JSON envelope:

```json
// Success
{ "success": true, "message": "...", "data": { ... } }

// Error
{ "success": false, "message": "...", "errors": { ... } }

// Paginated
{ "success": true, "data": { "items": [...], "pagination": { "total", "page", "per_page", "total_pages", "has_more" } } }
```

### 5.8 PHP dependencies (Composer)

| Package | Purpose |
|---------|---------|
| `firebase/php-jwt` ^7.0 | JWT encode/decode |
| `vlucas/phpdotenv` ^5.6 | `.env` file loading |

### 5.9 File uploads

| Endpoint | Field | Storage | Max size |
|----------|-------|---------|----------|
| `POST /upload/avatar` | `avatar` | `backend/uploads/avatars/` | 5 MB |
| `POST /upload/thumbnail` | `thumbnail` | `backend/uploads/thumbnails/` | 5 MB |

Allowed extensions: `jpg, jpeg, png, gif, webp` (configured in `.env`).

---

## 6. Database Architecture

### 6.1 Entity relationship overview

```
users ─────────┬──── skills ──────── requests ────── certificates
               │         │              │
               │    categories          │
               │                        │
               ├──── user_achievements ─ achievements
               ├──── points_history
               ├──── notifications
               ├──── user_category_points
               ├──── bookmarks / favorite_teachers / recently_viewed
               └──── activity_logs / sessions

certificate_milestones ──── categories
site_stats (cached counters)
rate_limits / csrf_tokens (security)
```

### 6.2 Core tables

#### `users`
| Column | Type | Description |
|--------|------|-------------|
| id | INT PK | Auto increment |
| uuid | CHAR(36) | Public profile identifier |
| name, email | VARCHAR | Display name & unique email |
| password | VARCHAR(255) | bcrypt hash |
| role | ENUM('user','admin') | Access level |
| points | INT | Gamification score |
| avatar, bio, location | VARCHAR/TEXT | Profile fields |
| website, twitter, linkedin, github | VARCHAR | Social links |
| is_verified, is_suspended | TINYINT | Account flags |
| last_login_at | DATETIME | Last login timestamp |

#### `skills`
| Column | Type | Description |
|--------|------|-------------|
| user_id | FK → users | Teacher/owner |
| category_id | FK → categories | Skill category |
| title, slug, description | VARCHAR/TEXT | Skill content |
| level | ENUM | beginner → expert |
| tags | JSON | Searchable tags |
| thumbnail | VARCHAR | Image URL |
| availability | ENUM | available, busy, unavailable |
| status | ENUM | active, draft, archived |
| views, request_count, rating | INT/DECIMAL | Engagement metrics |

#### `requests` (learning requests)
| Column | Type | Description |
|--------|------|-------------|
| skill_id | FK → skills | Target skill |
| learner_id | FK → users | Student |
| teacher_id | FK → users | Skill owner |
| message | TEXT | Request message |
| status | ENUM | pending → accepted → completed (or rejected/cancelled) |
| completed_at | DATETIME | Set on completion |

#### `certificates`
Supports two types via migration `002_milestone_certificates.sql`:

| cert_type | Description |
|-----------|-------------|
| `session` | Issued when teacher marks request as completed |
| `milestone` | Issued when user hits category point thresholds |

Columns: `certificate_id` (SSA-/SSM- prefix), `qr_data` (JSON), `learner_id`, optional `request_id`, `category_id`, `milestone_id`.

#### `achievements` + `user_achievements`
Badge definitions with `min_points` + `min_sessions` thresholds. Junction table tracks unlock timestamps per user.

#### `points_history`
Audit log of all point changes with optional `category_id` and `reference_id` (request ID).

#### `certificate_milestones` (migration)
Per-category tier definitions: Starter (10 pts) → Legend (10000 pts). 7 tiers × N categories.

#### `user_category_points` (migration)
Tracks points earned per user per category for milestone certificate eligibility.

### 6.3 Seed data

`database/seed.sql` provides:

- **Admin user:** `admin@skillswap.ai` / `password`
- **8 categories:** Programming, Design, Music, Language, Business, etc.
- **5 achievements:** Bronze Teacher → Elite Coach
- **Site stats:** Initial counters

### 6.4 Required migration

After running `schema.sql` + `seed.sql`, **always run**:

```bash
mysql -u root -p skillswap_ai < database/migrations/002_milestone_certificates.sql
```

Or use `scripts/setup-database.ps1` which applies this automatically.

Without this migration, **login will fail** after password verification (missing `category_id` column in `points_history`).

### 6.5 Indexes & performance

- Full-text index on `skills(title, description)` for search
- Indexes on foreign keys, email, points (DESC), status fields
- `site_stats` caches aggregate counts (total users, skills, requests)

---

## 7. Core Functionality & Business Flows

### 7.1 User registration & login

```
Register → validate (name, email, password min 8)
         → bcrypt hash password
         → create user (role: user)
         → issue JWT + CSRF token
         → redirect to dashboard

Login    → validate email + password
         → check is_suspended
         → award daily login bonus (+2 pts, once per day)
         → check certificate milestones
         → issue JWT + CSRF token
```

### 7.2 Skill management

```
Teacher creates skill → POST /skills
  → title, description, category_id, level, tags, thumbnail
  → slug auto-generated
  → status: active
  → category skill_count incremented

Browse → GET /skills?category_id=&level=&search=&page=
Public skill detail → GET /skills/:id (increments views)
```

### 7.3 Learning request workflow

```
                    ┌──────────┐
    Learner sends   │ pending  │
    POST /requests  └────┬─────┘
                         │
           ┌─────────────┼─────────────┐
           ▼             ▼             ▼
      ┌─────────┐  ┌──────────┐  ┌───────────┐
      │accepted │  │ rejected │  │ cancelled │
      └────┬────┘  └──────────┘  └───────────┘
           │         (by learner)
           │ Teacher: +10 points
           ▼
      ┌──────────┐
      │completed │ ← Teacher marks done
      └────┬─────┘
           │ Teacher: +20 points
           │ Learner: +10 points
           │ Certificate generated (session type)
           │ Achievement check triggered
```

### 7.4 Points system

| Action | Points | Recipient |
|--------|--------|-----------|
| Daily login | +2 | Logged-in user |
| Accept request | +10 | Teacher |
| Complete session | +20 | Teacher |
| Learn complete | +10 | Learner |
| Achievement unlock | +50 | Badge earner |

Points update `users.points` and append to `points_history`. Category-specific points tracked in `user_category_points`.

### 7.5 User levels

Based on total points (`UserLevel` helper):

| Level | Name | Points range |
|-------|------|-------------|
| 0 | Newcomer | 0–9 |
| 1 | Starter | 10–99 |
| 2 | Bronze | 100–299 |
| 3 | Silver | 300–699 |
| 4 | Gold | 700–1499 |
| 5 | Platinum | 1500–4999 |
| 6 | Diamond | 5000–9999 |
| 7 | Legend | 10000+ |

### 7.6 Achievements

Automatically checked after accept/complete actions:

| Badge | Min sessions | Min points |
|-------|-------------|------------|
| Bronze Teacher | 5 | 50 |
| Silver Mentor | 15 | 150 |
| Gold Expert | 30 | 300 |
| Diamond Master | 50 | 500 |
| Elite Coach | 100 | 1000 |

Unlock triggers: +50 bonus points + notification.

### 7.7 Certificates

**Session certificates** — created when teacher completes a request:
- ID format: `SSA-XXXXXXXX`
- Contains QR data with verify URL
- Learner can download PDF from frontend

**Milestone certificates** — auto-awarded when category points hit thresholds:
- ID format: `SSM-XXXXXXXX`
- 7 tiers per category (Starter → Legend)
- Checked on login and after point-earning actions

Verification: `GET /api/certificates/verify/{certId}` (public, no auth).

### 7.8 Notifications

Created automatically for:
- New learning request received
- Request accepted / rejected / completed
- Points earned
- Achievement unlocked
- Certificate generated / milestone earned

### 7.9 Admin functionality

Accessible at `/admin` (role: `admin`):

| Feature | API |
|---------|-----|
| Dashboard analytics | `GET /admin/dashboard` |
| List/search users | `GET /admin/users` |
| Suspend / unsuspend user | `POST /admin/users/{id}/suspend` |
| Delete user | `DELETE /admin/users/{id}` |
| List/remove skills | `GET/DELETE /admin/skills` |
| View all requests | `GET /admin/requests` |

Promote user to admin via MySQL:
```sql
UPDATE users SET role = 'admin' WHERE email = 'user@example.com';
```

---

## 8. Security Architecture

| Feature | Implementation |
|---------|---------------|
| Password storage | bcrypt (`PASSWORD_BCRYPT`, cost 12) |
| Authentication | JWT (HS256) in `Authorization: Bearer` header |
| CSRF protection | `X-CSRF-Token` header on mutating requests |
| Rate limiting | IP + endpoint tracking in `rate_limits` table |
| SQL injection | PDO prepared statements throughout |
| XSS prevention | `Sanitizer::stripHtml()` on user input |
| Input validation | `Validator` helper with rule strings |
| File uploads | Extension whitelist, size limit (5 MB) |
| CORS | Origin whitelist via `CORS_ORIGINS` env var |
| Role-based access | `AuthMiddleware::requireAdmin()` |
| Account suspension | `is_suspended` flag checked on login & auth |

---

## 9. API Reference Summary

Base URL: `{APP_URL}/api` (local: `http://localhost:8000/api`)

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | No | Create account |
| POST | `/auth/login` | No | Login, get JWT |
| POST | `/auth/logout` | Yes | Logout |
| GET | `/auth/me` | Yes | Current user + level info |
| POST | `/auth/forgot-password` | No | Placeholder reset flow |

### Users
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/users/profile` | Yes | Own profile |
| PUT | `/users/profile` | Yes | Update profile |
| GET | `/users/dashboard` | Yes | Dashboard stats |
| GET | `/users/{uuid}` | No | Public profile |

### Skills
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/skills` | No | Browse with filters |
| GET | `/skills/popular` | No | Popular skills |
| GET | `/skills/my` | Yes | Own skills |
| GET | `/skills/{id}` | No | Skill detail |
| POST | `/skills` | Yes | Create skill |
| PUT | `/skills/{id}` | Yes | Update skill |
| DELETE | `/skills/{id}` | Yes | Delete skill |

### Requests
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/requests` | Yes | Incoming + outgoing |
| POST | `/requests` | Yes | Send request |
| POST | `/requests/{id}/accept` | Yes | Accept (teacher) |
| POST | `/requests/{id}/reject` | Yes | Reject (teacher) |
| POST | `/requests/{id}/complete` | Yes | Complete (teacher) |
| POST | `/requests/{id}/cancel` | Yes | Cancel (learner) |

### Other
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/categories` | No | All categories |
| GET | `/leaderboard` | No | Full rankings |
| GET | `/achievements/my` | Yes | User badges |
| GET | `/certificates` | Yes | User certificates |
| GET | `/certificates/verify/{id}` | No | Verify certificate |
| GET | `/stats` | No | Public site stats |
| GET | `/notifications` | Yes | Notifications |
| POST | `/upload/avatar` | Yes | Upload avatar |
| GET | `/admin/dashboard` | Admin | Admin analytics |

---

## 10. Deployment Architecture

### 10.1 Production topology (free tier)

```
┌──────────────────┐     ┌──────────────────────┐     ┌─────────────────┐
│  Vercel / Netlify │     │  InfinityFree /     │     │  Free MySQL     │
│  (Static SPA)     │────▶│  000WebHost (PHP)    │────▶│  (Remote DB)    │
│  React build      │     │  backend/ folder     │     │  skillswap_ai   │
└──────────────────┘     └──────────────────────┘     └─────────────────┘
   your-app.vercel.app      your-api.infinityfree.app    remotemysql.com
```

### 10.2 Frontend deployment (Vercel)

1. Push code to GitHub
2. Import project in Vercel → set root directory to `frontend`
3. Build command: `npm run build`
4. Output directory: `dist`
5. Environment variable:
   ```
   VITE_API_URL=https://your-backend.infinityfreeapp.com/api
   ```
6. Deploy → static files served globally via CDN

### 10.3 Backend deployment (InfinityFree / shared PHP hosting)

1. Upload entire `backend/` folder via FTP/File Manager
2. Point domain document root to `backend/` (or `backend/api/`)
3. Ensure PHP 8.2+ with extensions: `openssl`, `curl`, `mbstring`, `pdo_mysql`, `zip`, `fileinfo`
4. Create `.env` on server with production values:
   ```env
   APP_ENV=production
   APP_DEBUG=false
   APP_URL=https://your-backend.infinityfreeapp.com
   DB_HOST=your-remote-mysql-host
   DB_NAME=skillswap_ai
   DB_USER=your_db_user
   DB_PASS=your_db_password
   JWT_SECRET=long-random-secret-key
   CORS_ORIGINS=https://your-frontend.vercel.app
   ```
5. Import `schema.sql`, `seed.sql`, and migration via phpMyAdmin
6. Set `uploads/` folder permissions to writable (755/775)

### 10.4 Database deployment

1. Create MySQL database on free host (e.g. remotemysql.com, InfinityFree MySQL)
2. Import in order:
   - `database/schema.sql`
   - `database/seed.sql`
   - `database/migrations/002_milestone_certificates.sql`
3. Update `backend/.env` with remote credentials

### 10.5 Production checklist

- [ ] Change `JWT_SECRET` to a strong random value
- [ ] Set `APP_DEBUG=false`
- [ ] Configure `CORS_ORIGINS` to exact frontend URL
- [ ] Run all SQL migrations
- [ ] Change default admin password
- [ ] Enable HTTPS on both frontend and backend
- [ ] Verify file upload directory is writable
- [ ] Test login, skill creation, request flow end-to-end

### 10.6 CI/CD (optional)

```yaml
# Example GitHub Actions for frontend
on: push
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: cd frontend && npm ci && npm run build
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-args: '--prod'
          working-directory: frontend
```

---

## 11. Local Development

### Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | 18+ | Frontend dev server |
| PHP | 8.3+ | Backend API |
| MySQL | 8.0+ | Database |
| Composer | 2.6+ | PHP dependencies |

### Setup steps

```powershell
# 1. Database
powershell -ExecutionPolicy Bypass -File scripts/setup-database.ps1 -Password "SkillSwap123"

# 2. Backend (terminal 1)
cd backend
php -S localhost:8000 -t .

# 3. Frontend (terminal 2)
cd frontend
npm install
npm.cmd run dev   # use npm.cmd if PowerShell blocks npm.ps1
```

Or use batch files from project root:
```powershell
.\run-backend.bat    # Terminal 1
.\run-frontend.bat   # Terminal 2
```

### Local URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8000/api |
| API test | http://localhost:8000/api/categories |
| Default admin | admin@skillswap.ai / password |

### Common issues

| Problem | Fix |
|---------|-----|
| `npm` not recognized | Add Node to PATH or use `npm.cmd` |
| PowerShell blocks scripts | `Set-ExecutionPolicy RemoteSigned -Scope CurrentUser` |
| Login fails after setup | Run migration `002_milestone_certificates.sql` |
| CORS errors | Check `CORS_ORIGINS` in `backend/.env` includes `http://localhost:5173` |
| Database connection failed | Verify MySQL running, check `DB_PASS` in `.env` |

---

## 12. Environment Variables

### Backend (`backend/.env`)

| Variable | Example (local) | Description |
|----------|-------------------|-------------|
| `APP_NAME` | SkillSwap | Application name |
| `APP_ENV` | local | Environment (local/production) |
| `APP_DEBUG` | true | Enable debug output |
| `APP_URL` | http://localhost:8000 | Public backend URL |
| `DB_HOST` | localhost | MySQL host |
| `DB_PORT` | 3306 | MySQL port |
| `DB_NAME` | skillswap_ai | Database name |
| `DB_USER` | root | Database user |
| `DB_PASS` | SkillSwap123 | Database password |
| `JWT_SECRET` | local-dev-jwt-secret | JWT signing key |
| `JWT_EXPIRY` | 86400 | Token expiry (seconds) |
| `JWT_REFRESH_EXPIRY` | 604800 | Remember-me expiry |
| `CORS_ORIGIN` | http://localhost:5173 | Primary allowed origin |
| `CORS_ORIGINS` | http://localhost:5173,... | Comma-separated origins |
| `UPLOAD_MAX_SIZE` | 5242880 | Max upload bytes (5 MB) |
| `ALLOWED_EXTENSIONS` | jpg,jpeg,png,gif,webp | Upload file types |
| `RATE_LIMIT_REQUESTS` | 100 | Max requests per window |
| `RATE_LIMIT_WINDOW` | 60 | Rate limit window (seconds) |
| `ADMIN_EMAIL` | admin@skillswap.ai | Admin contact email |

### Frontend (`frontend/.env`)

| Variable | Example (local) | Description |
|----------|-------------------|-------------|
| `VITE_API_URL` | http://localhost:8000/api | Backend API base URL |

> **Note:** Vite only exposes variables prefixed with `VITE_`. Restart dev server after changing `.env`.

---

## Appendix A — Default credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@skillswap.ai | password |

## Appendix B — Port reference

| Service | Port |
|---------|------|
| Frontend (Vite) | 5173 |
| Backend (PHP) | 8000 |
| MySQL | 3306 |

## Appendix C — Related documentation

| File | Description |
|------|-------------|
| `README.md` | Project overview & quick start |
| `requirements.txt` | System dependencies guide |
| `docs/LOCAL_SETUP.md` | Windows setup (when available) |
| `docs/API.md` | Full API reference (when available) |
| `docs/USER_GUIDE.md` | End-user guide (when available) |
| `docs/ADMIN_GUIDE.md` | Admin operations guide (when available) |
| `docs/CERTIFICATES.md` | Certificate system details (when available) |
| `docs/DATABASE.md` | ER diagram & schema notes (when available) |

---

*This document describes the SkillSwap AI architecture as implemented in the repository. For questions or contributions, see README.md.*
