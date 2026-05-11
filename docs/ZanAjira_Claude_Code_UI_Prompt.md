# ZanAjira Portal — Claude Code UI Prompt

You are a senior product designer + frontend engineer.
Design and implement a modern, stunning, eye-catching Government Job Application Portal (ZanAjira) web UI using:

- React 19 + TypeScript 6 + Vite 8
- Tailwind CSS v3+ (with custom theme — see config below)
- shadcn/ui + Radix UI
- Zustand for global state (auth + profile)
- React Router DOM v7 (client-side SPA routing)
- React Hook Form + Zod for all forms
- Recharts for admin dashboard charts
- TanStack Table v8 for all data tables
- react-i18next for bilingual EN + Kiswahili support
- Axios for API calls (base URL: `http://localhost:8080/api`)

---

## UI/UX Goals

- **Light color palette** — Deep Ocean Blue (#1B4F72), Zanzibar Gold (#C0932A), soft whites, cool off-whites, subtle gradients
- **"Refined Coastal Governance"** aesthetic — official and trustworthy like a government portal, alive and beautiful like Zanzibar: Stone Town architecture, coral stone, carved wooden doors, Islamic geometric tile patterns
- **Clean spacing, rounded cards (`rounded-2xl`), soft shadows**
- **Accessible typography** — Playfair Display for all headings (authoritative serif), DM Sans for body/UI text (clean and modern), JetBrains Mono for IDs and codes
- **Responsive layout** — desktop-first, tablet-friendly, mobile-collapsible sidebar
- **WCAG 2.1 AA** accessible color contrast throughout
- **No dark theme** — light throughout, no exceptions
- **Bilingual** — every visible string wrapped in `t()` from react-i18next; English (en.json) and Kiswahili (sw.json) translations provided

---

## Tailwind Config

```js
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary:    { DEFAULT: '#1B4F72', light: '#D6E8F7', dark: '#163D5A' },
        accent:     { DEFAULT: '#C0932A', light: '#FDF3DC' },
        surface:    '#FFFFFF',
        background: '#F5F8FC',
        border:     '#E2EAF4',
        'text-primary':   '#1A2940',
        'text-secondary': '#5A7394',
        'text-muted':     '#9BB2C9',
        success: '#1A7A4E',
        warning: '#C07A10',
        danger:  '#B03030',
        info:    '#1B5FA6',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body:    ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        card:  '16px',
        modal: '20px',
        pill:  '9999px',
      },
      boxShadow: {
        card:       '0 4px 24px rgba(27,79,114,0.08)',
        'card-hover':'0 8px 32px rgba(27,79,114,0.14)',
        modal:      '0 16px 64px rgba(26,41,64,0.18)',
      },
    },
  },
};
```

Import these Google Fonts in `src/index.css`:
- Playfair Display — weights 400, 600, 700
- DM Sans — weights 400, 500, 600
- JetBrains Mono — weights 400, 600

Set `body { font-family: 'DM Sans' }`. Set `h1, h2, h3 { font-family: 'Playfair Display' }`.

---

## Pages to Design and Implement

### 1. Login Page (`/login`)
- Centered card (max-width 420px), white, `border-radius: 20px`, `box-shadow: modal`.
- Page background: `#F5F8FC` with a very faint Islamic geometric SVG tile pattern overlay.
- Card animates in: `scale(0.96) → scale(1)` + `opacity 0 → 1`, 300ms ease-out.
- Top: ZanAjira circular government emblem (48px, deep blue SVG seal) + "Ingia" / "Sign In" heading in Playfair Display 28px centered.
- Subtitle: "Karibu tena kwenye ZanAjira" in text-secondary 14px.
- Email and Password fields with **floating labels** (label lifts on focus/fill).
- Password field: show/hide toggle (Lucide Eye / EyeOff icon).
- "Umesahau neno la siri?" / "Lost Password?" — right-aligned link, 13px.
- Full-width "Ingia" primary button (48px tall, rounded-pill, `#1B4F72` blue).
- Divider "au" / "or" then "Jisajili sasa" / "Register now" link.
- Error: shadcn Alert (danger variant) slides down on invalid credentials.
- Language toggle (EN | SW) in top-right corner of the page.

### 2. Register Page (`/register`)
- Same card style as Login.
- Title: "Unda Akaunti" / "Create Account".
- Fields: Email, Password, Confirm Password — floating labels.
- Live password strength bar: 1-segment red (weak), 2-segment amber (medium), 3-segment green (strong).
- Live criteria checklist: 8+ chars ✓, letters ✓, numbers ✓, symbol ✓ — turn green in real time.
- "Unda Akaunti" primary button.
- Post-submit success state: envelope + gold star illustration + "Angalia Barua Pepe Yako!" heading.

### 3. Applicant Dashboard (`/dashboard`)
- Welcome banner: `"Habari, [First Name]!"` with a soft `#1B4F72 → #2B6CB0` gradient and Playfair Display heading.
- **Profile Completion Card** (prominent, full width):
  - Animated circular ring (80px SVG progress) showing completion %.
  - Below 70%: amber ring, "Kamilisha wasifu wako ili uweze kuomba kazi" warning.
  - 70%+: blue ring with gold tick, "Uko tayari kuomba nafasi za kazi!" message.
  - List of incomplete sections with colored status dots.
  - "Kamilisha Wasifu" / "Complete Profile" CTA button.
- **Open Vacancies grid** (same card design as public vacancy list, with active "Omba" / Apply buttons).

### 4. Admin Dashboard (`/admin/dashboard`)
- **Stats row** — 4 KPI cards (stagger-in animation, 150ms apart):
  - Total Applicants (blue icon), New Applicants (gold icon), In Progress (amber icon), Placements (green icon).
  - Large animated count-up numbers (DM Sans 800, 40px).
  - Subtle trend arrow (▲ green / ▼ red) below number.
- **Bar chart** (Recharts): "Maombi kwa Mwajiri" / "Applications by Employer".
  - Bars: gradient fill `#1B4F72 → #4A90D9`. Hover: `#C0932A` gold.
  - Toggle buttons: "Waombaji" | "Watumiaji".
  - Custom tooltip: white card, DM Sans, shadow.
- **Current Employers table**: compact, striped (light blue on alternate rows).
- **Recent Audit Activity**: mini-feed of last 5 log entries with user avatar initials.

### 5. Public Vacancy List (`/`)
- **Hero section** (480px tall, full width):
  - Background: `#1B4F72` with SVG Islamic geometric mashrabiya pattern overlay at 8% opacity (white lines).
  - Decorative gold scallop arch SVG along the bottom edge of the hero.
  - Heading: "Karibu ZanAjira" — Playfair Display 56px, white, letter-spacing -0.02em.
  - Sub: "Tafuta na Omba Nafasi za Kazi za Serikali ya Zanzibar" — `#D6E8F7` 18px.
  - Search bar: white pill input + "Tafuta" blue button, subtle shadow.
  - Stats strip (animated count-up): "51,167 Waliojisajili | 13 Nafasi Wazi | 23 Waajiri".
  - All elements stagger-in on load (0ms, 150ms, 300ms, 450ms).
- **Vacancy cards grid**: 3-column desktop, 2-column tablet, 1-column mobile.
  - Each card: white, `rounded-2xl`, `shadow-card`.
  - Hover: `shadow-card-hover` + `translateY(-2px)` + left 3px gold border appears.
  - Employer name: gold small-caps 11px.
  - Post title: Playfair Display 18px, 2-line clamp.
  - Meta: 📌 Location | 🗓 Closing Date | 👤 N Posts — text-secondary 13px.
  - "Closing Soon" amber banner if closing within 7 days.
  - Buttons: "Maelezo Zaidi" ghost + "Omba" primary.
  - Loading: 6 SkeletonCard shimmer placeholders.
  - Empty: custom illustration + "Hakuna nafasi zilizopo sasa hivi."

### 6. Vacancy Detail Page (`/vacancies/:id`)
- Breadcrumb: Home > Nafasi za Kazi > [Post Title]
- Two-column layout (70/30), stacks on mobile.
- Left: Post title (Playfair H1, 32px, `#1B4F72`), employer gold badge, 2px gold divider.
  - Three arched-top cards: Qualifications, Duties, Salary Scale.
  - Each card header: blue bg strip, white Playfair title.
- Right sidebar (sticky): posts count, countdown to closing date, "Omba Sasa" full-width primary button.

### 7. Applicant Profile Pages (`/profile/*`)
All use ApplicantLayout. Consistent page structure: section icon + Playfair H2 + completion badge + white form card.

- **Personal Details** (`/profile/personal`): ZanIDInput component (9-digit monospace, three states: idle / loading shimmer / success green flash + auto-fill), circular photo upload zone (128px), floating-label fields, lock icon on ZanID-populated read-only fields.
- **Contact Details** (`/profile/contact`): Address fields, birth certificate PDF upload zone.
- **Academic Qualifications** (`/profile/academic`): Collapsible add-form, education level colored badges (PhD dark → CSE light blue gradient), conditional TCU/NACTE/NECTA upload zones, lost cert toggle.
- **Language Proficiency** (`/profile/language`): Three-pill rating buttons per skill (Fair | Good | Very Good — selected: blue fill, unselected: white + blue border).
- **Work Experience** (`/profile/experience`): "Current Job" Switch hides end date, multi-entry cards with collapse for long duty text.
- **Computer Literacy** (`/profile/computer`): Three side-by-side skill cards (MS Word blue W, MS Excel green X, MS PowerPoint red P) with proficiency rating pills, stagger-in animation.
- **Declaration** (`/profile/declaration`): Amber warning card, scrollable declaration text, large checkbox, submit-only-when-checked button.

### 8. CV Preview (`/cv`)
- White A4-proportioned card (820px wide, centered).
- Header: Name in Playfair 28px, ZanID in JetBrains Mono pill, circular photo (80px), contact row.
- Gold divider (3px full width).
- Sections: Language Proficiency | Academic Qualifications | Work Experience | Trainings | Computer Literacy.
- Faint diagonal "ZanAjira" watermark (opacity 0.04).
- Fixed "Chapisha CV" gold button (bottom-right, printer icon).
- `@media print` styles: hide all except card, remove watermark, white background.

### 9. Apply for Vacancy (`/vacancies/:id/apply`)
- 3-step indicator bar: Kagua (Review) → Tamko (Declaration) → Wasilisha (Submit).
- Step 1: completion ring check (blocks with red alert + "Kamilisha Wasifu" if < 70%).
- Step 2: scrollable declaration + acknowledgement checkbox.
- Step 3: PDF upload zone (max 1MB) + "Thibitisha Maombi" full-width button → success state with animated checkmark.

### 10. My Applications (`/applications`)
- TanStack Table: Employer | Post Title | Date Applied | Closing Date | Status | Actions.
- StatusBadge component for all statuses.
- "Replace Letter" ghost button (visible only when status is received/in_progress + not past closing date).
- Empty state: dhow-on-ocean SVG illustration.

### 11. Vacancy Management — Admin (`/admin/vacancies`)
- TanStack Table with search, status filter, employer filter.
- Status badges: draft (grey), published (blue), closed (muted).
- Row actions: Edit (pencil) | Publish/Close (toggle) | View Applicants (users icon) | Delete (trash, red, confirm dialog).
- "Unda Nafasi Mpya" modal: full vacancy creation form.

### 12. Applicant Pipeline — Admin (`/admin/vacancies/:id/applicants`)
- Vacancy header card (full-width, `#1B4F72` gradient, white text): Post Title | Employer | Closing Date | Total count.
- Toggle: Table view | Kanban board view.
- Kanban: 5 columns (Received | In Progress | Shortlisted | Placed | Rejected), draggable applicant mini-cards.
- Detail drawer (shadcn Sheet, 480px from right): full applicant profile summary + status action buttons.

### 13. Audit Logs — Admin (`/admin/audit-logs`)
- Filterable by user, action type, resource, date range.
- Row expand: shows `metadata_json` in a dark code block.

### 14. System Config — Admin (`/admin/config`)
- Grouped settings: File Limits | Profile Threshold | Session Timeout.
- Per-section "Hifadhi" / "Save" buttons with success toast.

---

## Components to Create

### Layouts

- **PublicLayout** — sticky header (4px gold top accent bar, ZanAjira emblem + name, language toggle EN|SW, Sign In + Register buttons), footer (dark navy `#1A2940`).
- **ApplicantLayout** — 260px white sidebar (avatar + name + ZanID badge + circular completion ring + section nav links with gold active border) + 64px top nav (breadcrumb + compact progress bar + user dropdown).
- **AdminLayout** — 240px dark navy sidebar (`#1A2940`, gold active left border, grouped nav sections) + 60px white top bar (global search + notification bell + avatar dropdown).

### Shared Components

- **ProfileProgressBar** — horizontal pill bar, gradient fill `#1B4F72 → #C0932A`, animated width on mount (800ms ease), vertical 70% threshold marker with "Min to Apply" tooltip, contextual below/above-threshold messaging.
- **FileUploadInput** — dashed blue border zone, PDF icon center, drag-and-drop + click, hover fill, uploaded file chip with remove X, client-side PDF+size validation, error state.
- **StatusBadge** — coloured pill badges:
  - `received` → `#DBEAFE` bg / `#1B5FA6` text / 📩
  - `in_progress` → `#FEF3C7` bg / `#92400E` text / ⏳ (pulse)
  - `shortlisted` → `#EDE9FE` bg / `#5B21B6` text / ⭐
  - `placed` → `#D1FAE5` bg / `#065F46` text / ✅
  - `rejected` → `#FEE2E2` bg / `#991B1B` text / ✗
- **ZanIDInput** — 9-digit monospace field, auto-format, three states (idle / loading shimmer + auto-fill skeleton / success green border + shimmer auto-fill animation), debounced API call on valid entry.
- **EmptyState** — custom SVG Zanzibar-motif illustrations (dhow on ocean / empty folder + gold star / magnifying glass over mashrabiya pattern / coral stone arch with birds) + Playfair heading + muted description + optional CTA.
- **SkeletonCard** — shimmer placeholder for vacancy cards, table rows, profile sections (CSS keyframe sweep animation).
- **Toast** — slide in from top-right, types: success / error / info / warning, auto-dismiss 4s.

---

## UI Style Rules

- **Tailwind utility classes only** for all styling.
- **shadcn/ui components** for: Button, Input, Select, Dialog, Tabs, Badge, Avatar, Progress, Separator, Toast, Tooltip, Table, Sheet, Switch, Textarea, Checkbox, RadioGroup, Alert, Skeleton, Popover, Command.
- **Shadows**: `shadow-card` / `shadow-card-hover` / `shadow-modal` from custom Tailwind config.
- **Border radius**: `rounded-2xl` for cards, `rounded-full` for pills and avatars, `rounded-xl` for modals.
- **Floating label inputs**: label transforms `translate-y(-50%) scale(0.85)` on focus/filled — CSS in `index.css` via Tailwind `@layer` utilities.
- **Hover states**: buttons `scale(0.97)` on press + blue glow shadow on hover; cards `translateY(-2px)` + deeper shadow; sidebar links left gold border slides in.
- **Micro-interactions**: progress bar animates width 800ms ease; stat numbers count up on mount; staggered card fade-in (150ms between items); ZanID success green flash.
- **Empty states**: every empty list/table has a unique SVG illustration — never a generic icon.
- **No dark theme** anywhere. No `dark:` Tailwind variants.

---

## Folder Structure

```
zanajira-web/
├── src/
│   ├── App.tsx                        # Root + React Router route tree
│   ├── main.tsx                       # ReactDOM.createRoot entry
│   ├── index.css                      # Google Fonts import + Tailwind base + floating label CSS
│   ├── lib/
│   │   └── api.ts                     # Axios instance + JWT interceptors
│   ├── store/
│   │   ├── authStore.ts               # Zustand: user, accessToken, login, logout, refresh
│   │   └── profileStore.ts            # Zustand: completionPct, all profile section data
│   ├── i18n/
│   │   ├── en.json                    # English translations (all UI strings)
│   │   ├── sw.json                    # Kiswahili translations (all UI strings)
│   │   └── index.ts                   # i18next + react-i18next initialisation
│   ├── components/
│   │   ├── ProfileProgressBar.tsx
│   │   ├── FileUploadInput.tsx
│   │   ├── StatusBadge.tsx
│   │   ├── ZanIDInput.tsx
│   │   ├── EmptyState.tsx
│   │   ├── SkeletonCard.tsx
│   │   └── index.ts                   # Re-export all components
│   ├── layouts/
│   │   ├── PublicLayout.tsx
│   │   ├── ApplicantLayout.tsx
│   │   └── AdminLayout.tsx
│   └── features/
│       ├── public/
│       │   ├── VacancyList.tsx
│       │   ├── VacancyDetail.tsx
│       │   ├── Login.tsx
│       │   ├── Register.tsx
│       │   ├── Activate.tsx
│       │   ├── ForgotPassword.tsx
│       │   └── ResetPassword.tsx
│       ├── applicant/
│       │   ├── Dashboard.tsx
│       │   ├── profile/
│       │   │   ├── PersonalDetails.tsx
│       │   │   ├── ContactDetails.tsx
│       │   │   ├── AcademicQualifications.tsx
│       │   │   ├── LanguageProficiency.tsx
│       │   │   ├── WorkExperience.tsx
│       │   │   ├── ComputerLiteracy.tsx
│       │   │   └── Declaration.tsx
│       │   ├── jobs/
│       │   │   ├── ApplyFlow.tsx
│       │   │   └── MyApplications.tsx
│       │   └── cv/
│       │       └── CVPreview.tsx
│       └── admin/
│           ├── AdminDashboard.tsx
│           ├── management/
│           │   ├── VacancyManagement.tsx
│           │   ├── VacancyApplicants.tsx
│           │   ├── GenericCRUD.tsx
│           │   └── AuditLogs.tsx
│           └── config/
│               └── SystemConfig.tsx
├── tailwind.config.js
├── vite.config.ts
└── package.json
```

---

## Realistic Dummy Data

Use this realistic Zanzibar data for all dummy data throughout the UI:

**Applicants (sample):**
- Ali Juma Bakar — ZanID: 100234567 — 95% — ali.juma.bakar@gmail.com
- Fatuma Said Kombo — ZanID: 100234568 — 95% — fatuma.said.kombo@gmail.com
- Hassan Omar Mwinyi — ZanID: 100234569 — 88% — hassan.omar.mwinyi@gmail.com
- Zuwena Khalid Nassor — ZanID: 100234570 — 72% — zuwena.khalid.nassor@gmail.com

**Employers:** Wizara ya Fedha na Mipango | Wizara ya Afya | Wizara ya Elimu | ZECO | ZAWA | ZTB | Zanzibar Revenue Board

**Vacancies:**
- Senior Accountant — Wizara ya Fedha — 2 posts — ZGS 9-10 — 23 applications
- Medical Officer — Wizara ya Afya — 5 posts — ZGS 11-12 — 22 applications
- ICT Officer — Civil Service Commission — 3 posts — ZGS 8-9 — 22 applications
- Mwalimu wa Sekondari — Wizara ya Elimu — 12 posts — ZGS 5-6 — 15 applications

**Locations:** Mji Mkongwe | Ng'ambo | Michenzani | Wete | Mkoani | Chake Chake | Stone Town

**Dashboard stats:** Total Applicants: 51,167 | New: 342 | In Progress: 1,847 | Placements: 213

**Application statuses:** received (86) | in_progress (74) | shortlisted (44) | placed (13) | rejected (0)

---

## Output Requirements

- Full working React + TypeScript code for every page and component listed above.
- `tailwind.config.js` with the exact custom theme defined above.
- `src/index.css` with Google Fonts imports + floating label CSS.
- `src/i18n/en.json` and `src/i18n/sw.json` with all UI strings translated.
- `src/lib/api.ts` — Axios instance with JWT interceptors.
- `src/store/authStore.ts` and `src/store/profileStore.ts` — Zustand stores.
- All three layouts: PublicLayout, ApplicantLayout, AdminLayout.
- All shared components with full TypeScript props and realistic behaviour.
- Realistic Zanzibar dummy data in every page (use the data above).
- React.lazy + Suspense code splitting for all routes.
- `@media print` styles in CVPreview for clean PDF printing.
- Error boundaries around all major page sections.
- All strings in `t()` calls — never hardcoded English only.

---

## Design Inspiration

- Modern civic government portals (GOV.UK, Singapore MyInfo, Kenya eCitizen)
- Zanzibar coastal aesthetics: Stone Town carved doors, mashrabiya lattice, coral stone arches, Indian Ocean turquoise, gold spice trade heritage
- Premium civic SaaS admin panels
- Islamic geometric art as subtle decorative layer (never garish — always at ≤10% opacity in backgrounds)

---

## Absolute Rules — Never Break These

1. **NEVER** use Inter, Roboto, Arial, or system fonts. Always Playfair Display + DM Sans + JetBrains Mono.
2. **NEVER** use generic purple-gradient-on-white aesthetics or cookie-cutter AI design.
3. **NEVER** use dark backgrounds — light theme throughout.
4. **ALWAYS** use the exact color palette defined in the Tailwind config above.
5. **ALWAYS** give every empty list/table a custom SVG Zanzibar-motif illustration — never a generic empty icon.
6. **ALWAYS** use floating label inputs — never static top-labels.
7. **ALWAYS** wrap every visible string in `t()` for i18n.
8. **ALWAYS** use React Hook Form + Zod for every form — never uncontrolled inputs.
9. **ALWAYS** use the central Axios instance from `src/lib/api.ts` — never raw fetch().
10. **NEVER** use localStorage or sessionStorage — use Zustand state and HTTP-only cookies.

---

**Prioritize beauty, cultural authenticity, and real-world usability for Zanzibar government citizens and civil servants over complexity. Every screen must feel like it belongs to a system Zanzibaris are proud to use.**
