# ZanAjira — Implementation Plan

**Project:** Government Job Application Portal (portal.zanajira.go.tz)
**Client:** Civil Service Commission, Revolutionary Government of Zanzibar
**Date:** 2026-05-10
**Based on:** ZanAjira SRS v1.0

---

## 1. Architecture Overview

### 1.1 Tech Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Frontend (Applicant) | React + TypeScript + Vite | Responsive SPA, mobile-first, fast vacancy browsing |
| Frontend (Admin) | React + TypeScript + Vite | Dark-themed dashboard SPA with data tables and charts |
| Backend API | Node.js + Express + TypeScript | REST API serving both portals, JWT auth |
| Database | PostgreSQL | Relational integrity for applicants, vacancies, applications; PDF storage |
| File Storage | Local disk + CDN (static assets) | PDF certificates/letters with size limits enforced at upload |
| Email | Nodemailer + SMTP relay | Account activation, password recovery, notifications |
| Identity Integration | ZanID REST API adapter | Auto-populate applicant personal details from national ID system |
| Caching | Redis | Session management, dashboard stats, vacancy search |
| Service Management | Bash script (manage.sh) | Start/stop/restart all services (PostgreSQL, Redis, API, Nginx) |

### 1.2 High-Level Architecture

```
[Browser] ──HTTPS──▶ [Nginx Reverse Proxy]
                         │
                 ┌───────┴───────┐
                 │               │
         [Applicant SPA]   [Admin SPA]
                 │               │
                 └───────┬───────┘
                         │
                    [Express API]
                    │    │    │
              ┌─────┘    │    └─────┐
         [PostgreSQL] [Redis]  [ZanID API]
                         │
                    [SMTP Relay]
```

### 1.3 Project Structure

```
zanajira/
├── apps/
│   ├── applicant-portal/     # Applicant-facing SPA
│   └── admin-portal/        # Admin-facing SPA
├── packages/
│   ├── api/                  # Express REST API
│   ├── shared/               # Shared types, validators, constants
│   └── zanid-client/         # ZanID integration client
├── migrations/               # Database migrations
├── seeds/                    # Seed data (institutions, programmes, etc.)
├── docs/                     # Project documentation
├── manage.sh                 # Service management script (start/stop/restart)
├── nginx/                    # Nginx config files
└── package.json              # Monorepo root (pnpm workspaces)
```

---

## 2. Database Schema

### 2.1 Core Tables

```sql
-- Users & Auth
users (id, email, password_hash, role, is_active, activation_token, activation_expires, created_at, updated_at)
roles (id, name, description)
permissions (id, name, resource, action)
role_permissions (role_id, permission_id)

-- Applicant Profile
applicants (id, user_id, zanid, first_name, last_name, sex, date_of_birth,
            nationality, originality, govt_employment_status, marital_status,
            impairment, photo_path, profile_completion_pct, declaration_accepted,
            declaration_at, created_at, updated_at)

contact_details (id, applicant_id, country, state_city, province_county,
                 mobile_number, alt_email, present_address, birth_cert_path)

academic_qualifications (id, applicant_id, education_level, country, institution_id,
                         programme_id, programme_category, year_from, year_to,
                         gpa_result, cert_path, tcu_cert_path, nacte_cert_path,
                         necta_cert_path, lost_cert_index, lost_cert_year)

professional_qualifications (id, applicant_id, country, institution, course_name,
                              start_date, end_date, cert_path)

language_proficiencies (id, applicant_id, language, speaking, reading, writing)

work_experiences (id, applicant_id, organization, job_title, supervisor_name,
                  supervisor_address, supervisor_mobile, duties, start_date,
                  end_date, is_current)

trainings (id, applicant_id, name, institution, description, start_date,
           end_date, cert_path)

computer_skills (id, applicant_id, skill, proficiency, cert_path)

referees (id, applicant_id, title, full_name, organization, email, mobile, postal_address)

other_attachments (id, applicant_id, type, file_path)

-- Vacancies & Applications
employers (id, name, contact_email, contact_phone, address)

vacancies (id, employer_id, post_title, num_posts, location, qualifications,
           duties, salary_scale, closing_date, status, created_by, created_at, updated_at)

applications (id, applicant_id, vacancy_id, application_letter_path, status,
              applied_at, updated_at)
-- status enum: received, in_progress, shortlisted, placed, rejected

-- Admin Data
secretariats (id, employer_id, officer_name, officer_contact)
permits (id, employer_id, vacancy_id, issued_by, issued_at, status)

key_matrices (id, name, criteria_json)
schemes_of_service (id, grade, title, qualification_requirements, career_path)

-- Reference Data
academic_levels (id, name, sort_order)
academic_programmes (id, level_id, institution_id, name, category)
academic_institutions (id, name, country, type)  -- type: local/foreign
academic_subscriptions (id, institution_id, programme_id)

professional_courses (id, name)
professional_institutions (id, name, country)
computer_skill_definitions (id, name)  -- MS Word, MS Excel, MS PowerPoint

-- Audit
audit_logs (id, user_id, action, resource, resource_id, ip_address, timestamp, metadata_json)
```

