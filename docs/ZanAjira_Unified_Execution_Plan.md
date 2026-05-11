# ZanAjira Portal — Unified Comprehensive Execution Plan

**Project:** Government Job Application Portal (`portal.zanajira.go.tz`)
**Client:** Civil Service Commission, Revolutionary Government of Zanzibar
**Developer:** eGaz / OR-KSUUB
**Based on:** ZanAjira SRS v1.0
**Date:** 2026-05-10
**Version:** 1.0 (Unified)

---

## Overview

ZanAjira is a web-based civil service recruitment portal serving two distinct user groups:

- **Applicants (Job Seekers):** Register, build structured profiles, browse vacancies, and submit applications.
- **Administrators / HR Staff:** Manage the full recruitment lifecycle — from vacancy creation through applicant placement.

This document is the single authoritative execution plan for building the ZanAjira system. It combines the Infrastructure Plan, Implementation Plan, and SRS into one actionable reference for Claude Code and the development team.

---

## Tech Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Backend API | Go + Echo framework | Performant, type-safe REST API; ideal for government workloads |
| Frontend (Both Portals) | React + TypeScript + Vite | Responsive SPA; separate builds for Applicant and Admin portals |
| Database | PostgreSQL | Relational integrity for applicants, vacancies, applications |
| Query Layer | sqlc + golang-migrate | Type-safe Go DB code; versioned migrations |
| UI Components | TailwindCSS + shadcn/ui | Consistent, accessible design system |
| Email | SMTP (Mailpit for dev) | Account activation, password recovery, notifications |
| Identity | ZanID REST API adapter | Auto-populate personal details from national ID system |
| Service Management | `manage.sh` (Bash) | Start / stop / restart all local services — **no Docker** |

---

## Project Structure

```
zanajira/
├── zanajira-server/              # Go + Echo backend
│   ├── cmd/server/main.go
│   ├── internal/
│   │   ├── config/
│   │   ├── handler/
│   │   ├── service/
│   │   ├── middleware/
│   │   └── repository/           # sqlc-generated code
│   └── db/
│       ├── migrations/
│       ├── queries/
│       └── sqlc.yaml
├── zanajira-web/                 # React + TS frontend
│   └── src/
│       ├── features/
│       │   ├── public/
│       │   ├── applicant/
│       │   └── admin/
│       ├── store/                # Zustand state
│       ├── i18n/                 # en.json + sw.json
│       └── components/
├── manage.sh                     # Service management script
├── nginx/                        # Nginx reverse proxy config
├── seeds/                        # Reference data seed scripts
└── .gitignore
```

---

## `manage.sh` — Service Management Script

All services are managed natively on the host via `manage.sh`. There is no Docker.

Services run as native host processes:
- **PostgreSQL** — system service (`systemd`: `postgresql@14-main`)
- **Redis** — system service (`systemd`: `redis-server`) *(for session / caching)*
- **Nginx** — system service (`systemd`): reverse proxy + static file serving
- **Go API** — managed by PM2 or `air` for dev hot-reload

### Commands

```bash
./manage.sh start              # Start all services (PostgreSQL, Redis, Nginx, API)
./manage.sh stop               # Stop all services
./manage.sh restart            # Restart all services
./manage.sh status             # Health check all services
./manage.sh logs [service]     # Tail logs: api | postgres | redis | nginx | all

./manage.sh db:init            # Create PostgreSQL database and user
./manage.sh db:migrate         # Run golang-migrate up
./manage.sh db:rollback        # Run golang-migrate down 1
./manage.sh db:seed            # Run reference data seed scripts
./manage.sh db:backup          # Create timestamped PostgreSQL dump
./manage.sh db:restore [file]  # Restore from dump file

./manage.sh sqlc:gen           # Run sqlc generate
./manage.sh dev:backend        # Start Go server with air (hot-reload)
./manage.sh dev:frontend       # cd zanajira-web && npm run dev
./manage.sh dev:mail           # Start Mailpit for SMTP email testing

./manage.sh create-admin       # Create initial admin user interactively
./manage.sh health             # Health check all services with output
```

---

## Environment Variables

```env
# Database
DATABASE_URL=postgres://user:pass@localhost:5432/zanajira?sslmode=disable

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=<strong-secret>
JWT_REFRESH_SECRET=<strong-refresh-secret>

# ZanID Integration
ZANID_API_URL=https://zanid.go.tz/api
ZANID_API_KEY=<api-key>

# SMTP
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_USER=
SMTP_PASS=

# Application
UPLOAD_DIR=/var/zanajira/uploads
APP_URL=https://portal.zanajira.go.tz
```

