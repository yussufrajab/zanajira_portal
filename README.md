# ZanAjira Portal — Mfumo wa Maombi ya Kazi za Serikali

**Government Civil Service Job Application Portal**

[![Go](https://img.shields.io/badge/Go-1.25.0-00ADD8?logo=go)](https://golang.org)
[![React](https://img.shields.io/badge/React-19.2.5-61DAFB?logo=react)](https://reactjs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql)](https://www.postgresql.org)
[![License](https://img.shields.io/badge/License-Proprietary-Government?color=blue)]()

---

## 📖 Overview / Muhtasari

ZanAjira is a web-based civil service recruitment portal serving the Revolutionary Government of Zanzibar. The system replaces manual, paper-based recruitment processes and provides a modern, accessible platform for job applicants and government administrators.

**ZanAjira** ni mfumo wa kitanuzi wa kuombea kazi za umma unaotumika na Serikali ya Mapinduzi ya Zanzibar. Mfumo huu unabadilisha michakato ya karatasi na kutoa jukwaa la kisasa kwa watumiaji na wasimamizi.

### Key Features / Vipengele Muhimu

| Feature | Description |
|---------|-------------|
| 🆔 **ZanID Integration** | Auto-populate applicant details from national identity system |
| ✅ **Profile Completion Engine** | Weighted scoring; minimum 70% required to apply |
| 📁 **File Upload Pipeline** | PDF validation with size enforcement (2MB certs / 1MB letters) |
| 🌐 **Bilingual Interface** | English (Kiingereza) and Kiswahili support |
| 🔐 **JWT Authentication** | HTTP-only cookie tokens with 15-min access / 7-day refresh |
| 👥 **Role-Based Access Control** | Granular permissions across all admin endpoints |
| 📊 **Audit Logging** | All actions logged with user, IP, timestamp |
| 📧 **Email Notifications** | Account activation, password reset, application updates |

---

## 🏗️ Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Applicants    │     │  Administrators  │     │   HR Staff      │
│   (Public)      │     │  (Super Admin)   │     │  (Vacancy Mgr)  │
└────────┬────────┘     └────────┬─────────┘     └────────┬────────┘
         │                       │                        │
         └───────────────────────┼────────────────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │      Nginx Reverse      │
                    │         Proxy           │
                    │   (TLS Termination)     │
                    └────────────┬────────────┘
                                 │
              ┌──────────────────┼──────────────────┐
              │                  │                  │
     ┌────────▼────────┐  ┌──────▼──────┐  ┌───────▼───────┐
     │  React Frontend │  │  Go API     │  │   Mailpit     │
     │  (Vite Dev Svr) │  │  (Echo)     │  │  (SMTP Test)  │
     │  Port: 5174     │  │  Port: 8080 │  │  Port: 1025   │
     └─────────────────┘  └──────┬──────┘  └───────────────┘
                                 │
                    ┌────────────┼────────────┐
                    │            │            │
           ┌────────▼────┐  ┌───▼────┐  ┌────▼─────┐
           │ PostgreSQL  │  │ Redis  │  │  File    │
           │   :5432     │  │ :6379  │  │  Storage │
           └─────────────┘  └────────┘  └──────────┘
```

---

## 🛠️ Tech Stack / Teknolojia

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| **Go** | 1.25.0 | Backend language |
| **Echo** | v4.15.2 | HTTP web framework |
| **PostgreSQL** | 16 | Primary database |
| **Redis** | 7.x | Session caching, rate limiting |
| **golang-jwt/jwt** | v5.3.1 | JWT authentication |
| **golang-migrate** | v4.19.1 | Database migrations |
| **sqlc** | v2 | Type-safe SQL code generation |

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19.2.5 | UI framework |
| **TypeScript** | 6.0.2 | Type safety |
| **Vite** | 8.0.10 | Build tool & dev server |
| **TailwindCSS** | 3.4.1 | Styling |
| **Zustand** | 5.0.13 | State management |
| **React Hook Form** | 7.75.0 | Form handling |
| **Zod** | 4.4.3 | Schema validation |
| **react-i18next** | 17.0.7 | Internationalization |

### Infrastructure
| Component | Technology |
|-----------|------------|
| Reverse Proxy | **Nginx** |
| Process Manager | **PM2** |
| Email Testing | **Mailpit** |
| Service Management | **manage.sh** (Bash) |

---

## 📁 Project Structure

```
zanajira/
├── .env.example                 # Environment template
├── manage.sh                    # Service manager script
├── docs/                        # Documentation files
├── nginx/                       # Nginx configuration
├── seeds/                       # Database seed data
│   ├── 001_reference_data.sql
│   └── 002_zanzibar_full_data.sql
├── zanajira-server/             # Go backend
│   ├── bin/                     # Compiled binary
│   ├── cmd/                     # Entry points
│   │   ├── server/main.go
│   │   └── create-admin/main.go
│   ├── db/                      # Database files
│   │   ├── migrations/
│   │   ├── queries/
│   │   └── sqlc.yaml
│   ├── internal/                # Business logic
│   │   ├── config/
│   │   ├── handler/
│   │   ├── middleware/
│   │   ├── models/
│   │   └── service/
│   └── go.mod
└── zanajira-web/                # React frontend
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── hooks/
    │   ├── stores/
    │   ├── i18n/
    │   └── locales/
    ├── package.json
    └── vite.config.ts
```

---

## 🚀 Quick Start / Anza Haraka

### Prerequisites / Mahitaji

- **Go** 1.25+
- **Node.js** 20+ (with npm)
- **PostgreSQL** 16+
- **Redis** 7+
- **Bash** shell

### 1. Clone & Setup

```bash
cd /workspace

# Copy environment file
cp .env.example .env

# Edit .env with your settings
nano .env
```

### 2. Initialize Database

```bash
# Create database and user
./manage.sh db:init

# Run migrations
./manage.sh db:migrate

# Seed reference data
./manage.sh db:seed
```

### 3. Create Admin User

```bash
./manage.sh create-admin
```

### 4. Start Development Servers

```bash
# Start everything (frontend + backend + infra)
./manage.sh dev

# Or start individual services
./manage.sh start api
./manage.sh start frontend
./manage.sh start postgres
./manage.sh start redis
```

### 5. Access the Application

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5174 |
| API | http://localhost:8080 |
| Mailpit (email testing) | http://localhost:8025 |
| PostgreSQL | localhost:5432 |
| Redis | localhost:6379 |

---

## 📋 Available Commands / Amri Zinazopatikana

### Service Management

```bash
./manage.sh dev                    # Start all in development mode
./manage.sh start [service]        # Start service (all, api, frontend, postgres, redis, mailpit)
./manage.sh stop [service]         # Stop service
./manage.sh restart [service]      # Restart service
./manage.sh status                 # Show service status
./manage.sh health                 # Health checks
```

### Database Commands

```bash
./manage.sh db:init                # Create database and user
./manage.sh db:migrate             # Run migrations up
./manage.sh db:rollback            # Rollback last migration
./manage.sh db:seed                # Seed reference data
./manage.sh db:backup              # Backup database (gzip)
./manage.sh db:restore [file]      # Restore from backup
```

### Build Commands

```bash
./manage.sh build                  # Build backend + frontend
./manage.sh build:backend          # Build Go binary only
./manage.sh build:frontend         # Build React production bundle
./manage.sh clean                  # Remove build artifacts
```

### Logs

```bash
./manage.sh logs [service]         # View recent logs
./manage.sh tail [service]         # Tail logs in real-time
```

---

## 🔐 Default Credentials / Nenosiri la Chaguomsingi

After running `./manage.sh create-admin`:

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@zanajira.go.tz | (set during creation) |

**Note:** Default database credentials (from `.env.example`):
- Database: `zanajira`
- User: `zanajira`
- Password: `zanajira_pass`

⚠️ **Change these in production!**

---

## 📧 Email Configuration

### Development (Mailpit)

```env
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_FROM=noreply@zanajira.go.tz
```

Access Mailpit UI at: http://localhost:8025

### Production SMTP

```env
SMTP_HOST=smtp.zanajira.go.tz
SMTP_PORT=587
SMTP_USER=noreply@zanajira.go.tz
SMTP_PASS=your-secure-password
SMTP_FROM=noreply@zanajira.go.tz
```

---

## 🌍 Internationalization / Lugha

The application supports two languages:

| Code | Language |
|------|----------|
| `en` | English (Kiingereza) |
| `sw` | Kiswahili |

Language can be switched from the UI or via API preferences.

---

## 🔒 Security Features

- **JWT Authentication**: HTTP-only cookies with short-lived access tokens (15 min)
- **Refresh Tokens**: 7-day refresh token rotation
- **Password Hashing**: bcrypt with cost factor 12
- **Input Validation**: Zod schema validation on all forms
- **SQL Injection Prevention**: Parameterized queries via sqlc
- **CORS Protection**: Configured allowed origins
- **Rate Limiting**: Redis-based rate limiting on auth endpoints
- **Audit Logging**: All sensitive actions logged

---

## 📊 User Roles

| Role | Permissions |
|------|-------------|
| **Applicant** | Browse vacancies, complete profile, submit applications |
| **HR Officer** | Manage vacancies, review applications, shortlist candidates |
| **Administrator** | Full system access, user management, reports |
| **Super Admin** | All permissions + system configuration |

---

## 🧪 Testing

### Backend Tests

```bash
cd zanajira-server
go test ./...
```

### Frontend Tests

```bash
cd zanajira-web
npm run test
```

---

## 📦 Deployment

### Production Build

```bash
# Build everything
./manage.sh build

# Set production mode
export ZANAJIRA_MODE=prod

# Start in production mode
./manage.sh start
```

### Nginx Configuration

See `nginx/zanajira.conf` for the production reverse proxy configuration.

### PM2 Process Management

```bash
# Install PM2 globally
npm install -g pm2

# Start API with PM2
pm2 start zanajira-server/bin/server --name zanajira-api

# Monitor
pm2 monit
```

---

## 📝 Environment Variables

Key variables (see `.env.example` for full list):

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `REDIS_URL` | Redis connection string | `redis://localhost:6379` |
| `JWT_SECRET` | JWT signing secret (32+ chars) | Required |
| `JWT_REFRESH_SECRET` | Refresh token secret | Required |
| `PORT` | API server port | `8080` |
| `FRONTEND_PORT` | Frontend dev port | `5174` |
| `ZANAJIRA_MODE` | `dev` or `prod` | `dev` |
| `SMTP_HOST` | SMTP server host | `localhost` |
| `UPLOAD_DIR` | File upload directory | `/tmp/zanajira/uploads` |

---

## 📚 Documentation

Additional documentation available in `docs/`:

- `ZanAjira_SRS.md` - Software Requirements Specification
- `ZanAjira_System_Documentation.md` - Complete system documentation
- `ZanAjira_Implementation_Plan.md` - Implementation roadmap
- `technology_used.md` - Detailed technology breakdown
- `ui_documentation.md` - UI/UX guidelines

---

## 🤝 Support / Msaada

For technical support or inquiries:

- **Email**: support@zanajira.go.tz
- **Documentation**: See `docs/` folder
- **Issues**: Report via project issue tracker

---

## 📄 License / Leseni

© 2026 Revolutionary Government of Zanzibar
Civil Service Commission (Tume ya Utumishi wa Umma)

All rights reserved. This software is proprietary and confidential.

---

## 🙏 Acknowledgments

Developed by **eGaz / OR-KSUUB** for the Civil Service Commission of Zanzibar.

Special thanks to all contributors and the Government of Zanzibar for supporting digital transformation in public service recruitment.

---

**Built with ❤️ for Zanzibar**