### 2.2 Key Constraints

- `users.email` — UNIQUE, NOT NULL
- `applicants.zanid` — UNIQUE, NOT NULL
- `applications(applicant_id, vacancy_id)` — UNIQUE (one application per vacancy per applicant)
- All file paths reference uploaded PDFs on local disk
- `vacancies.closing_date` — enforced at application layer (no submissions after close)

---

## 3. Implementation Phases

### Phase 1: Foundation (Weeks 1–3)

**Goal:** Project scaffolding, auth, database, and core applicant profile.

| # | Task | Details | Dependencies |
|---|------|---------|-------------|
| 1.1 | Monorepo setup | pnpm workspaces, ESLint, Prettier, tsconfig, husky | None |
| 1.2 | manage.sh script | Bash script to start/stop/restart PostgreSQL, Redis, Nginx, API; health checks; log management | 1.1 |
| 1.3 | Database schema & migrations | All tables from Section 2, seed scripts for reference data | 1.1 |
| 1.4 | Auth system | Registration, email activation, login, JWT tokens, password reset, RBAC middleware | 1.3 |
| 1.5 | ZanID client | HTTP client to ZanID API, mock adapter for dev, auto-populate endpoint | 1.3 |
| 1.6 | Applicant portal shell | Vite + React + Router, layout (header, sidebar), dashboard skeleton | 1.1 |
| 1.7 | Admin portal shell | Vite + React + Router, dark sidebar layout, dashboard skeleton | 1.1 |

**Milestone:** User can register, activate account, log in, and see empty dashboards.

### Phase 2: Applicant Profile (Weeks 4–7)

**Goal:** Full applicant profile with all sections, file uploads, and 70% completion tracking.

| # | Task | Details | Dependencies |
|---|------|---------|-------------|
| 2.1 | Personal details page | ZanID lookup, auto-populate, photo upload, supplementary fields | 1.4, 1.5 |
| 2.2 | Contact details page | Form + birth certificate PDF upload (max 2MB) | 1.4 |
| 2.3 | Academic qualifications | Multi-add form, level/institution/programme selectors, PDF upload, TCU/NACTE/NECTA verification uploads, lost cert declaration | 1.3, 1.4 |
| 2.4 | Professional qualifications | Multi-add form, PDF upload | 1.4 |
| 2.5 | Language proficiency | Add/remove languages, proficiency ratings per skill | 1.4 |
| 2.6 | Work experience | Multi-add form, current-job toggle | 1.4 |
| 2.7 | Training & workshops | Multi-add form, optional cert upload | 1.4 |
| 2.8 | Computer literacy | Skill selector with proficiency rating, optional cert | 1.4 |
| 2.9 | Referees | Multi-add form (minimum 1) | 1.4 |
| 2.10 | Other attachments | Type selector (birth cert, CV, recommendation), PDF upload | 1.4 |
| 2.11 | Declaration & CV preview | Checkbox declaration, system-generated CV, print function | 2.1–2.10 |
| 2.12 | Profile completion engine | Compute 70% threshold, display percentage on dashboard, block apply if below | 2.1–2.10 |
| 2.13 | File upload service | PDF-only validation, size enforcement (2MB certs, 1MB letters), virus scan | 1.3 |

**Milestone:** Applicant can complete full profile, see completion %, preview/print CV.

### Phase 3: Vacancies & Applications (Weeks 8–10)