---

## Phase 1 — Workspace, Scaffolding & `manage.sh`

**Duration:** Weeks 1–2
**Objective:** Initialize the monorepo, create the service management script, and scaffold both backend and frontend projects.
**Milestone:** Repo exists, services start cleanly, both apps render a placeholder page.

### Steps

1. **Initialize Monorepo**
   - Create root directory `zanajira/` and `cd` into it.
   - Run `git init`.
   - Create `.gitignore` covering Go binaries, `node_modules`, `tmp/`, environment files, and build outputs.

2. **Create `manage.sh`**
   - Write the full bash script at the project root covering all commands listed above.
   - Run `chmod +x manage.sh`.
   - Test `./manage.sh status` to verify service detection logic.

3. **Backend Scaffolding (`zanajira-server/`)**
   - Run `go mod init github.com/egaz/zanajira-server`.
   - Install dependencies:
     ```
     go get github.com/labstack/echo/v4
     go get github.com/sqlc-dev/sqlc
     go get github.com/golang-migrate/migrate/v4
     go get github.com/golang-jwt/jwt/v5
     go get golang.org/x/crypto
     go get github.com/lib/pq
     ```
   - Create directory structure: `cmd/server/main.go`, `internal/handler/`, `internal/service/`, `internal/middleware/`, `internal/config/`, `db/migrations/`, `db/queries/`, `db/sqlc.yaml`.
   - Write a minimal `main.go` that starts Echo and returns `200 OK` on `GET /health`.

4. **Frontend Scaffolding (`zanajira-web/`)**
   - Run `npm create vite@latest . -- --template react-ts`.
   - Install dependencies:
     ```
     npm install axios react-router-dom zustand react-hook-form @hookform/resolvers zod react-i18next i18next
     npm install -D tailwindcss postcss autoprefixer
     npx tailwindcss init -p
     npx shadcn-ui@latest init
     ```
   - Configure Tailwind for `src/**`.

5. **Nginx Configuration**
   - Write `nginx/zanajira.conf` to reverse-proxy:
     - `/api/*` → Go backend at `localhost:8080`
     - `/` → Vite frontend (dev: `localhost:5173`, prod: static `dist/`)

---

## Phase 2 — Database Schema & sqlc Data Layer

**Duration:** Week 3
**Objective:** Build the PostgreSQL schema and generate the type-safe Go data access layer based on SRS Section 8.
**Milestone:** Migrations apply cleanly; `sqlc generate` produces error-free Go code.

### Migrations (`zanajira-server/db/migrations/`)

**001_create_users.sql**
```sql
users (id, email, password_hash, role, is_active,
       activation_token, activation_expires, created_at, updated_at)
roles (id, name, description)
permissions (id, name, resource, action)
role_permissions (role_id, permission_id)
```

**002_create_applicant_profile.sql**
```sql
applicants (id, user_id, zanid UNIQUE, first_name, last_name, sex,
            date_of_birth, nationality, originality, govt_employment_status,
            marital_status, impairment, photo_path,
            profile_completion_pct, declaration_accepted, declaration_at,
            created_at, updated_at)
contact_details (id, applicant_id, country, state_city, province_county,
                 mobile_number, alt_email, present_address, birth_cert_path)
academic_qualifications (id, applicant_id, education_level, country,
                          institution_id, programme_id, programme_category,
                          year_from, year_to, gpa_result, cert_path,
                          tcu_cert_path, nacte_cert_path, necta_cert_path,
                          lost_cert_index, lost_cert_year)
professional_qualifications (id, applicant_id, country, institution,
                              course_name, start_date, end_date, cert_path)
language_proficiencies (id, applicant_id, language,
                         speaking, reading, writing)
work_experiences (id, applicant_id, organization, job_title,
                  supervisor_name, supervisor_address, supervisor_mobile,
                  duties, start_date, end_date, is_current)
trainings (id, applicant_id, name, institution, description,
           start_date, end_date, cert_path)
computer_skills (id, applicant_id, skill, proficiency, cert_path)
referees (id, applicant_id, title, full_name, organization,
          email, mobile, postal_address)
other_attachments (id, applicant_id, type, file_path)
```

**003_create_recruitment.sql**
```sql
employers (id, name, contact_email, contact_phone, address)
vacancies (id, employer_id, post_title, num_posts, location,
           qualifications, duties, salary_scale, closing_date,
           status, created_by, created_at, updated_at)
applications (id, applicant_id, vacancy_id UNIQUE(applicant_id, vacancy_id),
              application_letter_path, status, applied_at, updated_at)
-- status ENUM: received | in_progress | shortlisted | placed | rejected
audit_logs (id, user_id, action, resource, resource_id,
            ip_address, timestamp, metadata_json)
```

