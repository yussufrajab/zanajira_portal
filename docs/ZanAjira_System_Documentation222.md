# ZanAjira Portal — System Documentation

**Mfumo wa Maombi ya Kazi za Serikali**
**Government Job Application Portal**

| Field | Details |
|---|---|
| System Name | ZanAjira Portal |
| Version | 1.0.0 |
| Client | Civil Service Commission (Tume ya Utumishi wa Umma) |
| Government | Revolutionary Government of Zanzibar (Serikali ya Mapinduzi ya Zanzibar) |
| Developer | eGaz / OR-KSUUB |
| Public URL | https://portal.zanajira.go.tz |
| Date | May 2026 |
| Status | Active — Development / Staging |

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Technologies Used](#2-technologies-used)
3. [Project Structure](#3-project-structure)
4. [Database Configuration](#4-database-configuration)
5. [Database Schema Overview](#5-database-schema-overview)
6. [Environment Variables](#6-environment-variables)
7. [User Roles & Credentials](#7-user-roles--credentials)
8. [Login Methods](#8-login-methods)
9. [Role Permissions Matrix](#9-role-permissions-matrix)
10. [Management Scripts — manage.sh](#10-management-scripts--managesh)
11. [Running the Application](#11-running-the-application)
12. [API Endpoints Reference](#12-api-endpoints-reference)
13. [Seeded Data Summary](#13-seeded-data-summary)

---

## 1. System Overview

ZanAjira is a web-based civil service recruitment portal serving two distinct user groups:

- **Applicants (Job Seekers):** Register, build structured multi-section profiles, browse government vacancies, and submit applications online.
- **Administrators / HR Staff:** Manage the full recruitment lifecycle — from vacancy creation and publication through applicant shortlisting and placement.

The system replaces manual, paper-based recruitment processes within Zanzibar's public sector and integrates with the national ZanID identity system for applicant verification.

### Key Features

| Feature | Description |
|---|---|
| ZanID Integration | Auto-populate applicant personal details from Zanzibar's national identity system |
| Profile Completion Engine | Weighted scoring system; minimum 70% required to apply |
| File Upload Pipeline | PDF-only validation with size enforcement (2MB certs / 1MB letters) |
| Bilingual Interface | English (Kiingereza) and Kiswahili support |
| JWT Authentication | HTTP-only cookie-based tokens with 15-min access / 7-day refresh |
| RBAC | Role-based access control across all admin endpoints |
| Audit Logging | All significant actions logged with user, IP, timestamp |
| Email Notifications | Account activation, password reset, application confirmation, status updates |

---

## 2. Technologies Used

### 2.1 Backend

| Technology | Version | Purpose |
|---|---|---|
| **Go** | 1.25.0 | Backend language |
| **Echo** | v4.15.2 | HTTP web framework |
| **PostgreSQL** | 16 | Primary relational database |
| **Redis** | 7.x | Session caching, rate limiting |
| **golang-jwt/jwt** | v5.3.1 | JWT token generation and validation |
| **golang.org/x/crypto** | v0.51.0 | bcrypt password hashing (cost factor 12) |
| **lib/pq** | v1.12.3 | PostgreSQL driver for Go |
| **google/uuid** | v1.6.0 | UUID generation for primary keys |
| **joho/godotenv** | v1.5.1 | `.env` file loading |
| **gopkg.in/gomail.v2** | v2.0.0 | SMTP email sending |
| **golang-migrate** | v4.19.1 | Database migration management |
| **sqlc** | v2 | Type-safe SQL code generation |

### 2.2 Frontend

| Technology | Version | Purpose |
|---|---|---|
| **React** | 19.2.5 | UI framework |
| **TypeScript** | 6.0.2 | Type-safe JavaScript |
| **Vite** | 8.0.10 | Build tool and dev server |
| **TailwindCSS** | 3.4.1 | Utility-first CSS framework |
| **React Router DOM** | v7.15.0 | Client-side routing |
| **Zustand** | 5.0.13 | Global state management (auth store) |
| **Axios** | 1.16.0 | HTTP client with interceptors |
| **React Hook Form** | 7.75.0 | Form state management |
| **Zod** | 4.4.3 | Schema validation |
| **@hookform/resolvers** | 5.2.2 | Zod integration with React Hook Form |
| **Recharts** | 3.8.1 | Charts for admin dashboard |
| **@tanstack/react-table** | 8.21.3 | Data tables for admin portal |
| **react-i18next** | 17.0.7 | Internationalisation (EN + SW) |
| **i18next** | 26.0.10 | i18n core library |

### 2.3 Infrastructure

| Component | Technology | Details |
|---|---|---|
| Reverse Proxy | **Nginx** | TLS termination, rate limiting, static file serving |
| Process Manager | **PM2** | Go API process management, auto-restart, log rotation |
| Email Testing | **Mailpit** | Local SMTP server for development (port 1025 / UI 8025) |
| Service Management | **Bash (manage.sh)** | Start/stop/restart all services |
| OS | **Linux (Ubuntu/Debian)** | Government data center hosted by eGaz |

---

## 3. Project Structure

```
zanajira/                              ← Project root
├── .env                               ← Environment variables (not committed)
├── .env.example                       ← Environment variable template
├── .gitignore
├── manage.sh                          ← Service management script (chmod +x)
│
├── zanajira-server/                   ← Go + Echo backend
│   ├── bin/
│   │   └── server                     ← Compiled binary
│   ├── cmd/
│   │   ├── server/
│   │   │   └── main.go                ← API server entry point
│   │   └── create-admin/
│   │       └── main.go                ← Interactive admin user creation CLI
│   ├── db/
│   │   ├── migrations/                ← golang-migrate SQL files
│   │   │   ├── 001_create_users.up.sql
│   │   │   ├── 001_create_users.down.sql
│   │   │   ├── 002_create_applicant_profile.up.sql
│   │   │   ├── 002_create_applicant_profile.down.sql
│   │   │   ├── 003_create_recruitment.up.sql
│   │   │   ├── 003_create_recruitment.down.sql
│   │   │   ├── 004_create_reference_data.up.sql
│   │   │   └── 004_create_reference_data.down.sql
│   │   ├── queries/                   ← sqlc SQL query files
│   │   │   ├── users.sql
│   │   │   ├── applicants.sql
│   │   │   ├── vacancies.sql
│   │   │   ├── applications.sql
│   │   │   └── admin.sql
│   │   └── sqlc.yaml                  ← sqlc code generation config
│   ├── internal/
│   │   ├── config/
│   │   │   └── config.go              ← Environment config loader
│   │   ├── handler/
│   │   │   ├── auth.go                ← Auth endpoints (register, login, etc.)
│   │   │   ├── applicant.go           ← Applicant profile endpoints
│   │   │   ├── vacancy.go             ← Vacancy & application endpoints
│   │   │   ├── admin.go               ← Admin portal endpoints
│   │   │   └── helpers.go             ← Shared handler utilities
│   │   ├── middleware/
│   │   │   ├── auth.go                ← JWT validation middleware
│   │   │   └── audit.go               ← Audit logging middleware
│   │   ├── repository/                ← sqlc-generated Go DB code (auto-generated)
│   │   └── service/
│   │       ├── auth.go                ← bcrypt, JWT, token generation
│   │       ├── email.go               ← SMTP email service
│   │       ├── profile.go             ← Profile completion engine
│   │       ├── upload.go              ← File upload validation & storage
│   │       └── zanid.go               ← ZanID integration (mock + real adapter)
│   └── go.mod
│
├── zanajira-web/                      ← React + TypeScript frontend
│   ├── src/
│   │   ├── App.tsx                    ← Root component + route definitions
│   │   ├── main.tsx                   ← React DOM entry point
│   │   ├── index.css                  ← Tailwind base styles
│   │   ├── lib/
│   │   │   └── api.ts                 ← Axios instance + JWT interceptors
│   │   ├── store/
│   │   │   └── authStore.ts           ← Zustand auth state (persisted)
│   │   ├── i18n/
│   │   │   ├── en.json                ← English translations
│   │   │   ├── sw.json                ← Kiswahili translations
│   │   │   └── index.ts               ← i18next initialisation
│   │   ├── components/
│   │   │   ├── ProfileProgressBar.tsx ← Completion % indicator
│   │   │   ├── FileUploadInput.tsx    ← PDF upload with client-side validation
│   │   │   └── StatusBadge.tsx        ← Coloured application status badge
│   │   ├── layouts/
│   │   │   ├── PublicLayout.tsx       ← Government header + footer
│   │   │   ├── ApplicantLayout.tsx    ← Sidebar + progress bar layout
│   │   │   └── AdminLayout.tsx        ← Dark sidebar admin layout
│   │   └── features/
│   │       ├── public/                ← Unauthenticated pages
│   │       │   ├── VacancyList.tsx
│   │       │   ├── VacancyDetail.tsx
│   │       │   ├── Login.tsx
│   │       │   ├── Register.tsx
│   │       │   ├── Activate.tsx
│   │       │   ├── ForgotPassword.tsx
│   │       │   └── ResetPassword.tsx
│   │       ├── applicant/             ← Authenticated applicant pages
│   │       │   ├── profile/
│   │       │   │   ├── PersonalDetails.tsx
│   │       │   │   └── Declaration.tsx
│   │       │   ├── jobs/
│   │       │   │   ├── ApplyFlow.tsx
│   │       │   │   └── MyApplications.tsx
│   │       │   └── cv/
│   │       │       └── CVPreview.tsx
│   │       └── admin/                 ← Admin portal pages
│   │           ├── dashboard/
│   │           │   └── AdminDashboard.tsx
│   │           ├── management/
│   │           │   ├── VacancyManagement.tsx
│   │           │   ├── VacancyApplicants.tsx
│   │           │   ├── GenericCRUD.tsx
│   │           │   └── AuditLogs.tsx
│   │           └── config/
│   │               └── SystemConfig.tsx
│   ├── tailwind.config.js
│   ├── vite.config.ts
│   └── package.json
│
├── nginx/
│   └── zanajira.conf                  ← Nginx reverse proxy config
│
├── seeds/
│   ├── 001_reference_data.sql         ← Initial reference data
│   └── 002_zanzibar_full_data.sql     ← Full Zanzibar demo data (30 applicants, etc.)
│
├── docs/                              ← Project documentation
│   ├── ZanAjira_SRS.md
│   ├── ZanAjira_Implementation_Plan.md
│   ├── ZanAjira_Unified_Execution_Plan.md
│   └── ZanAjira_System_Documentation.md  ← This file
│
├── logs/
│   ├── api.log                        ← Go API server logs
│   └── frontend.log                   ← Vite dev server logs
│
└── backups/                           ← PostgreSQL dump files
```

---

## 4. Database Configuration

### 4.1 Database Details

| Parameter | Value |
|---|---|
| **Engine** | PostgreSQL 16 |
| **Database Name** | `zanajira` |
| **Host** | `127.0.0.1` |
| **Port** | `5432` |
| **Username** | `zanajira` |
| **Password** | `zanajira_pass` |
| **SSL Mode** | `disable` (development) / `require` (production) |
| **Connection String** | `postgres://zanajira:zanajira_pass@127.0.0.1:5432/zanajira?sslmode=disable` |
| **Current Size** | ~9.8 MB |
| **Total Tables** | 31 |

### 4.2 Connecting to the Database

```bash
# Using psql directly
PGPASSWORD=zanajira_pass psql -h 127.0.0.1 -U zanajira -d zanajira

# Using the connection string
psql "postgres://zanajira:zanajira_pass@127.0.0.1:5432/zanajira?sslmode=disable"
```

### 4.3 Migration Management

Migrations are managed with `golang-migrate` and stored in `zanajira-server/db/migrations/`.

```bash
# Apply all pending migrations
./manage.sh db:migrate

# Roll back the last migration
./manage.sh db:rollback

# Run seed data
./manage.sh db:seed
```

| Migration File | Tables Created |
|---|---|
| `001_create_users` | `users`, `roles`, `permissions`, `role_permissions` |
| `002_create_applicant_profile` | `applicants`, `contact_details`, `academic_qualifications`, `professional_qualifications`, `language_proficiencies`, `work_experiences`, `trainings`, `computer_skills`, `referees`, `other_attachments` |
| `003_create_recruitment` | `employers`, `vacancies`, `applications`, `audit_logs` |
| `004_create_reference_data` | `academic_levels`, `academic_institutions`, `academic_programmes`, `academic_subscriptions`, `professional_courses`, `professional_institutions`, `computer_skill_definitions`, `secretariats`, `permits`, `key_matrices`, `schemes_of_service`, `system_config` |

---

## 5. Database Schema Overview

### 5.1 Authentication & Users

```
users
  id UUID PK | email UNIQUE | password_hash | role | is_active
  activation_token | activation_expires | reset_token | reset_expires
  created_at | updated_at

roles
  id SERIAL PK | name UNIQUE | description

permissions
  id SERIAL PK | name UNIQUE | resource | action

role_permissions
  role_id FK → roles | permission_id FK → permissions
```

### 5.2 Applicant Profile

```
applicants
  id UUID PK | user_id FK → users (UNIQUE)
  zanid UNIQUE | first_name | last_name | sex | date_of_birth
  nationality | originality | govt_employment_status | marital_status | impairment
  photo_path | profile_completion_pct | declaration_accepted | declaration_at

contact_details
  id UUID PK | applicant_id FK (UNIQUE) | country | state_city | province_county
  mobile_number | alt_email | present_address | birth_cert_path

academic_qualifications
  id UUID PK | applicant_id FK | education_level | country
  institution_id | programme_id | programme_category | year_from | year_to
  gpa_result | cert_path | tcu_cert_path | nacte_cert_path | necta_cert_path
  lost_cert_index | lost_cert_year

professional_qualifications
  id UUID PK | applicant_id FK | country | institution | course_name
  start_date | end_date | cert_path

language_proficiencies
  id UUID PK | applicant_id FK | language
  speaking | reading | writing  ← ENUM: 'Very Good' | 'Good' | 'Fair'

work_experiences
  id UUID PK | applicant_id FK | organization | job_title
  supervisor_name | supervisor_address | supervisor_mobile | duties
  start_date | end_date | is_current

trainings
  id UUID PK | applicant_id FK | name | institution | description
  start_date | end_date | cert_path

computer_skills
  id UUID PK | applicant_id FK | skill | proficiency | cert_path
  UNIQUE (applicant_id, skill)

referees
  id UUID PK | applicant_id FK | title | full_name | organization
  email | mobile | postal_address

other_attachments
  id UUID PK | applicant_id FK
  type  ← ENUM: 'birth_cert' | 'cv' | 'recommendation' | 'other'
  file_path
```

### 5.3 Recruitment

```
employers
  id SERIAL PK | name UNIQUE | contact_email | contact_phone | address

vacancies
  id UUID PK | employer_id FK | post_title | num_posts | location
  qualifications | duties | salary_scale | closing_date
  status  ← ENUM: 'draft' | 'published' | 'closed'
  created_by FK → users

applications
  id UUID PK | applicant_id FK | vacancy_id FK
  application_letter_path | applied_at | updated_at
  status  ← ENUM: 'received' | 'in_progress' | 'shortlisted' | 'placed' | 'rejected'
  UNIQUE (applicant_id, vacancy_id)

audit_logs
  id UUID PK | user_id FK | action | resource | resource_id
  ip_address | timestamp | metadata_json
```

### 5.4 Reference Data

```
academic_levels        id | name | sort_order
academic_institutions  id | name | country | type ('local'|'foreign')
academic_programmes    id | level_id | institution_id | name | category
academic_subscriptions id | institution_id | programme_id  UNIQUE
professional_courses   id | name
professional_institutions id | name | country
computer_skill_definitions id | name
secretariats           id | employer_id | officer_name | officer_contact
permits                id | employer_id | vacancy_id | issued_by | issued_at | status
key_matrices           id | name | criteria_json
schemes_of_service     id | grade | title | qualification_requirements | career_path
system_config          key PK | value | updated_at
```

### 5.5 Profile Completion Weights

| Section | Weight | Minimum Requirement |
|---|---|---|
| Personal Details (ZanID + photo) | 20% | ZanID filled |
| Contact Details | 10% | Any contact record |
| Academic Qualifications | 20% | At least 1 entry |
| Professional Qualifications | 5% | At least 1 entry |
| Language Proficiency | 10% | At least 1 language |
| Work Experience | 10% | At least 1 entry |
| Referees | 10% | At least 1 referee |
| Declaration | 10% | Checkbox accepted |
| Training + Computer Skills + Attachments | 5% (bonus) | Any of the three |
| **Minimum to Apply** | **70%** | |

---

## 6. Environment Variables

All environment variables are stored in `.env` at the project root. Copy `.env.example` to `.env` and fill in values before starting.

```env
# ── Database ──────────────────────────────────────────────────────────────────
DATABASE_URL=postgres://zanajira:zanajira_pass@127.0.0.1:5432/zanajira?sslmode=disable

# ── Redis ─────────────────────────────────────────────────────────────────────
REDIS_URL=redis://localhost:6379

# ── JWT Secrets (change in production — minimum 32 characters) ────────────────
JWT_SECRET=zanajira-jwt-secret-key-32chars-min!
JWT_REFRESH_SECRET=zanajira-refresh-secret-key-32chars!

# ── ZanID National Identity Integration ──────────────────────────────────────
ZANID_API_URL=https://zanid.go.tz/api
ZANID_API_KEY=your-zanid-api-key
ZANID_MOCK=true          # true = use mock adapter (development), false = real API

# ── SMTP Email ────────────────────────────────────────────────────────────────
SMTP_HOST=localhost       # Use Mailpit for dev: localhost
SMTP_PORT=1025            # Mailpit port; production: 587 or 465
SMTP_USER=                # Leave empty for Mailpit
SMTP_PASS=                # Leave empty for Mailpit
SMTP_FROM=noreply@zanajira.go.tz

# ── Application ───────────────────────────────────────────────────────────────
UPLOAD_DIR=/tmp/zanajira/uploads   # Directory for uploaded PDF files
APP_URL=http://localhost:5173      # Public-facing URL (used in email links)
PORT=8080                          # Go API server port
ENV=development                    # development | production
```

| Variable | Required | Default | Description |
|---|---|---|---|
| `DATABASE_URL` | ✅ Yes | — | PostgreSQL connection string |
| `REDIS_URL` | No | `redis://localhost:6379` | Redis connection string |
| `JWT_SECRET` | ✅ Yes | — | Access token signing key (≥32 chars) |
| `JWT_REFRESH_SECRET` | ✅ Yes | — | Refresh token signing key (≥32 chars) |
| `ZANID_API_URL` | No | `https://zanid.go.tz/api` | ZanID service endpoint |
| `ZANID_API_KEY` | No | — | ZanID authentication key |
| `ZANID_MOCK` | No | `true` | Use mock ZanID adapter |
| `SMTP_HOST` | No | `localhost` | SMTP server hostname |
| `SMTP_PORT` | No | `1025` | SMTP server port |
| `SMTP_USER` | No | — | SMTP username |
| `SMTP_PASS` | No | — | SMTP password |
| `SMTP_FROM` | No | `noreply@zanajira.go.tz` | Sender email address |
| `UPLOAD_DIR` | No | `/var/zanajira/uploads` | File upload directory |
| `APP_URL` | No | `http://localhost:5173` | Public URL for email links |
| `PORT` | No | `8080` | API server port |
| `ENV` | No | `development` | Runtime environment |

---

## 7. User Roles & Credentials

### 7.1 Role Definitions

| Role | Portal Access | Description |
|---|---|---|
| `admin` | Admin Portal | Full system access — all management functions |
| `staff` | Admin Portal | HR officer — limited admin access based on permissions |
| `employer` | Admin Portal | Government institution — vacancy and applicant data for their org |
| `applicant` | Applicant Portal | Job seeker — profile management and job applications |

### 7.2 Seeded User Credentials

> **All passwords use the same hash** (`Admin@1234` for admin/staff, `Admin@1234` for applicants in this seed).

#### Administrator

| Email | Password | Role | Status |
|---|---|---|---|
| admin@zanajira.go.tz | Admin@1234 | admin | Active |

#### Staff (HR Officers)

| Email | Password | Role | Status |
|---|---|---|---|
| `fatuma.hamad@csc.go.tz` | `Admin@1234` | staff | Active |
| `salim.juma@csc.go.tz` | `Admin@1234` | staff | Active |
| `maryam.suleiman@csc.go.tz` | `Admin@1234` | staff | Active |

#### Employer Users

| Email | Password | Role | Status |
|---|---|---|---|
| `omar.rashid@csc.go.tz` | `Admin@1234` | employer | Active |
| `zuwena.khalid@zrb.go.tz` | `Admin@1234` | employer | Active |

#### Sample Applicants (30 Zanzibar applicants)

| Email | Password | Full Name | ZanID | Profile % |
|---|---|---|---|---|
| `ali.juma.bakar@gmail.com` | `Admin@1234` | Ali Juma Bakar | 100234567 | 95% |
| `fatuma.said.kombo@gmail.com` | `Admin@1234` | Fatuma Said Kombo | 100234568 | 95% |
| `hassan.omar.mwinyi@gmail.com` | `Admin@1234` | Hassan Omar Mwinyi | 100234569 | 95% |
| `zuwena.khalid.nassor@gmail.com` | `Admin@1234` | Zuwena Khalid Nassor | 100234570 | 95% |
| `salim.hamad.vuai@gmail.com` | `Admin@1234` | Salim Hamad Vuai | 100234571 | 95% |
| `maryam.juma.haji@gmail.com` | `Admin@1234` | Maryam Juma Haji | 100234572 | 95% |
| `omar.suleiman.rashid@gmail.com` | `Admin@1234` | Omar Suleiman Rashid | 100234573 | 95% |
| `amina.hassan.abdalla@gmail.com` | `Admin@1234` | Amina Hassan Abdalla | 100234574 | 95% |
| `juma.ali.khamis@gmail.com` | `Admin@1234` | Juma Ali Khamis | 100234575 | 95% |
| `rukia.salim.bakar@gmail.com` | `Admin@1234` | Rukia Salim Bakar | 100234576 | 95% |
| `khalid.omar.mzee@gmail.com` | `Admin@1234` | Khalid Omar Mzee | 100234577 | 95% |
| `safia.juma.hamad@gmail.com` | `Admin@1234` | Safia Juma Hamad | 100234578 | 95% |
| `abdalla.hassan.kombo@gmail.com` | `Admin@1234` | Abdalla Hassan Kombo | 100234579 | 95% |
| `nasra.ali.suleiman@gmail.com` | `Admin@1234` | Nasra Ali Suleiman | 100234580 | 95% |
| `hamad.juma.rashid@gmail.com` | `Admin@1234` | Hamad Juma Rashid | 100234581 | 95% |
| `khadija.omar.bakar@gmail.com` | `Admin@1234` | Khadija Omar Bakar | 100234582 | 95% |
| `suleiman.ali.haji@gmail.com` | `Admin@1234` | Suleiman Ali Haji | 100234583 | 95% |
| `mwana.hamad.vuai@gmail.com` | `Admin@1234` | Mwana Hamad Vuai | 100234584 | 95% |
| `rashid.juma.nassor@gmail.com` | `Admin@1234` | Rashid Juma Nassor | 100234585 | 95% |
| `zainab.hassan.mwinyi@gmail.com` | `Admin@1234` | Zainab Hassan Mwinyi | 100234586 | 95% |
| `bakar.suleiman.kombo@gmail.com` | `Admin@1234` | Bakar Suleiman Kombo | 100234587 | 95% |
| `halima.ali.juma@gmail.com` | `Admin@1234` | Halima Ali Juma | 100234588 | 95% |
| `nassor.omar.rashid@gmail.com` | `Admin@1234` | Nassor Omar Rashid | 100234589 | 95% |
| `mwajuma.hamad.bakar@gmail.com` | `Admin@1234` | Mwajuma Hamad Bakar | 100234590 | 95% |
| `said.juma.haji@gmail.com` | `Admin@1234` | Said Juma Haji | 100234591 | 95% |
| `farida.khalid.suleiman@gmail.com` | `Admin@1234` | Farida Khalid Suleiman | 100234592 | 95% |
| `kombo.ali.nassor@gmail.com` | `Admin@1234` | Kombo Ali Nassor | 100234593 | 95% |
| `tatu.juma.mzee@gmail.com` | `Admin@1234` | Tatu Juma Mzee | 100234594 | 95% |
| `vuai.hassan.omar@gmail.com` | `Admin@1234` | Vuai Hassan Omar | 100234595 | 95% |
| `sharifa.salim.abdalla@gmail.com` | `Admin@1234` | Sharifa Salim Abdalla | 100234596 | 95% |

---

## 8. Login Methods

### 8.1 Applicant Portal Login

**URL:** `http://localhost:5173/login`

1. Navigate to the portal homepage at `http://localhost:5173`
2. Click **"Sign In"** in the top navigation bar
3. Enter your registered **email address** and **password**
4. Click **"Sign In"** button
5. On success, you are redirected to the applicant dashboard

**Password Requirements:**
- Minimum 8 characters
- Must contain letters (a–z / A–Z)
- Must contain numbers (0–9)
- Must contain at least one symbol (e.g. `@`, `!`, `#`)

**Account Activation:**
- After registration, a verification email is sent to the provided address
- Click the activation link in the email before attempting to log in
- Activation links expire after **24 hours**

**Password Recovery:**
1. Click **"Lost Password?"** on the login page
2. Enter your registered email address
3. Click the reset link sent to your email (expires in **2 hours**)
4. Set a new password

### 8.2 Admin Portal Login

**URL:** `http://localhost:5173/admin`

1. Navigate to `http://localhost:5173/admin`
2. You will be redirected to the login page if not authenticated
3. Enter admin/staff credentials
4. On success, you are redirected to the admin dashboard

> **Note:** Admin portal access is restricted to users with `admin`, `staff`, or `employer` roles. Applicant accounts cannot access the admin portal.

### 8.3 API Authentication (JWT)

The API uses **JWT Bearer tokens** stored in **HTTP-only cookies** for XSS protection.

```bash
# Login via API
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@zanajira.go.tz","password":"Admin@1234"}'

# Response includes access_token
# {
#   "access_token": "eyJhbGci...",
#   "email": "admin@zanajira.go.tz",
#   "role": "admin",
#   "user_id": "06ff216d-..."
# }

# Use token in subsequent requests
curl http://localhost:8080/api/admin/dashboard \
  -H "Authorization: Bearer eyJhbGci..."
```

**Token Lifetimes:**
| Token | Lifetime | Storage |
|---|---|---|
| Access Token | 15 minutes | HTTP-only cookie + response body |
| Refresh Token | 7 days | HTTP-only cookie (`/api/auth/refresh` path only) |

---

## 9. Role Permissions Matrix

### 9.1 Applicant Portal Permissions

| Action | Anonymous | Applicant |
|---|---|---|
| View public vacancies | ✅ | ✅ |
| Search vacancies | ✅ | ✅ |
| View vacancy details | ✅ | ✅ |
| Register account | ✅ | — |
| Login / Logout | ✅ | ✅ |
| View/edit own profile | ❌ | ✅ |
| Upload documents (PDF) | ❌ | ✅ |
| ZanID lookup | ❌ | ✅ |
| Apply for vacancy (≥70% profile) | ❌ | ✅ |
| Replace application letter | ❌ | ✅ |
| View own applications + status | ❌ | ✅ |
| Preview / print CV | ❌ | ✅ |
| Change password | ❌ | ✅ |

### 9.2 Admin Portal Permissions

| Resource / Action | admin | staff | employer |
|---|---|---|---|
| **Dashboard** — view stats & charts | ✅ | ✅ | ✅ |
| **Vacancies** — create / edit / delete | ✅ | ✅ | ✅ (own) |
| **Vacancies** — publish / close | ✅ | ✅ | ✅ (own) |
| **Applications** — view per vacancy | ✅ | ✅ | ✅ (own) |
| **Applications** — shortlist / reject / place | ✅ | ✅ | ❌ |
| **Applicants** — list & search | ✅ | ✅ | ❌ |
| **Staff** — create / edit / deactivate | ✅ | ❌ | ❌ |
| **Roles & Permissions** — manage | ✅ | ❌ | ❌ |
| **Employers** — CRUD | ✅ | ✅ | ❌ |
| **Secretariats** — CRUD | ✅ | ✅ | ❌ |
| **Permits** — issue / manage | ✅ | ✅ | ❌ |
| **Academic Levels** — CRUD | ✅ | ✅ | ❌ |
| **Academic Institutions** — CRUD | ✅ | ✅ | ❌ |
| **Academic Programmes** — CRUD | ✅ | ✅ | ❌ |
| **Academic Subscriptions** — CRUD | ✅ | ✅ | ❌ |
| **Computer Skills** — CRUD | ✅ | ✅ | ❌ |
| **Professional Courses** — CRUD | ✅ | ✅ | ❌ |
| **Professional Institutions** — CRUD | ✅ | ✅ | ❌ |
| **Key Matrices** — CRUD | ✅ | ✅ | ❌ |
| **Schemes of Service** — CRUD | ✅ | ✅ | ❌ |
| **Audit Logs** — view | ✅ | ✅ | ❌ |
| **System Config** — read | ✅ | ✅ | ❌ |
| **System Config** — write | ✅ | ❌ | ❌ |

---

## 10. Management Scripts — manage.sh

The `manage.sh` script is located at the **project root** (`/home/yusuf/zanajira/manage.sh`) and manages all ZanAjira services.

```bash
# Make executable (first time only)
chmod +x manage.sh

# Show all available commands
./manage.sh help
```

### 10.1 Service Commands

```bash
./manage.sh start              # Start all services: PostgreSQL, Redis, Nginx, API
./manage.sh stop               # Stop all services
./manage.sh restart            # Restart all services
./manage.sh status             # Show running status of all services
./manage.sh logs [service]     # Tail logs — service: api | postgres | redis | nginx | all
./manage.sh health             # Health check all services with output
```

### 10.2 Database Commands

```bash
./manage.sh db:init            # Create PostgreSQL database and user (first-time setup)
./manage.sh db:migrate         # Apply all pending migrations (up)
./manage.sh db:rollback        # Roll back the last migration (down 1)
./manage.sh db:seed            # Run all seed scripts in seeds/ directory
./manage.sh db:backup          # Create timestamped PostgreSQL dump in backups/
./manage.sh db:restore [file]  # Restore database from a dump file
```

### 10.3 Development Commands

```bash
./manage.sh dev:backend        # Start Go API with air hot-reload (port 8080)
./manage.sh dev:frontend       # Start React Vite dev server (port 5173)
./manage.sh dev:mail           # Start Mailpit SMTP test server (SMTP: 1025, UI: 8025)
./manage.sh sqlc:gen           # Run sqlc generate (regenerate DB code from SQL queries)
./manage.sh create-admin       # Create initial admin user interactively
```

### 10.4 Build Commands

```bash
./manage.sh build:backend      # Compile Go binary → zanajira-server/bin/server
./manage.sh build:frontend     # Build React production bundle → zanajira-web/dist/
```

---

## 11. Running the Application

### 11.1 Prerequisites

| Requirement | Version | Check |
|---|---|---|
| Go | ≥ 1.22 | `go version` |
| Node.js | ≥ 18 | `node --version` |
| npm | ≥ 9 | `npm --version` |
| PostgreSQL | 16 | `pg_isready` |
| Redis | ≥ 7 | `redis-cli ping` |
| golang-migrate | latest | `migrate -version` |

### 11.2 First-Time Setup

```bash
# 1. Clone / navigate to project root
cd /home/yusuf/zanajira

# 2. Copy and configure environment variables
cp .env.example .env
# Edit .env with your values (DATABASE_URL, JWT_SECRET, etc.)

# 3. Create PostgreSQL database and user
./manage.sh db:init

# 4. Apply all database migrations
./manage.sh db:migrate

# 5. Seed reference data and demo data
./manage.sh db:seed

# 6. Create the first admin user
./manage.sh create-admin

# 7. Install frontend dependencies
cd zanajira-web && npm install && cd ..
```

### 11.3 Running in Development

Open **two terminal windows**:

**Terminal 1 — Backend API:**
```bash
cd /home/yusuf/zanajira
./manage.sh dev:backend
# API running at http://localhost:8080
# Health check: http://localhost:8080/health
```

**Terminal 2 — Frontend:**
```bash
cd /home/yusuf/zanajira
./manage.sh dev:frontend
# Frontend running at http://localhost:5173
```

**Optional — Email testing (Terminal 3):**
```bash
./manage.sh dev:mail
# SMTP server: localhost:1025
# Web UI: http://localhost:8025
```

### 11.4 Running in Production

```bash
# 1. Build both applications
./manage.sh build:backend
./manage.sh build:frontend

# 2. Copy frontend build to Nginx web root
cp -r zanajira-web/dist/* /var/www/zanajira/dist/

# 3. Start all services
./manage.sh start

# 4. Check health
./manage.sh health
```

### 11.5 Access URLs

| Portal | URL | Description |
|---|---|---|
| **Applicant Portal** | http://localhost:5173 | Public-facing job portal |
| **Admin Portal** | http://localhost:5173/admin | Admin dashboard |
| **API Base** | http://localhost:8080/api | REST API |
| **API Health** | http://localhost:8080/health | Health check endpoint |
| **Mailpit UI** | http://localhost:8025 | Email testing interface (dev only) |

---

## 12. API Endpoints Reference

**Base URL:** `http://localhost:8080/api`

**Authentication:** Bearer token in `Authorization` header or `access_token` HTTP-only cookie.

### 12.1 Authentication Endpoints (Public)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/auth/register` | Register new applicant account | No |
| `GET` | `/auth/activate/:token` | Activate account via email link | No |
| `POST` | `/auth/login` | Login and receive JWT tokens | No |
| `POST` | `/auth/refresh` | Refresh access token using refresh cookie | No |
| `POST` | `/auth/forgot-password` | Request password reset email | No |
| `POST` | `/auth/reset-password` | Reset password with token | No |
| `POST` | `/auth/change-password` | Change password (authenticated) | ✅ Applicant |
| `POST` | `/auth/logout` | Logout and clear cookies | ✅ Any |

**Register Request:**
```json
{
  "email": "juma.ali@gmail.com",
  "password": "Juma@1234",
  "confirm_password": "Juma@1234"
}
```

**Login Request / Response:**
```json
// Request
{ "email": "admin@zanajira.go.tz", "password": "Admin@1234" }

// Response
{
  "access_token": "eyJhbGci...",
  "email": "admin@zanajira.go.tz",
  "role": "admin",
  "user_id": "06ff216d-749f-4635-8a07-356fc3f17db9"
}
```

### 12.2 Public Vacancy Endpoints

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/vacancies` | List all open vacancies (paginated) | No |
| `GET` | `/vacancies/search?q=` | Search vacancies by keyword | No |
| `GET` | `/vacancies/:id` | Get full vacancy details | No |
| `GET` | `/zanid/:id` | ZanID lookup (9-digit national ID) | No |

**Query Parameters for `/vacancies`:**
- `page` — page number (default: 1)
- `limit` — results per page (default: 20, max: 100)

### 12.3 Applicant Profile Endpoints

> All require `Authorization: Bearer <token>` with `applicant` role.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/applicants/me` | Get own full profile |
| `GET` | `/applicants/me/completion` | Get profile completion percentage |
| `PUT` | `/applicants/me/personal` | Update personal details (ZanID, sex, DOB, etc.) |
| `POST` | `/applicants/me/photo` | Upload passport photo (multipart) |
| `PUT` | `/applicants/me/contact` | Update contact details |
| `POST` | `/applicants/me/contact/birth-cert` | Upload birth certificate PDF |
| `POST` | `/applicants/me/academic` | Add academic qualification |
| `PUT` | `/applicants/me/academic/:id` | Update academic qualification |
| `DELETE` | `/applicants/me/academic/:id` | Remove academic qualification |
| `POST` | `/applicants/me/academic/:id/cert` | Upload certificate PDF (`?type=cert\|tcu\|nacte\|necta`) |
| `POST` | `/applicants/me/language` | Add language proficiency |
| `DELETE` | `/applicants/me/language/:id` | Remove language |
| `POST` | `/applicants/me/experience` | Add work experience |
| `DELETE` | `/applicants/me/experience/:id` | Remove work experience |
| `POST` | `/applicants/me/training` | Add training/workshop |
| `DELETE` | `/applicants/me/training/:id` | Remove training |
| `PUT` | `/applicants/me/computer-skills` | Update computer skills (array) |
| `POST` | `/applicants/me/referee` | Add referee |
| `DELETE` | `/applicants/me/referee/:id` | Remove referee |
| `POST` | `/applicants/me/attachment` | Upload other attachment (multipart, `type` field required) |
| `DELETE` | `/applicants/me/attachment/:id` | Remove attachment |
| `POST` | `/applicants/me/declaration` | Submit declaration `{"accepted": true}` |
| `GET` | `/applicants/me/cv` | Get system-generated CV data |

### 12.4 Application Endpoints

> Require `applicant` role.

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/applications` | Apply for a vacancy (multipart: `vacancy_id` + `letter` PDF) |
| `GET` | `/applications/me` | List own applications with status |
| `PUT` | `/applications/:id/letter` | Replace application letter (before closing date) |

**Apply Request (multipart/form-data):**
```
vacancy_id: <uuid>
letter: <PDF file, max 1MB>
```

### 12.5 Admin Endpoints

> All require `admin` or `staff` role unless noted.

#### Dashboard & Monitoring

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/admin/dashboard` | Stats: total applicants, new, in-progress, placements + employer chart |
| `GET` | `/admin/applicants` | List all applicants (paginated, `?q=` search) |
| `GET` | `/admin/audit-logs` | View audit log (paginated) |
| `GET` | `/admin/config` | Get all system config key-value pairs |
| `PUT` | `/admin/config` | Update system config `{"key": "value", ...}` |

#### Staff Management (admin only)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/admin/staff` | List all staff/employer users |
| `POST` | `/admin/staff` | Create staff account `{email, password, role}` |
| `PUT` | `/admin/staff/:id` | Update staff role / active status |
| `DELETE` | `/admin/staff/:id` | Deactivate staff account |

#### Vacancy Management

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/admin/vacancies` | List all vacancies (all statuses, paginated) |
| `POST` | `/admin/vacancies` | Create new vacancy |
| `PUT` | `/admin/vacancies/:id` | Update vacancy details |
| `PUT` | `/admin/vacancies/:id/status` | Change status `{"status": "published"\|"closed"\|"draft"}` |
| `DELETE` | `/admin/vacancies/:id` | Delete vacancy |
| `GET` | `/admin/vacancies/:id/applicants` | List applicants for a vacancy |
| `PUT` | `/admin/applications/:id/status` | Update application status `{"status": "shortlisted"\|"placed"\|"rejected"\|"in_progress"}` |

#### Employer & Secretariat Management

| Method | Endpoint | Description |
|---|---|---|
| `GET/POST` | `/admin/employers` | List / create employers |
| `PUT/DELETE` | `/admin/employers/:id` | Update / delete employer |
| `GET/POST` | `/admin/secretariats` | List / create secretariats |
| `DELETE` | `/admin/secretariats/:id` | Delete secretariat |
| `GET/POST` | `/admin/permits` | List / issue permits |
| `PUT` | `/admin/permits/:id/status` | Update permit status |

#### Academic Reference Data

| Method | Endpoint | Description |
|---|---|---|
| `GET/POST` | `/admin/academic-levels` | List / create academic levels |
| `PUT/DELETE` | `/admin/academic-levels/:id` | Update / delete |
| `GET/POST` | `/admin/academic-institutions` | List / create institutions |
| `PUT/DELETE` | `/admin/academic-institutions/:id` | Update / delete |
| `GET/POST` | `/admin/academic-programmes` | List / create programmes |
| `DELETE` | `/admin/academic-programmes/:id` | Delete programme |
| `GET/POST` | `/admin/academic-subscriptions` | List / create subscriptions |
| `DELETE` | `/admin/academic-subscriptions/:id` | Delete subscription |

#### Professional Reference Data

| Method | Endpoint | Description |
|---|---|---|
| `GET/POST` | `/admin/computer-skills` | List / create computer skill definitions |
| `DELETE` | `/admin/computer-skills/:id` | Delete |
| `GET/POST` | `/admin/professional-courses` | List / create professional courses |
| `DELETE` | `/admin/professional-courses/:id` | Delete |
| `GET/POST` | `/admin/professional-institutions` | List / create professional institutions |
| `PUT/DELETE` | `/admin/professional-institutions/:id` | Update / delete |

#### Key Matrices & Schemes of Service

| Method | Endpoint | Description |
|---|---|---|
| `GET/POST` | `/admin/key-matrices` | List / create key matrices |
| `PUT/DELETE` | `/admin/key-matrices/:id` | Update / delete |
| `GET/POST` | `/admin/schemes-of-service` | List / create schemes of service |
| `PUT/DELETE` | `/admin/schemes-of-service/:id` | Update / delete |

### 12.6 Response Format

All API responses use JSON. Successful responses:

```json
// Single resource
{ "id": "uuid", "field": "value", ... }

// List with pagination
{ "data": [...], "total": 217 }

// Success message
{ "message": "Operation completed successfully." }

// With completion update
{ "message": "Saved.", "completion_pct": 85 }
```

Error responses:

```json
// 400 Bad Request
{ "error": "email and password are required" }

// 401 Unauthorized
{ "error": "invalid or expired token" }

// 403 Forbidden
{ "error": "forbidden" }

// 404 Not Found
{ "error": "vacancy not found" }

// 409 Conflict
{ "error": "you have already applied for this vacancy" }

// 422 Unprocessable Entity
{ "error": "profile must be at least 70% complete before applying", "completion_pct": 45, "required_pct": 70 }
```

---

## 13. Seeded Data Summary

The following Zanzibar-specific data is pre-loaded in the database for demonstration and testing purposes.

### 13.1 Employers (23 total)

All government ministries and agencies of the Revolutionary Government of Zanzibar, including:
- Wizara ya Fedha na Mipango, Wizara ya Afya, Wizara ya Elimu
- Wizara ya Uvuvi na Maliasili za Bahari, Wizara ya Utalii na Mazingira
- Shirika la Umeme Zanzibar (ZECO), Mamlaka ya Maji Zanzibar (ZAWA)
- Bodi ya Utalii Zanzibar (ZTB), Zanzibar Revenue Board
- Ofisi za Wakuu wa Mikoa (Unguja Kaskazini, Kusini, Mjini Magharibi, Pemba Kaskazini, Pemba Kusini)

### 13.2 Vacancies (13 published)

| Post Title | Employer | Posts | Salary Scale | Applications |
|---|---|---|---|---|
| Senior Accountant | Ministry of Finance | 2 | ZGS 9-10 | 23 |
| Medical Officer | Ministry of Health | 5 | ZGS 11-12 | 22 |
| ICT Officer | Civil Service Commission | 3 | ZGS 8-9 | 22 |
| Daktari wa Afya Daraja la I | Ministry of Health | 8 | ZGS 10-11 | 15 |
| Mwalimu wa Sekondari | Ministry of Education | 12 | ZGS 5-6 | 15 |
| Muuguzi Daraja la II | Ministry of Health | 15 | ZGS 6-7 | 15 |
| Afisa Fedha Daraja la II | Ministry of Finance | 4 | ZGS 7-8 | 15 |
| Afisa Teknolojia ya Habari | Civil Service Commission | 3 | ZGS 8-9 | 15 |
| Afisa Uvuvi Daraja la II | Wizara ya Uvuvi | 5 | ZGS 7-8 | 15 |
| Mhandisi wa Umeme Daraja la I | ZECO | 2 | ZGS 11-12 | 15 |
| Mkaguzi wa Kodi Daraja la II | Zanzibar Revenue Board | 6 | ZGS 7-8 | 15 |
| Afisa Utalii Daraja la II | Wizara ya Utalii | 3 | ZGS 7-8 | 15 |
| Afisa Ardhi Daraja la II | Wizara ya Ardhi | 4 | ZGS 7-8 | 15 |

### 13.3 Applicants (30 Zanzibar residents)

All applicants have:
- **Pure Zanzibar names** (Ali Juma Bakar, Fatuma Said Kombo, Zuwena Khalid Nassor, etc.)
- **ZanID numbers** (100234567 – 100234596)
- **Zanzibar addresses** (Mji Mkongwe, Ng'ambo, Michenzani, Wete, Mkoani, Chake Chake)
- **Zanzibar phone numbers** (10-digit, starting with `077x`)
- **Three languages**: Kiswahili (Very Good), Kiingereza, Kiarabu
- **Academic qualifications** from SUZA, Karume, Lumumba, Forodhani, UDSM
- **Work experience** at Zanzibar government organisations (ZECO, PBZ, ZAWA, ZTB, Mnazi Mmoja Hospital)
- **Profile completion: 95%**

### 13.4 Applications (217 total)

| Status | Count |
|---|---|
| received | ~86 |
| in_progress | ~74 |
| shortlisted | ~44 |
| placed | ~13 |

### 13.5 Reference Data

| Category | Count |
|---|---|
| Academic Institutions | 26 (local + foreign) |
| Academic Programmes | 27 (in Kiswahili) |
| Academic Levels | 10 (CSE through PhD) |
| Professional Courses | 18 |
| Professional Institutions | 13 |
| Schemes of Service | 10 (ZGS 1-2 through ZGS 13-14) |
| Key Matrices | 5 (Utawala, Afya, Uhandisi, Elimu, Fedha) |
| Secretariats | 8 |
| Permits | 5 (active) |
| Audit Log Entries | 40 |

---

## Security Notes

| Requirement | Implementation |
|---|---|
| Password storage | bcrypt with cost factor 12 (SEC-001) |
| Transport security | HTTPS/TLS via Nginx (SEC-002) |
| Account activation | Time-limited email token, 24-hour expiry (SEC-003) |
| Access control | RBAC middleware on all protected routes (SEC-004) |
| Admin isolation | Admin routes require `admin`/`staff` role (SEC-005) |
| Session timeout | 30-minute inactivity (configurable via admin config) (SEC-006) |
| File validation | PDF-only MIME check + size limits enforced server-side (SEC-007) |
| Audit trail | All auth events and mutations logged (SEC-008) |
| Input sanitization | Echo framework + Zod validation on all inputs (SEC-009) |
| Password reset | Time-limited single-use token, 2-hour expiry (SEC-010) |
| XSS protection | JWT in HTTP-only cookies |
| CSRF | SameSite=Strict cookie policy |
| Rate limiting | Auth endpoints: 10 req/min; API: 60 req/min (Nginx) |

---

*Document End — ZanAjira System Documentation v1.0*
*Civil Service Commission, Revolutionary Government of Zanzibar*
*Prepared by eGaz — May 2026*