**Goal:** Vacancy browsing, search, application submission, and status tracking.

| # | Task | Details | Dependencies |
|---|------|---------|-------------|
| 3.1 | Public vacancy listing | Homepage showing all open vacancies, no auth required (FR-PUB-001) | 1.3 |
| 3.2 | Vacancy search | Keyword search on public listing (FR-PUB-002) | 3.1 |
| 3.3 | Vacancy detail page | Full details: qualifications, duties, salary, closing date | 3.1 |
| 3.4 | Apply for vacancy | Profile ≥70% check, declaration, application letter upload (max 1MB), submit (FR-APP-015) | 2.12, 3.3 |
| 3.5 | Replace application letter | Allow letter swap before closing date (FR-APP-016) | 3.4 |
| 3.6 | My Applications page | List all applications with status tracking (FR-APP-017) | 3.4 |
| 3.7 | Email notifications | Application confirmation email, status change emails | 1.4 |

**Milestone:** Full applicant journey: register → profile → apply → track.

### Phase 4: Admin Portal (Weeks 11–16)

**Goal:** Complete admin portal with all management modules.

| # | Task | Details | Dependencies |
|---|------|---------|-------------|
| 4.1 | Admin dashboard | Stats cards (total, new, in-progress, placed), employer bar chart, toggle views | 1.3, 1.7 |
| 4.2 | User & role management | CRUD for roles, permissions, staff accounts, applicant list/search (FR-ADM-002–006) | 1.4, 4.1 |
| 4.3 | System configuration | Config UI for file limits, thresholds, email templates (FR-ADM-007) | 4.2 |
| 4.4 | Secretariat management | CRUD for secretariat records, officer assignment (FR-ADM-008) | 4.2 |
| 4.5 | Permit management | Issue/view/manage recruitment permits (FR-ADM-009) | 4.2 |
| 4.6 | Vacancy management | Create, publish, edit, close adverts (FR-ADM-012–014) | 4.2, 1.3 |
| 4.7 | Applicant pipeline | View applicants per vacancy, shortlist/progress/reject (FR-ADM-014) | 4.6 |
| 4.8 | Academic management | Levels, programmes, institutions, subscriptions CRUD (FR-ADM-015–018) | 4.2 |
| 4.9 | Professional management | Computer skills, courses, institutions CRUD (FR-ADM-019–021) | 4.2 |
| 4.10 | Key matrices & scheme of service | CRUD for scoring matrices and career structures (FR-ADM-010–011) | 4.2 |
| 4.11 | Audit log viewer | Filterable log by user, action, date (FR-ADM-006) | 4.2 |

**Milestone:** Admin can fully manage the recruitment lifecycle.

### Phase 5: Security, Polish & Deployment (Weeks 17–19)

| # | Task | Details |
|---|------|---------|
| 5.1 | Security hardening | Rate limiting, CSRF protection, CSP headers, input sanitization, PDF malware scan |
| 5.2 | Session management | 30-min inactivity timeout, secure cookie flags |
| 5.3 | Accessibility audit | Mobile/tablet responsiveness, keyboard nav, screen reader basics |
| 5.4 | Performance optimization | Redis caching for dashboard stats, vacancy listing pagination, lazy-loaded PDFs |
| 5.5 | Load testing | Verify 1,000 concurrent users (NFR-PERF-004) |
| 5.6 | Production deployment | Nginx config, SSL/TLS, database backups, monitoring, health checks |
| 5.7 | User guide | Applicant-facing help page (NFR-USE-001) |

---

## 4. API Design

### 4.1 Authentication Endpoints

```
POST   /api/auth/register          # FR-PUB-003
GET    /api/auth/activate/:token   # Email activation
POST   /api/auth/login             # FR-PUB-004
POST   /api/auth/forgot-password   # Password reset request
POST   /api/auth/reset-password    # Password reset confirmation
POST   /api/auth/change-password   # FR-APP-018 (authenticated)
POST   /api/auth/logout            # FR-APP-019
```

### 4.2 Applicant Profile Endpoints