**004_create_reference_data.sql**
```sql
academic_levels (id, name, sort_order)
academic_institutions (id, name, country, type)  -- local | foreign
academic_programmes (id, level_id, institution_id, name, category)
academic_subscriptions (id, institution_id, programme_id)
professional_courses (id, name)
professional_institutions (id, name, country)
computer_skill_definitions (id, name)
secretariats (id, employer_id, officer_name, officer_contact)
permits (id, employer_id, vacancy_id, issued_by, issued_at, status)
key_matrices (id, name, criteria_json)
schemes_of_service (id, grade, title, qualification_requirements, career_path)
```

### Key Constraints

- `users.email` — UNIQUE, NOT NULL
- `applicants.zanid` — UNIQUE, NOT NULL
- `applications(applicant_id, vacancy_id)` — UNIQUE (one application per vacancy per applicant)
- `vacancies.closing_date` — enforced at the application layer

### sqlc Configuration (`db/sqlc.yaml`)

```yaml
version: "2"
sql:
  - engine: "postgresql"
    queries: "db/queries/"
    schema: "db/migrations/"
    gen:
      go:
        package: "repository"
        out: "internal/repository"
```

### Queries to Write (`db/queries/`)

- `users.sql` — `CreateUser`, `GetUserByEmail`, `SetActivation`, `UpdatePassword`
- `applicants.sql` — `CreateApplicant`, `GetApplicantFullProfile` (using `json_agg` for nested records), `UpdatePersonalDetails`, `GetProfileCompletion`
- `vacancies.sql` — `ListOpenVacancies`, `GetVacancyByID`, `CreateVacancy`, `UpdateVacancyStatus`
- `applications.sql` — `CreateApplication`, `ListApplicantApplications`, `UpdateApplicationStatus`
- `admin.sql` — `GetDashboardStats`, `ListApplicantsByVacancy`, `ListAuditLogs`

### Execution

```bash
./manage.sh db:init
./manage.sh db:migrate
./manage.sh sqlc:gen
```

Verify `internal/repository/` contains generated Go code with no errors.

---

## Phase 3 — Backend Core: Auth & Security

**Duration:** Week 4
**Objective:** Implement all security requirements (SEC-001 to SEC-010) and user management (FR-PUB-003, FR-PUB-004).
**Milestone:** User can register, receive activation email, activate account, log in, and receive a valid JWT.

### Configuration (`internal/config/config.go`)

