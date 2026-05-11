# ZanAjira Portal — Technology Used

**System:** ZanAjira Government Job Application Portal
**Version:** 1.0.0
**Developer:** eGaz / OR-KSUUB
**Date:** May 2026

---

## 1. Frontend Stack

| Technology | Version | Role |
|-----------|---------|------|
| **React** | 19.2.5 | UI component framework |
| **TypeScript** | 6.0.2 | Type-safe JavaScript |
| **Vite** | 8.0.10 | Build tool and dev server |
| **TailwindCSS** | 3.4.1 | Utility-first CSS framework |
| **React Router DOM** | v7.15.0 | Client-side routing (SPA) |
| **Zustand** | 5.0.13 | Global state management (auth store) |
| **Axios** | 1.16.0 | HTTP client with JWT interceptors |
| **React Hook Form** | 7.75.0 | Form state management |
| **Zod** | 4.4.3 | Schema validation |
| **@hookform/resolvers** | 5.2.2 | Zod–React Hook Form integration |
| **Recharts** | 3.8.1 | Charts (admin dashboard bar chart) |
| **@tanstack/react-table** | 8.21.3 | Data tables (admin portal) |
| **react-i18next** | 17.0.7 | Internationalisation (EN + Kiswahili) |
| **i18next** | 26.0.10 | i18n core library |
| **shadcn/ui** | latest | UI component primitives (built on Radix) |

---

## 2. Backend Stack

| Technology | Version | Role |
|-----------|---------|------|
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

---

## 3. Infrastructure

| Component | Technology | Details |
|-----------|-----------|---------|
| Reverse Proxy | **Nginx** | TLS termination, rate limiting, static file serving |
| Process Manager | **PM2** | Go API process management, auto-restart, log rotation |
| Email Testing | **Mailpit** | Local SMTP (port 1025 / UI port 8025) |
| Service Management | **Bash (`manage.sh`)** | Start/stop/restart all services — no Docker |
| OS | **Linux (Ubuntu/Debian)** | Government data center hosted by eGaz |

---

## 4. Frontend Architecture Details

### 4.1 Routing Structure

```
/ (PublicLayout)
├── /                        → Homepage / Vacancy List
├── /vacancies/:id           → Vacancy Detail
├── /login                   → Login page
├── /register                → Register page
├── /activate/:token         → Account activation
├── /forgot-password         → Forgot password
└── /reset-password/:token   → Reset password

/dashboard (ApplicantLayout — requires auth + applicant role)
├── /dashboard               → Applicant home / vacancy list
├── /profile/personal        → Personal Details
├── /profile/contact         → Contact Details
├── /profile/academic        → Academic Qualifications
├── /profile/professional    → Professional Qualifications
├── /profile/language        → Language Proficiency
├── /profile/experience      → Work Experience
├── /profile/training        → Training & Workshops
├── /profile/computer        → Computer Literacy
├── /profile/referees        → Referees
├── /profile/attachments     → Other Attachments
├── /profile/declaration     → Declaration
├── /cv                      → CV Preview
├── /vacancies/:id/apply     → Apply for Vacancy
└── /applications            → My Applications

/admin (AdminLayout — requires auth + admin|staff|employer role)
├── /admin/dashboard         → Admin Dashboard
├── /admin/applicants        → Applicant list
├── /admin/vacancies         → Vacancy management
├── /admin/vacancies/:id/applicants → Applicant pipeline
├── /admin/staff             → Staff management
├── /admin/roles             → Roles management
├── /admin/employers         → Employers CRUD
├── /admin/secretariats      → Secretariat CRUD
├── /admin/permits           → Permits management
├── /admin/academic-levels   → Academic levels CRUD
├── /admin/academic-institutions → Institutions CRUD
├── /admin/academic-programmes → Programmes CRUD
├── /admin/computer-skills   → Computer skills CRUD
├── /admin/professional-courses → Professional courses CRUD
├── /admin/professional-institutions → Prof institutions CRUD
├── /admin/key-matrices      → Key matrices CRUD
├── /admin/schemes-of-service → Schemes of service CRUD
├── /admin/audit-logs        → Audit log viewer
└── /admin/config            → System configuration
```