```
GET    /api/applicants/me                    # Get own profile summary
GET    /api/applicants/me/completion          # Profile completion percentage
PUT    /api/applicants/me/personal             # FR-APP-002
PUT    /api/applicants/me/contact             # FR-APP-003
POST   /api/applicants/me/academic            # FR-APP-004 (add)
PUT    /api/applicants/me/academic/:id         # FR-APP-004 (update)
DELETE /api/applicants/me/academic/:id          # FR-APP-004 (remove)
POST   /api/applicants/me/professional         # FR-APP-005
PUT    /api/applicants/me/professional/:id
DELETE /api/applicants/me/professional/:id
POST   /api/applicants/me/language             # FR-APP-006
DELETE /api/applicants/me/language/:id
POST   /api/applicants/me/experience           # FR-APP-007
PUT    /api/applicants/me/experience/:id
DELETE /api/applicants/me/experience/:id
POST   /api/applicants/me/training             # FR-APP-008
DELETE /api/applicants/me/training/:id
PUT    /api/applicants/me/computer-skills       # FR-APP-009
POST   /api/applicants/me/referee              # FR-APP-010
PUT    /api/applicants/me/referee/:id
DELETE /api/applicants/me/referee/:id
POST   /api/applicants/me/attachment           # FR-APP-011
DELETE /api/applicants/me/attachment/:id
POST   /api/applicants/me/declaration          # FR-APP-012
GET    /api/applicants/me/cv                   # FR-APP-013 (generated CV)
POST   /api/applicants/me/photo                # FR-APP-002 (photo upload)
```

### 4.3 Vacancy & Application Endpoints

```
GET    /api/vacancies                  # FR-PUB-001 / FR-APP-014 (public + auth)
GET    /api/vacancies/search?q=        # FR-PUB-002
GET    /api/vacancies/:id              # Vacancy detail
POST   /api/applications               # FR-APP-015 (apply)
GET    /api/applications/me            # FR-APP-017 (my applications)
PUT    /api/applications/:id/letter     # FR-APP-016 (replace letter)
```

### 4.4 Admin Endpoints

```
GET    /api/admin/dashboard             # FR-ADM-001

# User & Authorization
GET/POST       /api/admin/roles         # FR-ADM-002
GET/PUT/DELETE /api/admin/roles/:id
GET/POST       /api/admin/permissions   # FR-ADM-003
GET/POST       /api/admin/staff         # FR-ADM-004
GET/PUT/DELETE /api/admin/staff/:id
GET            /api/admin/applicants     # FR-ADM-005 (list + search)
GET            /api/admin/audit-logs     # FR-ADM-006

# Configuration
GET/PUT  /api/admin/config              # FR-ADM-007

# Secretariat & Permits
CRUD    /api/admin/secretariats          # FR-ADM-008
CRUD    /api/admin/permits               # FR-ADM-009

# Vacancies
CRUD    /api/admin/vacancies             # FR-ADM-012–013
GET     /api/admin/vacancies/:id/applicants  # FR-ADM-014
PUT     /api/admin/applications/:id/status   # Shortlist/progress/reject

# Academic & Professional Reference Data
CRUD    /api/admin/academic-levels       # FR-ADM-015
CRUD    /api/admin/academic-programmes   # FR-ADM-016
CRUD    /api/admin/academic-institutions # FR-ADM-018
CRUD    /api/admin/academic-subscriptions # FR-ADM-017
CRUD    /api/admin/computer-skills       # FR-ADM-019
CRUD    /api/admin/professional-courses  # FR-ADM-020
CRUD    /api/admin/professional-institutions # FR-ADM-021

# Key Matrices & Scheme of Service
CRUD    /api/admin/key-matrices          # FR-ADM-010
CRUD    /api/admin/schemes-of-service    # FR-ADM-011
```

### 4.5 ZanID Integration

```
GET    /api/zanid/:id                   # Lookup ZanID, return personal details
```

---

## 5. Key Implementation Details

### 5.1 Profile Completion Calculation

Each profile section contributes a weighted percentage toward the 70% threshold:

| Section | Weight |
|---------|--------|
| Personal Details (ZanID + photo) | 20% |
| Contact Details | 10% |
| Academic Qualifications (min 1) | 20% |
| Professional Qualifications | 5% |
| Language Proficiency (min 1) | 10% |
| Work Experience | 10% |
| Referees (min 1) | 10% |
| Declaration | 10% |
| Training, Computer Skills, Attachments | 5% (bonus) |