- Load all env vars: `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `SMTP_*`, `UPLOAD_DIR`, `APP_URL`.
- Initialize Echo, connect to PostgreSQL via `sql.Open("postgres", cfg.DatabaseURL)`.
- Pass `*repository.Queries` to all handlers via dependency injection.

### Middleware (`internal/middleware/`)

- **`AuthMiddleware`** — Validate Bearer JWT; inject `userID` and `role` into Echo context. Reject expired or malformed tokens.
- **`RBACMiddleware`** — Check user role against the required permission for the route (SEC-004). Return `403 Forbidden` on mismatch.
- **`AuditMiddleware`** — Write all requests to `audit_logs` table (SEC-008): user, action, resource, IP, timestamp.
- **`RateLimitMiddleware`** — Apply to auth routes: lock after 5 failed login attempts for 15 minutes (SEC-008).
- **HTTPS Redirect** — Enforce TLS; reject plain HTTP (SEC-002).

### Auth Service & Handler

**Endpoints:**

```
POST  /api/auth/register          # FR-PUB-003
GET   /api/auth/activate/:token   # Email activation (SEC-003)
POST  /api/auth/login             # FR-PUB-004
POST  /api/auth/forgot-password   # SEC-010
POST  /api/auth/reset-password    # SEC-010
POST  /api/auth/change-password   # FR-APP-018 (authenticated)
POST  /api/auth/logout            # FR-APP-019
POST  /api/auth/refresh           # Refresh JWT using refresh token
```

**Auth Logic:**

- **Register:** Validate email uniqueness; hash password with bcrypt (SEC-001); generate time-limited activation token; send activation email via SMTP (FR-PUB-003).
- **Login:** Verify credentials; check `is_active`; issue JWT access token (15-min expiry) and refresh token (7-day expiry) in HTTP-only cookies (XSS protection - SEC-002); log event to audit (SEC-008).
- **Activate:** Verify token expiry; set `is_active = true`.
- **Forgot / Reset Password:** Generate time-limited reset link; send via email (SEC-010).
- **Session Timeout:** Enforce 30-minute inactivity timeout; configurable via admin settings (NFR-REL-002, FR-ADM-007).

---

## Phase 4 — Backend: Applicant Portal API

**Duration:** Weeks 5–7
**Objective:** Build the full API for the applicant profile and job application workflow (FR-APP-001 to FR-APP-019).
**Milestone:** Applicant can complete profile, reach 70% threshold, and submit an application.

### Profile Endpoints

```
GET   /api/applicants/me                       # Profile summary + completion %
GET   /api/applicants/me/completion             # Computed completion score
PUT   /api/applicants/me/personal               # FR-APP-002
PUT   /api/applicants/me/contact                # FR-APP-003
POST  /api/applicants/me/academic               # FR-APP-004 (add)
PUT   /api/applicants/me/academic/:id            # FR-APP-004 (update)
DELETE /api/applicants/me/academic/:id           # FR-APP-004 (remove)
POST  /api/applicants/me/professional            # FR-APP-005
PUT   /api/applicants/me/professional/:id
DELETE /api/applicants/me/professional/:id
POST  /api/applicants/me/language                # FR-APP-006
DELETE /api/applicants/me/language/:id
POST  /api/applicants/me/experience              # FR-APP-007
PUT   /api/applicants/me/experience/:id
DELETE /api/applicants/me/experience/:id
POST  /api/applicants/me/training                # FR-APP-008
DELETE /api/applicants/me/training/:id
PUT   /api/applicants/me/computer-skills          # FR-APP-009
POST  /api/applicants/me/referee                 # FR-APP-010
PUT   /api/applicants/me/referee/:id
DELETE /api/applicants/me/referee/:id
POST  /api/applicants/me/attachment              # FR-APP-011
DELETE /api/applicants/me/attachment/:id
POST  /api/applicants/me/declaration             # FR-APP-012
GET   /api/applicants/me/cv                      # FR-APP-013
POST  /api/applicants/me/photo                   # FR-APP-002 (photo upload)
```

### Profile Completion Engine (`internal/service/profile.go`)

Each section contributes a weighted score. The system computes the total on every profile save.

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

Minimum 70% required before any application can be submitted (FR-APP-015).

### File Upload Service (`internal/service/upload.go`)

```
Client → multipart/form-data → API
  → Validate: MIME type must be application/pdf (SEC-007)
  → Validate: size ≤ limit (certificates: 2MB | application letters: 1MB)
  → Scan: antivirus check
  → Store: /var/zanajira/uploads/{type}/{uuid}.pdf
  → DB: save file path, return reference ID
```

### Vacancy & Application Endpoints

```
GET  /api/vacancies                  # Public + authenticated (FR-PUB-001, FR-APP-014)
GET  /api/vacancies/search?q=        # Keyword search (FR-PUB-002)
GET  /api/vacancies/:id              # Full vacancy details
POST /api/applications               # Apply (FR-APP-015)
GET  /api/applications/me            # My applications + status (FR-APP-017)
PUT  /api/applications/:id/letter    # Replace letter before closing (FR-APP-016)
```

**Apply Logic:** Check profile ≥ 70%; check closing date; validate PDF ≤ 1MB; insert `applications` record; send confirmation email (FR-APP-015).

### ZanID Integration (`internal/service/zanid.go`)

```
Applicant enters ZanID (9-digit format)
  → API calls ZanID service
  → Valid: auto-populate first_name, last_name, sex, dob, nationality
  → Invalid / unavailable: return structured error
```

A `zanid_mock.go` provides hardcoded responses for development. The adapter pattern allows switching to the real API without code changes (Section 7.3).

---

## Phase 5 — Backend: Admin Portal API

**Duration:** Weeks 8–10
**Objective:** Build the full admin API (FR-ADM-001 to FR-ADM-021).
**Milestone:** Admin can manage vacancies, view applicant pipelines, and configure the system.

### Admin Endpoints

```
# Dashboard
GET  /api/admin/dashboard                       # FR-ADM-001

# User & Authorization
GET/POST       /api/admin/roles                 # FR-ADM-002
GET/PUT/DELETE /api/admin/roles/:id
GET/POST       /api/admin/permissions           # FR-ADM-003
GET/POST       /api/admin/staff                 # FR-ADM-004
GET/PUT/DELETE /api/admin/staff/:id
GET            /api/admin/applicants            # FR-ADM-005
GET            /api/admin/audit-logs            # FR-ADM-006