### 4.2 State Management (Zustand)

```typescript
// Auth store — persisted to HTTP-only cookie
interface AuthStore {
  user: { id: string; email: string; role: string } | null;
  accessToken: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

// Profile store — loaded on dashboard mount
interface ProfileStore {
  completionPct: number;
  personal: PersonalDetails | null;
  contact: ContactDetails | null;
  // ... other sections
  fetchProfile: () => Promise<void>;
  updateCompletion: (pct: number) => void;
}
```

### 4.3 Axios Instance

```typescript
// All API requests use this instance
const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  withCredentials: true,     // sends HTTP-only cookie
});

// Request interceptor: attach Bearer token
api.interceptors.request.use(config => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor: auto-refresh on 401
api.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      await useAuthStore.getState().refresh();
      return api(error.config);
    }
    return Promise.reject(error);
  }
);
```

### 4.4 Form Validation Pattern (React Hook Form + Zod)

```typescript
// Every form in the app follows this pattern
const personalSchema = z.object({
  zanid: z.string().length(9, 'ZanID must be exactly 9 digits').regex(/^\d{9}$/),
  marital_status: z.enum(['single', 'married', 'divorced', 'widowed']),
  govt_employment_status: z.enum(['employed', 'unemployed', 'self_employed']),
});

const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(personalSchema),
});
```

### 4.5 i18n Structure

```
src/i18n/
├── en.json           # English translations
├── sw.json           # Kiswahili translations
└── index.ts          # i18next initialisation

// Usage in components
const { t } = useTranslation();
<h1>{t('dashboard.welcome', { name: user.firstName })}</h1>
// en: "Welcome, {{name}}!"
// sw: "Karibu, {{name}}!"
```

### 4.6 File Upload Pattern

```typescript
// FileUploadInput component — handles PDF-only with size limits
interface FileUploadInputProps {
  label: string;
  name: string;
  maxSizeMB: number;              // 2 for certs, 1 for letters
  accept: '.pdf';
  onUpload: (file: File) => void;
  onRemove: () => void;
  error?: string;
  existingFileUrl?: string;
}
```

---

## 5. Tailwind CSS Configuration

```javascript
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1B4F72',
          light: '#D6E8F7',
          dark: '#163D5A',
        },
        accent: {
          DEFAULT: '#C0932A',
          light: '#FDF3DC',
        },
        surface: '#FFFFFF',
        background: '#F5F8FC',
        border: '#E2EAF4',
        'text-primary': '#1A2940',
        'text-secondary': '#5A7394',
        'text-muted': '#9BB2C9',
        success: '#1A7A4E',
        warning: '#C07A10',
        danger: '#B03030',
        info: '#1B5FA6',
      },
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        body: ['DM Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        'card': '16px',
        'modal': '20px',
        'pill': '9999px',
      },
      boxShadow: {
        'card': '0 4px 24px rgba(27, 79, 114, 0.08)',
        'card-hover': '0 8px 32px rgba(27, 79, 114, 0.14)',
        'modal': '0 16px 64px rgba(26, 41, 64, 0.18)',
      },
    },
  },
};
```

---

## 6. shadcn/ui Components Used

The following shadcn/ui primitives are installed and used throughout:

| Component | Used In |
|-----------|---------|
| `Button` | All CTAs and actions |
| `Input` | All form text fields |
| `Select` | Dropdown selectors (education level, country, role) |
| `Dialog` | Modals (create vacancy, confirm delete, apply flow) |
| `Tabs` | Admin dashboard view toggle |
| `Badge` | Status pills, completion badges, role labels |
| `Avatar` | Applicant photo / initials |
| `Progress` | Profile completion bar |
| `Separator` | Section dividers |
| `Toast` | Success/error notifications |
| `Tooltip` | Info hints, threshold markers |
| `Table` | Admin data tables (TanStack Table renders into these) |
| `Sheet` | Applicant detail drawer in pipeline view |
| `Switch` | "Current job" toggle, language toggle |
| `Textarea` | Duties, descriptions, address fields |
| `Checkbox` | Declaration, acknowledgement |
| `RadioGroup` | Language proficiency rating (Fair/Good/Very Good) |
| `Alert` | Error states, blocking warnings (profile < 70%) |
| `Skeleton` | Loading placeholders |
| `Popover` | Date pickers, filter dropdowns |
| `Command` | Searchable institution/programme selectors |

---

## 7. API Communication Summary

**Base URL:** `http://localhost:8080/api`

**Auth:** JWT Bearer token in `Authorization` header OR `access_token` HTTP-only cookie.

**Response format:**
```json
// Success — single resource
{ "id": "uuid", "field": "value" }

// Success — list
{ "data": [...], "total": 217 }

// Success — with completion
{ "message": "Saved.", "completion_pct": 85 }

// Error
{ "error": "descriptive error message", "completion_pct": 45, "required_pct": 70 }
```

**Key endpoint groups:**
- `/auth/*` — Registration, login, activation, password recovery
- `/vacancies` — Public vacancy listing and search
- `/zanid/:id` — ZanID national ID lookup
- `/applicants/me/*` — All profile CRUD operations
- `/applications` — Apply and track applications
- `/admin/*` — All admin management endpoints

**File uploads:** `multipart/form-data` — PDF only, size validated server-side.

---

## 8. Environment

```env
DATABASE_URL=postgres://zanajira:zanajira_pass@127.0.0.1:5432/zanajira?sslmode=disable
REDIS_URL=redis://localhost:6379
JWT_SECRET=zanajira-jwt-secret-key-32chars-min!
JWT_REFRESH_SECRET=zanajira-refresh-secret-key-32chars!
ZANID_API_URL=https://zanid.go.tz/api
ZANID_MOCK=true
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_FROM=noreply@zanajira.go.tz
UPLOAD_DIR=/tmp/zanajira/uploads
APP_URL=http://localhost:5173
PORT=8080
ENV=development
```

---

## 9. Project File Structure (Frontend)

```
zanajira-web/src/
├── App.tsx                        # Root component + all route definitions
├── main.tsx                       # React DOM entry point
├── index.css                      # Tailwind base + custom CSS variables
├── lib/
│   └── api.ts                     # Axios instance + interceptors
├── store/
│   ├── authStore.ts               # Zustand auth state
│   └── profileStore.ts            # Zustand profile + completion state
├── i18n/
│   ├── en.json                    # English translations
│   ├── sw.json                    # Kiswahili translations
│   └── index.ts                   # i18next setup
├── components/
│   ├── ProfileProgressBar.tsx     # Animated completion bar
│   ├── FileUploadInput.tsx        # PDF upload with validation
│   ├── StatusBadge.tsx            # Application status pill
│   ├── ZanIDInput.tsx             # 9-digit ZanID field with auto-fetch
│   ├── SkeletonCard.tsx           # Loading shimmer
│   └── EmptyState.tsx             # Illustrated empty states
├── layouts/
│   ├── PublicLayout.tsx           # Header + footer wrapper
│   ├── ApplicantLayout.tsx        # Sidebar + top nav
│   └── AdminLayout.tsx            # Dark sidebar admin
└── features/
    ├── public/                    # Unauthenticated pages
    ├── applicant/                 # Applicant profile + jobs
    └── admin/                     # Admin portal
```

---

*Technology Documentation — ZanAjira Portal v1.0*
*eGaz / OR-KSUUB — May 2026*
