# SkillSwap — Step-by-Step Deployment Guide

> **Repo:** [github.com/Soumilidas1234/skillswap](https://github.com/Soumilidas1234/skillswap)  
> **Recommended free stack:** Vercel (frontend) + InfinityFree (backend + MySQL)

---

## Overview

| Part | Host | What you deploy |
|------|------|-----------------|
| **Database** | InfinityFree MySQL | `schema.sql`, `seed.sql`, migration |
| **Backend** | InfinityFree (PHP) | `backend/` folder |
| **Frontend** | Vercel | Auto-build from GitHub `frontend/` |

**Final URLs (example):**
- Frontend: `https://skillswap.vercel.app`
- Backend API: `https://skillswap-api.infinityfreeapp.com/api`

---

## Before you start — checklist

- [x] Code pushed to GitHub
- [ ] InfinityFree account ([infinityfree.net](https://infinityfree.net))
- [ ] Vercel account ([vercel.com](https://vercel.com)) — sign in with GitHub
- [ ] Composer installed locally (to build `vendor/` folder)
- [ ] FileZilla or similar FTP client (optional but easier)

---

## STEP 1 — Create InfinityFree hosting (Backend + Database)

### 1.1 Sign up and create a site

1. Go to [https://infinityfree.net](https://infinityfree.net) → **Sign Up**
2. Log in to **Control Panel** (iPanel)
3. Click **Create Account** → choose a subdomain, e.g.:
   ```
   skillswap-api.infinityfreeapp.com
   ```
4. Wait 5–10 minutes for account activation

### 1.2 Create MySQL database

1. In iPanel → **MySQL Databases** → **Create Database**
2. Save these details (you will need them):
   ```
   DB_HOST     = sqlXXX.infinityfree.com   (shown in panel)
   DB_NAME     = if0_XXXXXXX_skillswap
   DB_USER     = if0_XXXXXXX
   DB_PASS     = (password you set)
   DB_PORT     = 3306
   ```

### 1.3 Import database tables

1. iPanel → **phpMyAdmin** → open your database
2. Click **Import** tab
3. Import **in this order** (files from your repo `database/` folder):

   | Order | File |
   |-------|------|
   | 1 | `schema.sql` |
   | 2 | `seed.sql` |
   | 3 | `migrations/002_milestone_certificates.sql` |

4. After import, verify in phpMyAdmin:
   ```sql
   SELECT email, role FROM users;
   ```
   You should see `admin@skillswap.ai`.

---

## STEP 2 — Prepare backend for upload

> **`vendor/` is NOT in GitHub** — you must install PHP dependencies locally first.

### 2.1 Install Composer dependencies (on your PC)

```powershell
cd "C:\Users\soumi\OneDrive\Desktop\zip\skillswap-ai\backend"
composer install --no-dev --optimize-autoloader
```

If `composer` is not installed, download from [getcomposer.org](https://getcomposer.org).

This creates the `backend/vendor/` folder.

### 2.2 Create production `.env`

Create `backend/.env` on your PC (do NOT commit to GitHub):

```env
APP_NAME="SkillSwap"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://skillswap-api.infinityfreeapp.com

DB_HOST=sqlXXX.infinityfree.com
DB_PORT=3306
DB_NAME=if0_XXXXXXX_skillswap
DB_USER=if0_XXXXXXX
DB_PASS=your_mysql_password

JWT_SECRET=change-this-to-a-long-random-string-min-32-chars
JWT_EXPIRY=86400
JWT_REFRESH_EXPIRY=604800

CORS_ORIGIN=https://your-app.vercel.app
CORS_ORIGINS=https://your-app.vercel.app

UPLOAD_MAX_SIZE=5242880
ALLOWED_EXTENSIONS=jpg,jpeg,png,gif,webp

RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=60

ADMIN_EMAIL=admin@skillswap.ai
```

Replace:
- `APP_URL` → your InfinityFree subdomain URL
- `DB_*` → values from Step 1.2
- `JWT_SECRET` → random string (e.g. generate at [randomkeygen.com](https://randomkeygen.com))
- `CORS_ORIGINS` → your Vercel URL (update after Step 3)

### 2.3 Upload backend via FTP

1. iPanel → **FTP Details** — note host, username, password
2. Connect with **FileZilla** (host: `ftpupload.net` or shown in panel)
3. Open remote folder `htdocs/`
4. Upload **entire contents** of your local `backend/` folder:
   ```
   api/
   config/
   controllers/
   helpers/
   middleware/
   models/
   routes/
   uploads/
   vendor/          ← important!
   .env             ← your production env file
   .htaccess
   composer.json
   ```

5. Set folder permissions (right-click → Permissions):
   - `uploads/` → **755** or **775**
   - `uploads/avatars/` → **755**
   - `uploads/skills/` → **755**

### 2.4 Test backend

Open in browser:
```
https://skillswap-api.infinityfreeapp.com/api/categories
```

Expected: JSON like `{"success":true,"message":"Success","data":[...]}`

If you see an error:
- Check `.env` DB credentials
- Confirm `vendor/` was uploaded
- Confirm migration SQL was imported

---

## STEP 3 — Deploy frontend on Vercel

### 3.1 Connect GitHub repo

1. Go to [https://vercel.com](https://vercel.com) → **Sign up** with GitHub
2. Click **Add New…** → **Project**
3. Import repository: **Soumilidas1234/skillswap**
4. Configure project:

   | Setting | Value |
   |---------|-------|
   | **Framework Preset** | Vite |
   | **Root Directory** | `frontend` ← click Edit, set to `frontend` |
   | **Build Command** | `npm run build` |
   | **Output Directory** | `dist` |
   | **Install Command** | `npm install` |

### 3.2 Add environment variable

Before deploying, add:

| Name | Value |
|------|-------|
| `VITE_API_URL` | `https://skillswap-api.infinityfreeapp.com/api` |

Use your actual InfinityFree backend URL + `/api`.

### 3.3 Deploy

1. Click **Deploy**
2. Wait 1–3 minutes
3. Vercel gives you a URL, e.g.:
   ```
   https://skillswap-xxx.vercel.app
   ```

### 3.4 Update backend CORS

Go back to InfinityFree — edit `backend/.env` on server:

```env
CORS_ORIGIN=https://skillswap-xxx.vercel.app
CORS_ORIGINS=https://skillswap-xxx.vercel.app
```

Re-upload `.env` or edit via FTP File Manager.

---

## STEP 4 — Final testing

| Test | URL / Action | Expected |
|------|--------------|----------|
| API health | `https://your-api.infinityfreeapp.com/api/categories` | JSON categories |
| Frontend loads | `https://your-app.vercel.app` | Landing page |
| Login | admin@skillswap.ai / password | Dashboard opens |
| Register | Create new account | Works without error |
| Add skill | Dashboard → My Skills → Add | Skill saved |

---

## STEP 5 — Security (do this after deploy works)

1. **Change admin password** — log in and update profile, or via MySQL:
   ```sql
   -- Generate hash locally: php -r "echo password_hash('NewSecurePass123', PASSWORD_BCRYPT);"
   UPDATE users SET password='PASTE_HASH' WHERE email='admin@skillswap.ai';
   ```

2. **Confirm secrets are NOT on GitHub:**
   - `backend/.env` — must stay local/server only
   - `frontend/.env` — not needed on GitHub (Vercel env vars used)

3. **Verify `.env` is blocked** — try opening:
   ```
   https://your-api.infinityfreeapp.com/.env
   ```
   Should return **403 Forbidden** (`.htaccess` blocks it).

---

## Updating after changes

### Frontend (automatic)
Push to GitHub `main` branch → Vercel auto-redeploys.

```powershell
git add .
git commit -m "Update frontend"
git push
```

### Backend (manual FTP)
1. Edit files locally
2. Run `composer install` if PHP dependencies changed
3. Re-upload changed files via FTP
4. Re-upload `.env` if config changed

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| CORS error in browser | Set `CORS_ORIGINS` in backend `.env` to exact Vercel URL (no trailing slash) |
| API returns 500 | Check InfinityFree error logs in iPanel; verify `vendor/` uploaded |
| Login fails | Run migration `002_milestone_certificates.sql` on production DB |
| `vendor/` missing | Run `composer install` locally, upload `vendor/` folder |
| Vercel build fails | Ensure Root Directory = `frontend`, Node 18+ |
| Uploads fail | Set `uploads/` folder permissions to 755/775 |
| Database connection error | Double-check `DB_HOST` from InfinityFree panel (not `localhost` on free hosting) |

---

## Alternative hosts

| Service | Use for |
|---------|---------|
| [Vercel](https://vercel.com) | Frontend (recommended) |
| [Netlify](https://netlify.com) | Frontend alternative |
| [InfinityFree](https://infinityfree.net) | Backend + MySQL (free) |
| [000WebHost](https://000webhost.com) | Backend alternative |
| [Railway](https://railway.app) | Backend (paid after free tier) |

---

## Quick reference — your URLs

Fill in after deployment:

```
GitHub:    https://github.com/Soumilidas1234/skillswap
Frontend:  https://________________.vercel.app
Backend:   https://________________.infinityfreeapp.com
API:       https://________________.infinityfreeapp.com/api
Admin:     admin@skillswap.ai / password (change after deploy!)
```

---

*For architecture details see [ARCHITECTURE.md](./ARCHITECTURE.md)*