# Configuration
GET/PUT  /api/admin/config                      # FR-ADM-007

# Secretariat & Permits
CRUD    /api/admin/secretariats                  # FR-ADM-008
CRUD    /api/admin/permits                       # FR-ADM-009

# Key Matrices & Scheme of Service
CRUD    /api/admin/key-matrices                  # FR-ADM-010
CRUD    /api/admin/schemes-of-service            # FR-ADM-011

# Vacancies
CRUD    /api/admin/vacancies                     # FR-ADM-012–013
GET     /api/admin/vacancies/:id/applicants      # FR-ADM-014
PUT     /api/admin/applications/:id/status       # Shortlist / reject / place

# Academic Reference Data
CRUD    /api/admin/academic-levels               # FR-ADM-015
CRUD    /api/admin/academic-programmes           # FR-ADM-016
CRUD    /api/admin/academic-subscriptions        # FR-ADM-017
CRUD    /api/admin/academic-institutions         # FR-ADM-018

# Professional Reference Data
CRUD    /api/admin/computer-skills               # FR-ADM-019
CRUD    /api/admin/professional-courses          # FR-ADM-020
CRUD    /api/admin/professional-institutions     # FR-ADM-021

# ZanID
GET     /api/zanid/:id                           # ZanID lookup
```

### RBAC Implementation

```go
func RequirePermission(resource, action string) echo.MiddlewareFunc {
    return func(next echo.HandlerFunc) echo.HandlerFunc {
        return func(c echo.Context) error {
            userRole := c.Get("role").(string)
            if !hasPermission(userRole, resource, action) {
                return c.JSON(403, map[string]string{"error": "Forbidden"})
            }
            return next(c)
        }
    }
}

// Usage
e.DELETE("/api/admin/staff/:id",
    handler.DeleteStaff,
    middleware.Auth,
    middleware.RequirePermission("staff", "delete"))