The API computes this on every profile save and returns the percentage. The applicant portal displays it in real-time.

### 5.2 File Upload Pipeline

```
Client → multipart/form-data → API
  → Validate: PDF only, size ≤ limit (2MB certs / 1MB letters)
  → Scan: antivirus check
  → Store: /uploads/{type}/{uuid}.pdf
  → DB: save path, return ID
```

### 5.3 ZanID Integration Flow

```
Applicant enters ZanID
  → API calls ZanID service
  → If valid: auto-populate first_name, last_name, sex, dob, nationality
  → If invalid/unavailable: return error, applicant cannot proceed
```

A mock ZanID service will be provided for development. The integration adapter pattern allows swapping between mock and real without code changes.

### 5.4 Authentication & Session

- JWT access tokens (15-min expiry) + refresh tokens (7-day expiry)
- Refresh token rotation on each use
- Tokens stored in HTTP-only cookies for XSS protection
- 30-minute inactivity session timeout (configurable via admin settings)
- Failed login rate limiting: lock after 5 attempts for 15 minutes

### 5.5 RBAC Implementation

```typescript
// Middleware pattern
function requirePermission(resource: string, action: string) {
  return (req, res, next) => {
    const userRole = req.user.role;
    const allowed = rolePermissions[userRole]?.[resource]?.includes(action);
    if (!allowed) return res.status(403).json({ error: 'Forbidden' });
    next();
  };
}

// Usage
app.delete('/api/admin/staff/:id', requirePermission('staff', 'delete'), handler);
```

---

## 6. Testing Strategy

| Level | Tool | Coverage |
|-------|------|----------|
| Unit | Vitest | Services, validators, utility functions |
| Integration | Supertest | API endpoints, auth flows, file uploads |
| E2E | Playwright | Full applicant journey, admin CRUD |
| Load | k6 | 1,000 concurrent users, file uploads |

**Critical test paths:**
- Registration → activation → login → profile completion → application → status tracking
- Admin login → create vacancy → publish → view applicants → shortlist → place
- File upload validation (PDF-only, size limits)
- ZanID integration (success + failure cases)
- Profile completion threshold enforcement (block apply below 70%)

---

## 7. Deployment & Operations

### 7.1 Infrastructure

- **Hosting:** Government data center (managed by eGaz)
- **SSL:** TLS certificate on Nginx reverse proxy (SEC-002)
- **Backups:** Daily PostgreSQL dumps, retained per government policy
- **Monitoring:** Application health endpoint, log aggregation, email delivery monitoring
- **Service Management:** All services managed via `manage.sh` script

### 7.1.1 manage.sh Commands

```bash
./manage.sh start          # Start all services (PostgreSQL, Redis, Nginx, API)
./manage.sh stop           # Stop all services
./manage.sh restart        # Restart all services
./manage.sh status         # Check status of all services
./manage.sh logs [service] # Tail logs (api, postgres, redis, nginx, all)
./manage.sh migrate         # Run database migrations
./manage.sh seed           # Run seed scripts
./manage.sh create-admin   # Create initial admin user interactively
./manage.sh health          # Health check all services
./manage.sh backup          # Create PostgreSQL dump
./manage.sh restore [file] # Restore from backup file
```

### 7.1.2 Service Configuration

Services run natively on the host:
- **PostgreSQL:** System service (systemd) — `postgresql@14-main`
- **Redis:** System service (systemd) — `redis-server`
- **Nginx:** System service (systemd) — reverse proxy + static file serving
- **API:** Managed by PM2 — process management, auto-restart, log rotation

### 7.2 Environment Variables

```
DATABASE_URL          # PostgreSQL connection string
REDIS_URL             # Redis connection string
ZANID_API_URL         # ZanID service endpoint
ZANID_API_KEY         # ZanID authentication key
SMTP_HOST             # Email server
SMTP_PORT             # Email server port
SMTP_USER             # Email server username
SMTP_PASS             # Email server password
JWT_SECRET            # Token signing key
JWT_REFRESH_SECRET    # Refresh token signing key
UPLOAD_DIR            # File storage directory
APP_URL               # Public-facing URL for email links
```

### 7.3 Data Migration & Seeding

