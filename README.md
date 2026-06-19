# SkillSwap

A production-ready, modern skill sharing platform where users teach and learn skills, earn points, unlock achievements, and receive certificates.

## Documentation

| Guide | Description |
|-------|-------------|
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | **Full architecture** — frontend, backend, database, deployment, flows |
| [USER_GUIDE.md](docs/USER_GUIDE.md) | Everything a regular user can do |
| [ADMIN_GUIDE.md](docs/ADMIN_GUIDE.md) | Admin login, responsibilities, management |
| [CERTIFICATES.md](docs/CERTIFICATES.md) | How certificates are generated & verified |
| [HOW_IT_WORKS.md](docs/HOW_IT_WORKS.md) | Full app architecture & flows |
| [API.md](docs/API.md) | REST API reference |
| [LOCAL_SETUP.md](docs/LOCAL_SETUP.md) | Windows setup guide |

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React 19, Vite, TypeScript, Tailwind CSS v4, Framer Motion, Redux Toolkit, React Hook Form, Chart.js, Shadcn-style UI |
| Backend | PHP 8.3, MVC, JWT, Composer |
| Database | MySQL 8.0+ |

## Features

- User authentication (JWT, remember me, role-based access)
- Skill management (CRUD, categories, tags, thumbnails)
- Learning requests (pending → accepted → completed workflow)
- Points system & leaderboard
- Achievement badges (Bronze → Elite)
- PDF certificate generation with QR codes
- Real-time-style notifications
- Admin dashboard with analytics
- Dark mode support
- Fully responsive (mobile bottom nav, hamburger menu)
- AI-powered skill recommendations placeholder

## Project Structure

```
skillswap-ai/
├── frontend/          # React + Vite app
├── backend/           # PHP REST API
├── database/          # SQL schema & seeds
├── docs/              # API docs, deployment guide
└── assets/            # Shared assets
```

## Quick Start (Local)

> **Full Windows setup guide:** [docs/LOCAL_SETUP.md](docs/LOCAL_SETUP.md)  
> **Dependency list:** [requirements.txt](requirements.txt)

### Prerequisites

- Node.js 18+
- PHP 8.3+
- Composer
- MySQL 8.0+

On Windows, install **XAMPP** (PHP + MySQL) and **Composer** — see [docs/LOCAL_SETUP.md](docs/LOCAL_SETUP.md).

### Run locally (2 terminals)

**Terminal 1 — Backend:**
```powershell
.\scripts\start-backend.ps1
```

**Terminal 2 — Frontend:**
```powershell
.\scripts\start-frontend.ps1
```

Then open **http://localhost:5173**

### Manual setup

```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
```

Default admin: `admin@skillswap.ai` / `password`

### Backend Setup

```bash
cd backend
composer install
cp .env.example .env
# Edit .env with your database credentials
```

Start PHP development server:

```bash
cd backend
php -S localhost:8000 -t .
```

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
# Set VITE_API_URL=http://localhost:8000/api
npm run dev
```

Open http://localhost:5173

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description |
|----------|-------------|
| `DB_HOST` | MySQL host |
| `DB_NAME` | Database name |
| `DB_USER` | Database user |
| `DB_PASS` | Database password |
| `JWT_SECRET` | Secret key for JWT tokens |
| `CORS_ORIGINS` | Allowed frontend origins |
| `APP_URL` | Backend public URL |

### Frontend (`frontend/.env`)

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API URL (e.g. `https://your-api.com/api`) |

## Deployment (100% Free)

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for complete guides:

- **Frontend**: Vercel
- **Backend**: InfinityFree / 000WebHost
- **Database**: Free MySQL hosting

See [docs/API.md](docs/API.md) for complete REST API reference.

## Database

See [docs/DATABASE.md](docs/DATABASE.md) for ER diagram and schema details.

## Scripts

```bash
# Frontend
npm run dev      # Development server
npm run build    # Production build
npm run preview  # Preview production build

# Backend
composer install # Install PHP dependencies
```

## Security

- Password hashing (bcrypt)
- JWT authentication
- CSRF protection
- Rate limiting
- Input validation & sanitization
- Prepared statements (SQL injection prevention)
- XSS prevention
- Secure file uploads
- Role-based access control

## License

MIT License — see [LICENSE](LICENSE)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push and open a Pull Request