```

---

## Phase 6 — Frontend: Foundation & Public Routes

**Duration:** Week 11
**Objective:** Set up the React application framework, routing, i18n, auth state, and all public-facing pages.
**Milestone:** Visitors can view vacancies, search, register, and log in.

### Setup

1. **Routing (`src/App.tsx`):** Configure `react-router-dom` with three layouts:
   - `PublicLayout` — Government branding header, footer; accessible without auth.
   - `ApplicantLayout` — Left sidebar (profile sections), top nav (Vacancies, My Applications, Change Password, Logout).
   - `AdminLayout` — Dark sidebar, breadcrumb top nav, data-heavy main area.

2. **i18n (`src/i18n/`):** Set up `react-i18next` with `en.json` and `sw.json` (Kiswahili) translation files (NFR-USE-004).

3. **Auth Store (`src/store/`):** Zustand store for user state and JWT. Axios instance with interceptor to attach Bearer token to all API requests. Automatic redirect on 401.

### Public Pages (`src/features/public/`)

- `VacancyList.tsx` — All open vacancies; post title, posts count, employer, closing date; "More Details" link (FR-PUB-001).
- `VacancySearch.tsx` — Keyword search bar filtering the vacancy list in real time (FR-PUB-002).
- `VacancyDetail.tsx` — Full details: qualifications, duties, salary scale.
- `Login.tsx` — Email + password form, "Show Password" toggle, "Lost Password?" link (FR-PUB-004).
- `Register.tsx` — Email + password + confirm; complexity validation (8+ chars, letters, symbols, numbers); post-submit activation notice (FR-PUB-003).
- `Activate.tsx` — Handles activation link click; shows success/error.
- `ForgotPassword.tsx` / `ResetPassword.tsx` — Password recovery flow.

---

## Phase 7 — Frontend: Applicant Portal

**Duration:** Weeks 12–14
**Objective:** Build the multi-section profile wizard, CV preview, and full application flow.
**Milestone:** Applicant can complete their entire profile, preview their CV, and apply for a vacancy.

### Profile Wizard (`src/features/applicant/profile/`)

All forms use `react-hook-form` + `zod` for validation.

| Component | SRS Ref | Key Behaviour |
|-----------|---------|---------------|
| `PersonalDetails.tsx` | FR-APP-002 | ZanID input → auto-populate via API; supplementary fields; passport photo upload |
| `ContactDetails.tsx` | FR-APP-003 | Address fields; birth certificate PDF upload (max 2MB) |
| `AcademicQualifications.tsx` | FR-APP-004 | Dynamic field array; level/institution/programme selectors; conditional TCU/NACTE/NECTA uploads; lost cert declaration |
| `ProfessionalQualifications.tsx` | FR-APP-005 | Multi-add; PDF upload |
| `LanguageProficiency.tsx` | FR-APP-006 | Add/remove languages; Speaking / Reading / Writing rating (Very Good / Good / Fair) |
| `WorkExperience.tsx` | FR-APP-007 | Multi-add; "Current Job" toggle hides end date |
| `TrainingWorkshops.tsx` | FR-APP-008 | Multi-add; optional cert PDF |
| `ComputerLiteracy.tsx` | FR-APP-009 | MS Word / Excel / PowerPoint skill selector with proficiency; optional cert |
| `Referees.tsx` | FR-APP-010 | Multi-add; minimum 1 required |
| `OtherAttachments.tsx` | FR-APP-011 | Type selector (Birth Cert / CV / Recommendation); PDF upload |
| `Declaration.tsx` | FR-APP-012 | Warning text; legally binding checkbox |

### Shared UI

- `ProfileProgressBar.tsx` — Persistent visual showing completion % against 70% threshold. Visible on all applicant pages (NFR-USE-003).
- `FileUploadInput.tsx` — Shared PDF upload component with client-side type + size pre-validation.

### CV Preview (`src/features/applicant/cv/`)

- `CVPreview.tsx` — Read-only, print-optimized layout populated from profile data: Personal Details, Language Proficiency, Academic Qualifications, Work Experience, Trainings, Computer Literacy.
- Print button triggers `window.print()` (FR-APP-013).

### Job Application (`src/features/applicant/jobs/`)

- `VacancyBrowse.tsx` — Authenticated vacancy listing, same data as public but with "Apply" button.
- `ApplyFlow.tsx` — Modal/page: checks 70% completion (blocks with prompt if not met); declaration acknowledgement; application letter PDF upload (max 1MB); "Confirm Application" submission (FR-APP-015).
- `ReplaceLetterModal.tsx` — Swap letter before closing date (FR-APP-016).
- `MyApplications.tsx` — Table: Employer, Job Post Title, Date Applied, Closing Date, Status badge (Received / In Progress / Shortlisted / Placed) (FR-APP-017).

---

## Phase 8 — Frontend: Admin Portal

**Duration:** Weeks 15–17
**Objective:** Build the data-heavy admin interface with dashboards, tables, and CRUD modals.
**Milestone:** Admin can manage the full recruitment lifecycle from the portal.

### Dashboard (`src/features/admin/dashboard/`)

- Stat cards: Total Applicants, New Applicants, In Progress, Placements (FR-ADM-001).
- Bar chart (Recharts): Applicant distribution across government employers.
- Toggle between "Applicants" and "Users" chart views.
- "Current Employers" list with applicant counts.

### Management Modules (`src/features/admin/management/`)

All management tables use TanStack Table with pagination, search, and sortable columns.

| Module | SRS Ref | Actions |
|--------|---------|---------|
| Vacancy Management | FR-ADM-012–014 | Create / Publish / Edit / Close; view applicant pipeline |
| Applicant Pipeline | FR-ADM-014 | Per-vacancy applicant list; Shortlist / Progress / Reject buttons |
| User & Roles | FR-ADM-002–005 | Create staff; assign roles; deactivate accounts |
| Audit Logs | FR-ADM-006 | Filterable by user, action, date range |
| Secretariat | FR-ADM-008 | CRUD; officer assignment |
| Permits | FR-ADM-009 | Issue / view / manage |
| Academic Levels | FR-ADM-015 | CRUD |
| Academic Programmes | FR-ADM-016 | CRUD |
| Academic Subscriptions | FR-ADM-017 | CRUD |
| Academic Institutions | FR-ADM-018 | CRUD |
| Computer Skills | FR-ADM-019 | CRUD |
| Professional Courses | FR-ADM-020 | CRUD |
| Professional Institutions | FR-ADM-021 | CRUD |
| Key Matrices | FR-ADM-010 | CRUD |
| Scheme of Service | FR-ADM-011 | CRUD |

### System Config (`src/features/admin/config/`)

- UI forms for system-wide parameters: file size limits, profile completion threshold, email templates, system metadata (FR-ADM-007, NFR-MNT-001).
- Changes persist via `PUT /api/admin/config` without requiring code deployments.

---

## Phase 9 — Integration, Security Hardening & Testing

**Duration:** Weeks 18–19
**Objective:** Connect all components, simulate external dependencies, enforce all security requirements, and validate the full end-to-end flow.
**Milestone:** System passes all critical user journeys end-to-end; security checklist complete.

### Security Hardening Checklist

- HTTPS enforcement in Echo middleware (SEC-002)
- bcrypt password hashing with minimum cost factor 12 (SEC-001)
- HTTP-only, Secure, SameSite cookies for JWT tokens (XSS protection)
- CSRF protection on all state-mutating endpoints
- CSP, HSTS, X-Frame-Options headers via Echo middleware
- Input validation and sanitization on all form fields (SEC-009)
- PDF-only MIME type enforcement + file size limits at upload (SEC-007)
- Rate limiting on `/api/auth/*`: lock after 5 failed attempts for 15 minutes
- 30-minute session inactivity timeout (NFR-REL-002)
- Audit logging for all auth events and admin actions (SEC-008)
- Admin portal restricted behind RBAC; not publicly browsable (SEC-005)
- Time-limited, single-use tokens for activation and password reset (SEC-003, SEC-010)

### End-to-End Test Paths

**Applicant Journey:**
1. Register → receive activation email → click activation link.
2. Log in → see dashboard with 0% profile and open vacancies.
3. Complete each profile section to reach ≥ 70%.
4. Browse vacancies → apply → upload 1MB application letter → confirm.
5. View "My Applications" → status shows "Received".
6. Admin changes status → applicant status updates to "Shortlisted".

**Admin Journey:**
1. Log in → see dashboard with stats and employer chart.
2. Create vacancy → publish → verify it appears on public portal.
3. View applicants for vacancy → shortlist one → reject another.
4. Manage academic institutions (CRUD).
5. View audit log filtered by own user.

**Validation Cases:**
- Application blocked when profile < 70%.
- Application blocked after vacancy closing date.
- File upload rejected when not PDF or over size limit.
- Login locked after 5 failed attempts.
- Activation link rejected after expiry.
- ZanID lookup fails gracefully; applicant sees clear error.

---

## Phase 10 — Deployment & Operations

**Duration:** Week 19 (overlaps with testing)
**Objective:** Production-ready deployment on government infrastructure.

### First Deployment Steps

```bash
./manage.sh start          # Start PostgreSQL, Redis, Nginx
./manage.sh db:migrate      # Apply all migrations
./manage.sh db:seed         # Load reference data (academic levels, institutions, etc.)
./manage.sh create-admin    # Create initial admin account interactively
```

### Infrastructure

- **Hosting:** Government data center, maintained by eGaz.
- **TLS:** Certificate on Nginx reverse proxy (SEC-002).
- **Process Manager:** PM2 for Go API process management (auto-restart, log rotation).
- **Backups:** `./manage.sh db:backup` on daily cron; retained per government records policy.
- **Monitoring:** `/health` endpoint; PM2 status; Nginx access/error log monitoring.
- **Audit Logs:** Retained minimum 5 years (SRS Section 8.2).

### Performance Targets (from SRS NFRs)

| Metric | Target |
|--------|--------|
| Homepage + vacancy listing load | ≤ 3 seconds |
| File upload confirmation | ≤ 10 seconds |
| Admin dashboard load | ≤ 5 seconds |
| Concurrent users | ≥ 1,000 without degradation |
| System uptime | ≥ 99.5% |

---

## Timeline Summary

| Phase | Weeks | Deliverable |
|-------|-------|-------------|
| 1 — Scaffolding & manage.sh | 1–2 | Repo, both apps running, manage.sh functional |
| 2 — Database & sqlc | 3 | Migrations applied; type-safe Go data layer |
| 3 — Auth & Security | 4 | Register, activate, login, JWT, middleware |
| 4 — Applicant Backend API | 5–7 | Full profile API, file uploads, vacancy/apply |
| 5 — Admin Backend API | 8–10 | Dashboard, management, vacancy pipeline |
| 6 — Frontend Foundation | 11 | Routing, i18n, public pages, auth store |
| 7 — Applicant Frontend | 12–14 | Profile wizard, CV preview, apply flow |
| 8 — Admin Frontend | 15–17 | Dashboard, data tables, CRUD modals |
| 9 — Integration & Hardening | 18–19 | E2E tests, security checklist, ZanID mock |
| 10 — Deployment | 19 | Production launch on government infrastructure |
| **Total** | **~19 weeks** | |

---

## Requirement Traceability Matrix

| SRS Ref | Phase | Implementation |
|---------|-------|----------------|
| FR-PUB-001 | 6 | Public vacancy listing |
| FR-PUB-002 | 6 | Vacancy keyword search |
| FR-PUB-003 | 3 | Registration + email activation |
| FR-PUB-004 | 3 | Login + JWT + password recovery |
| FR-APP-001 | 6 | Applicant dashboard |
| FR-APP-002 | 4, 7 | Personal details + ZanID auto-populate |
| FR-APP-003 | 4, 7 | Contact details |
| FR-APP-004 | 4, 7 | Academic qualifications + uploads |
| FR-APP-005 | 4, 7 | Professional qualifications |
| FR-APP-006 | 4, 7 | Language proficiency |
| FR-APP-007 | 4, 7 | Work experience |
| FR-APP-008 | 4, 7 | Training and workshops |
| FR-APP-009 | 4, 7 | Computer literacy |
| FR-APP-010 | 4, 7 | Referees |
| FR-APP-011 | 4, 7 | Other attachments |
| FR-APP-012 | 4, 7 | Declaration |
| FR-APP-013 | 4, 7 | CV preview + print |
| FR-APP-014 | 4, 7 | Authenticated vacancy browsing |
| FR-APP-015 | 4, 7 | Apply for vacancy (70% gate) |
| FR-APP-016 | 4, 7 | Replace application letter |
| FR-APP-017 | 4, 7 | My Applications + status |
| FR-APP-018 | 3 | Change password |
| FR-APP-019 | 3 | Logout / session termination |
| FR-ADM-001 | 5, 8 | Admin dashboard + charts |
| FR-ADM-002 | 5, 8 | Roles management |
| FR-ADM-003 | 5, 8 | Permissions management |
| FR-ADM-004 | 5, 8 | Staff management |
| FR-ADM-005 | 5, 8 | Applicant account management |
| FR-ADM-006 | 5, 8 | Audit logs viewer |
| FR-ADM-007 | 5, 8 | System configuration |
| FR-ADM-008 | 5, 8 | Secretariat management |
| FR-ADM-009 | 5, 8 | Permit management |
| FR-ADM-010 | 5, 8 | Key matrices |
| FR-ADM-011 | 5, 8 | Scheme of service |
| FR-ADM-012 | 5, 8 | Create job advert |
| FR-ADM-013 | 5, 8 | Publish / manage adverts |
| FR-ADM-014 | 5, 8 | View applicants per vacancy + pipeline |
| FR-ADM-015 | 5, 8 | Academic levels |
| FR-ADM-016 | 5, 8 | Academic programmes |
| FR-ADM-017 | 5, 8 | Academic subscriptions |
| FR-ADM-018 | 5, 8 | Academic institutions |
| FR-ADM-019 | 5, 8 | Computer skills |
| FR-ADM-020 | 5, 8 | Professional courses |
| FR-ADM-021 | 5, 8 | Professional institutions |
| SEC-001 | 3 | bcrypt password hashing |
| SEC-002 | 3, 9 | HTTPS / TLS enforcement |
| SEC-003 | 3 | Email activation token |
| SEC-004 | 3, 5 | RBAC middleware |
| SEC-005 | 3, 5 | Admin portal access restriction |
| SEC-006 | 3 | Session inactivity timeout |
| SEC-007 | 4 | PDF-only + size validation |
| SEC-008 | 3 | Audit log for auth events |
| SEC-009 | 3, 4, 5 | Input sanitization |
| SEC-010 | 3 | Time-limited password reset |
| NFR-PERF-004 | 9 | 1,000 concurrent user load test |
| NFR-USE-004 | 6 | English + Kiswahili i18n |
| NFR-REL-002 | 3 | 30-min session timeout |
| NFR-MNT-001 | 5, 8 | Admin-configurable system params |

---

## Risk Register

| Risk | Impact | Mitigation |
|------|--------|------------|
| ZanID API unavailable | Applicants cannot complete profiles | Mock adapter for dev/staging; admin manual activation fallback |
| Email delivery failure | Users cannot activate accounts | SMTP retry queue; admin can manually activate accounts |
| High traffic during vacancy openings | Slow responses, timeouts | Pagination on all listings; caching for dashboard stats |
| PDF malware upload | Security breach | Server-side MIME + size validation; antivirus scan before storage |
| 50K+ user scale | DB performance degradation | Index on `email`, `zanid`, `vacancy_id`; connection pooling; pagination |
| Browser storage restrictions | State lost on refresh | JWT in HTTP-only cookies; Zustand state re-hydrated from API on load |

---

*Document End — ZanAjira Unified Execution Plan v1.0*
*Civil Service Commission, Revolutionary Government of Zanzibar*