On first deployment:
1. Start services: `./manage.sh start`
2. Run database migrations: `./manage.sh migrate`
3. Seed reference data: `./manage.sh seed`
4. Create initial admin user: `./manage.sh create-admin`
5. Configure system settings via admin portal

---

## 8. Risk Register

| Risk | Impact | Mitigation |
|------|--------|-----------|
| ZanID API unavailable | Applicants cannot complete profiles | Mock fallback; allow manual entry with verification workflow |
| Email delivery failures | Users cannot activate accounts | Queue with retries; admin can manually activate |
| High traffic during vacancy openings | Slow responses, timeouts | Redis caching; rate limiting; horizontal scaling |
| PDF malware upload | Security risk | Server-side antivirus scan; content-type validation |
| 50K+ registered users scaling | DB performance | Index optimization; pagination; connection pooling |

---

## 9. Requirement Traceability

| SRS Ref | Phase | Implementation |
|---------|-------|---------------|
| FR-PUB-001 | 3.1 | Public vacancy listing |
| FR-PUB-002 | 3.2 | Vacancy search |
| FR-PUB-003 | 1.4 | Registration + activation |
| FR-PUB-004 | 1.4 | Login + password recovery |
| FR-APP-001 | 1.6 | Applicant dashboard |
| FR-APP-002 | 2.1 | Personal details + ZanID |
| FR-APP-003 | 2.2 | Contact details |
| FR-APP-004 | 2.3 | Academic qualifications |
| FR-APP-005 | 2.4 | Professional qualifications |
| FR-APP-006 | 2.5 | Language proficiency |
| FR-APP-007 | 2.6 | Work experience |
| FR-APP-008 | 2.7 | Training & workshops |
| FR-APP-009 | 2.8 | Computer literacy |
| FR-APP-010 | 2.9 | Referees |
| FR-APP-011 | 2.10 | Other attachments |
| FR-APP-012 | 2.11 | Declaration |
| FR-APP-013 | 2.11 | CV preview |
| FR-APP-014 | 3.1 | Authenticated vacancy browsing |
| FR-APP-015 | 3.4 | Apply for vacancy |
| FR-APP-016 | 3.5 | Replace application letter |
| FR-APP-017 | 3.6 | My applications |
| FR-APP-018 | 1.4 | Change password |
| FR-APP-019 | 1.4 | Logout |
| FR-ADM-001 | 4.1 | Admin dashboard |
| FR-ADM-002 | 4.2 | Roles management |
| FR-ADM-003 | 4.2 | Permissions management |
| FR-ADM-004 | 4.2 | Staff management |
| FR-ADM-005 | 4.2 | Applicant account management |
| FR-ADM-006 | 4.11 | Audit logs |
| FR-ADM-007 | 4.3 | System configuration |
| FR-ADM-008 | 4.4 | Secretariat management |
| FR-ADM-009 | 4.5 | Permit management |
| FR-ADM-010 | 4.10 | Key matrices |
| FR-ADM-011 | 4.10 | Scheme of service |
| FR-ADM-012 | 4.6 | Create job advert |
| FR-ADM-013 | 4.6 | Publish/manage adverts |
| FR-ADM-014 | 4.7 | View applicants per vacancy |
| FR-ADM-015 | 4.8 | Academic levels |
| FR-ADM-016 | 4.8 | Academic programmes |
| FR-ADM-017 | 4.8 | Academic subscriptions |
| FR-ADM-018 | 4.8 | Academic institutions |
| FR-ADM-019 | 4.9 | Computer skills |
| FR-ADM-020 | 4.9 | Professional courses |
| FR-ADM-021 | 4.9 | Professional institutions |

---

## 10. Timeline Summary

| Phase | Duration | Key Deliverable |
|-------|----------|----------------|
| Phase 1 | Weeks 1–3 | Project scaffold, auth, DB, empty dashboards |
| Phase 2 | Weeks 4–7 | Complete applicant profile with 70% threshold |
| Phase 3 | Weeks 8–10 | Vacancy browsing, application, status tracking |
| Phase 4 | Weeks 11–16 | Full admin portal |
| Phase 5 | Weeks 17–19 | Security, performance, deployment |
| **Total** | **~19 weeks** | |

---

*Document End — ZanAjira Implementation Plan v1.0*