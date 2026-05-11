# ZanAjira Portal — UI Documentation

**System:** Government Job Application Portal (`portal.zanajira.go.tz`)
**Client:** Civil Service Commission, Revolutionary Government of Zanzibar
**Purpose:** This document describes every screen, layout, component, and interaction in the ZanAjira portal for use in generating a beautiful, production-grade UI.

---

## 1. Design Identity & Brand

### 1.1 Context

ZanAjira is a government civil service portal for Zanzibar — an island with a rich Swahili-Arab cultural heritage, turquoise Indian Ocean coastline, and centuries of architectural beauty (Stone Town, Forodhani, coral-stone buildings, wooden carved doors). The UI must feel:

- **Official and trustworthy** — citizens are submitting career-defining applications.
- **Modern and dignified** — not generic "government grey"; elevated and proud.
- **Culturally resonant** — subtle nods to Zanzibar's coastal, geometric, and Islamic design heritage.
- **Light and airy** — a light color theme throughout; bright, open, and breathable.

### 1.2 Color Palette (Light Theme)

| Role | Color | Usage |
|------|-------|-------|
| Primary | `#1B4F72` (Deep Ocean Blue) | Buttons, active states, links, progress |
| Primary Light | `#D6E8F7` | Hover fills, selected backgrounds |
| Accent | `#C0932A` (Zanzibar Gold) | Highlights, icons, completion indicators, badges |
| Accent Light | `#FDF3DC` | Gold tint backgrounds, callout cards |
| Surface | `#FFFFFF` | Cards, modals, form backgrounds |
| Background | `#F5F8FC` | Page background — soft cool white |
| Border | `#E2EAF4` | Dividers, card borders, input strokes |
| Text Primary | `#1A2940` | Headings, body text |
| Text Secondary | `#5A7394` | Labels, hints, metadata |
| Text Muted | `#9BB2C9` | Placeholders, disabled states |
| Success | `#1A7A4E` | Placed status, completion checks |
| Warning | `#C07A10` | In-progress status, closing soon |
| Danger | `#B03030` | Rejected status, error states |
| Info | `#1B5FA6` | Received/information states |

### 1.3 Typography

- **Display / Headings:** `Playfair Display` — classic, authoritative, editorial serif. Used for hero titles, page headings, vacancy titles.
- **UI / Body:** `DM Sans` — clean, contemporary, highly legible. Used for all body text, labels, navigation.
- **Monospace / IDs:** `JetBrains Mono` — for ZanID numbers, reference codes, API tokens.

### 1.4 Visual Motifs

- **Geometric patterns** — subtle Islamic geometric tile patterns (mashrabiya-inspired) as decorative backgrounds on hero sections and empty states.
- **Coral stone texture** — very soft, barely-visible grain texture on section dividers.
- **Wave / dhow silhouette** — used in illustration treatments, loading states.
- **Carved door arches** — arched card tops, modal header arch accents.
- **Gold on blue** — the signature combination throughout (Deep Ocean + Zanzibar Gold).

---

## 2. Layouts

### 2.1 PublicLayout

Used for: Homepage, Vacancy List, Vacancy Detail, Login, Register, Forgot Password, Activate.

**Structure:**
```
┌─────────────────────────────────────────────────────┐
│  HEADER                                              │
│  [Gov Coat of Arms] [ZanAjira] [EN|SW] [Sign In]   │
│  "Serikali ya Mapinduzi ya Zanzibar"                │
├─────────────────────────────────────────────────────┤
│  HERO BANNER (Homepage only)                        │
│  Full-width, geometric pattern background           │
│  Headline: "Karibu ZanAjira"                        │
│  Sub: "Fursa za Kazi za Serikali"                  │
│  Search bar + CTA buttons                           │
├─────────────────────────────────────────────────────┤
│  MAIN CONTENT                                        │
│  (page-specific)                                    │
├─────────────────────────────────────────────────────┤
│  FOOTER                                             │
│  Logos | Links | Contact | Version 1.0.0            │
│  info@zanajira.go.tz                                │
└─────────────────────────────────────────────────────┘
```

**Header Details:**
- Sticky. White background. `border-bottom: 1px solid #E2EAF4` with a 4px gold top accent bar.
- Left: Revolutionary Government emblem (circular seal) + "ZanAjira" in Playfair Display bold.
- Center (desktop): `Portal ya Maombi ya Kazi za Serikali` in small caps.
- Right: Language toggle (EN | SW) + "Sign In" primary button + "Register" ghost button.
- Mobile: Hamburger menu collapses nav.

### 2.2 ApplicantLayout

Used for: All authenticated applicant pages.

**Structure:**
```
┌────────────┬────────────────────────────────────────┐
│            │  TOP NAV                               │
│  SIDEBAR   │  [Breadcrumb] [Profile %] [User Menu] │
│            ├────────────────────────────────────────┤
│  Profile   │                                        │
│  Sections  │  MAIN CONTENT AREA                     │
│  nav links │                                        │
│            │                                        │
│  Progress  │                                        │
│  Bar 85%   │                                        │
│            │                                        │
└────────────┴────────────────────────────────────────┘
```

**Sidebar Details:**
- Width: 260px. Background: `#FFFFFF`. Right border: `1px solid #E2EAF4`.
- Top: Applicant avatar (photo or initials circle), name, ZanID badge.
- Section links (with icons):
  - 👤 Personal Details
  - 📍 Contact Details
  - 🎓 Academic Qualifications
  - 🏆 Professional Qualifications
  - 🌐 Language Proficiency
  - 💼 Work Experience
  - 🏫 Trainings & Workshops
  - 💻 Computer Literacy
  - 👥 Referees
  - 📎 Other Attachments
  - ✅ Declaration
  - 📄 CV Preview
- Active link: `#D6E8F7` background, `#1B4F72` text, left 3px gold border.
- Bottom: Circular progress ring (large, 80px) showing completion %. Color: gold if <70%, blue if ≥70%.

**Top Nav Details:**
- Height: 64px. White. Shadow: subtle `0 1px 8px rgba(27,79,114,0.08)`.
- Left: Breadcrumb (Home > Profile > Personal Details).
- Center: ProfileProgressBar — horizontal pill showing `85% Complete` with animated fill.
- Right: Vacancies link | My Applications link | User dropdown (Change Password, Logout).

### 2.3 AdminLayout

Used for: All admin portal pages.

**Structure:**
```
┌────────────┬────────────────────────────────────────┐
│  ADMIN     │  ADMIN TOP BAR                         │
│  SIDEBAR   │  [Search] [Notifications] [User]       │
│  (dark)    ├────────────────────────────────────────┤
│            │  BREADCRUMB                            │
│  Dashboard │  Admin > Vacancies > Manage            │
│  Users     ├────────────────────────────────────────┤
│  Vacancies │                                        │
│  Applicants│  MAIN CONTENT AREA                     │
│  Reference │  (data tables, forms, dashboards)      │
│  Data      │                                        │
│  Config    │                                        │
│  Logs      │                                        │
└────────────┴────────────────────────────────────────┘
```

**Admin Sidebar Details:**
- Width: 240px. Background: `#1A2940` (deep navy). Text: `#C8D8E8`.
- Top: ZanAjira logo (white version) + "Admin Portal" label.
- Nav groups with section headers (e.g., "MANAGEMENT", "REFERENCE DATA", "SYSTEM").
- Active item: `#1B4F72` background, white text, left 3px gold accent.
- Bottom: Logged-in admin name + role badge + logout button.

---

## 3. Public Pages

### 3.1 Homepage / Vacancy List (`/`)

**Hero Section:**
- Full-width, 500px tall.
- Background: `#1B4F72` (deep blue) with a subtle Islamic geometric mashrabiya SVG pattern overlay at 8% opacity.
- Decorative gold arch silhouette at bottom edge.
- Large Playfair Display heading: `"Karibu ZanAjira"` (white).
- Sub-heading: `"Tafuta na Omba Nafasi za Kazi za Serikali ya Zanzibar"` (light blue tint).
- Search bar: wide white pill input + blue "Tafuta" search button.
- Stats strip below search: `51,167 Applicants | 13 Open Vacancies | 23 Employers`.

**Vacancy Cards Grid (below hero):**
- 3-column grid on desktop, 1-column on mobile.
- Each card:
  - White surface, `border-radius: 16px`, subtle shadow.
  - Top left: employer name in small gold caps.
  - Main: Post title in Playfair Display medium (18px).
  - Meta row: 📌 Location | 🗓 Closing date | 👤 Posts count.
  - Bottom: "More Details" ghost button + "Apply" primary button.
  - Closing soon indicator: amber banner if closing within 7 days.

### 3.2 Vacancy Detail (`/vacancies/:id`)

- Breadcrumb: Home > Vacancies > [Post Title]
- Two-column layout (desktop): main content left (70%), sidebar right (30%).
- Left: Post title (Playfair H1), employer badge, gold divider.
  - Sections: Qualifications Required | Duties & Responsibilities | Salary Scale.
  - Each section uses an arched card with blue-tinted header strip.
- Right sidebar: Sticky card.
  - Posts available, closing date countdown, employer logo/name.
  - Large "Apply Now" primary button.
  - "Share" and "Save" actions.

### 3.3 Login (`/login`)

- Centered card, max-width 420px, on `#F5F8FC` page background.
- Card: white, `border-radius: 20px`, `box-shadow: 0 8px 32px rgba(27,79,114,0.12)`.
- Top: ZanAjira emblem + "Sign In" heading in Playfair.
- Fields: Email, Password (with show/hide toggle eye icon).
- "Lost Password?" link below password field.
- Primary "Sign In" button (full width, blue, rounded).
- Divider + "New to ZanAjira? Register" link.
- Error state: red-bordered inputs, inline error message with alert icon.

### 3.4 Register (`/register`)

- Same card style as Login.
- Fields: Email, Password, Confirm Password.
- Password strength indicator bar below password field (weak/medium/strong).
- Requirements checklist (8+ chars, letters, numbers, symbols) — checks appear in real time.
- Primary "Create Account" button.
- Post-submit: Success state showing email illustration + "Check your inbox" message.

---

## 4. Applicant Portal Pages

### 4.1 Dashboard / Home (`/dashboard`)

- **Welcome banner:** `"Habari, [First Name]!"` with a subtle turquoise gradient. Shows profile completion ring + motivational message.
- **Profile Completion Card:** Large, prominent. Shows percentage ring (animated on load), list of incomplete sections with completion status dots, "Complete Profile" CTA.
- **Open Vacancies:** Same card grid as public, but with "Apply" buttons active.

### 4.2 Profile Sections (General Pattern)

All profile sections share a consistent page structure:

```
┌─────────────────────────────────────────────────────┐
│  PAGE HEADER                                        │
│  Section icon + Title in Playfair H2                │
│  Section description in muted text                  │
│  Completion status badge (Complete / Incomplete)    │
├─────────────────────────────────────────────────────┤
│  FORM CARD (white, rounded, shadowed)               │
│  Form fields with floating labels                   │
│  File upload zones (dashed border, PDF icon)        │
│  Save button (bottom right, primary blue)           │
└─────────────────────────────────────────────────────┘
```

**Form Design:**
- Floating labels (labels lift above field on focus/fill).
- Focus ring: `2px solid #1B4F72` with glow effect.
- Required field asterisk: gold `*`.
- Error state: red border + error message below.
- Select dropdowns: custom styled (no browser default).
- File upload zones: dashed blue border, PDF icon center, drag-and-drop or click. Shows file name + size + remove button after upload.

### 4.3 Personal Details (`/profile/personal`)

- **ZanID input:** Prominent, large, monospace font, 9-digit input with auto-format.
  - After valid ZanID entry: animated checkmark + "Fetching details from ZanID..." skeleton shimmer → auto-fills fields with a success flash.
  - Pre-filled fields shown with a lock icon (read-only from ZanID).
- **Photo upload:** Circular upload zone (128px). Shows preview after upload.
- **Supplementary fields:** Originality, Government Employment Status, Marital Status, Impairments — styled as select dropdowns.

### 4.4 Academic Qualifications (`/profile/academic`)

- **Add Qualification form** at top (collapsed by default, expands on "Add Qualification" click).
- **Qualifications list:** Table or card list showing each entry with:
  - Education level badge (color-coded: e.g., PhD = dark blue, Degree = medium blue, CSE = light blue).
  - Institution + Programme + Years.
  - Certificate status icon (✅ uploaded / ⚠️ missing).
  - Edit | Delete actions.
- **Conditional upload zones:** TCU / NACTE / NECTA upload fields appear conditionally based on education level + country selection.
- **Lost cert declaration:** Toggle switch reveals index number + year fields.

### 4.5 Language Proficiency (`/profile/language`)

- Add language form: Language selector + three rating groups (Speaking, Reading, Writing).
- Rating: Three pill buttons per skill — `Fair` | `Good` | `Very Good`. Selected pill: blue fill.
- Table below showing added languages with delete action.

### 4.6 Work Experience (`/profile/experience`)

- "Current Job" toggle: When enabled, End Date field is replaced with a "Current" badge.
- Multi-entry card list with collapse/expand for long duty descriptions.

### 4.7 Computer Literacy (`/profile/computer`)

- Three skill cards side-by-side: **MS Word**, **MS Excel**, **MS PowerPoint**.
- Each card: app icon (colored), proficiency selector (Fair / Good / Very Good), optional cert upload.
- Cards animate in with a staggered fade.

### 4.8 CV Preview (`/cv`)

- Print-optimized layout inside a white A4-proportioned card (820px wide on desktop).
- Header: Name (Playfair, 28px), ZanID, photo (if uploaded), contact info.
- Sections separated by a thin gold divider.
- "Print CV" button (fixed bottom-right, gold, with printer icon).
- Watermark: very faint "ZanAjira" diagonal text on the card.

### 4.9 Apply for Vacancy (`/vacancies/:id/apply`)

- Multi-step flow (3 steps shown in a step indicator bar):
  1. **Review** — confirms profile completion %, shows vacancy summary.
  2. **Declaration** — read-only declaration text + acknowledgement checkbox.
  3. **Upload & Submit** — application letter PDF upload zone (max 1MB), "Confirm Application" button.
- If profile < 70%: Step 1 shows a blocking alert with a progress ring and "Complete Your Profile" CTA. Cannot proceed.

### 4.10 My Applications (`/applications`)

- Table: Employer | Post Title | Date Applied | Closing Date | Status.
- Status badges (colored pills):
  - `received` — blue pill.
  - `in_progress` — amber pill.
  - `shortlisted` — purple pill.
  - `placed` — green pill.
  - `rejected` — red pill.
- "Replace Letter" button shown only when status is `received`/`in_progress` and not past closing date.
- Empty state: Illustration (dhow on ocean) + "You haven't applied for any vacancies yet."

---

## 5. Admin Portal Pages

### 5.1 Admin Dashboard (`/admin/dashboard`)

- **Stats row** — 4 KPI cards:
  - Total Applicants (large number, rising animation on load).
  - New Applicants (with trend arrow).
  - In Progress.
  - Placements (green accent).
- **Bar chart** (Recharts) — "Applicants by Employer". Bars in blue gradient, gold hover accent. Toggle between Applicants view and Users view.
- **Current Employers table** — compact: Employer name | Applications count | Posts | Last activity.
- **Recent Audit Activity** — last 5 log entries in a scrollable mini-feed.

### 5.2 Vacancy Management (`/admin/vacancies`)

- Page header + "Create Vacancy" primary button (top right).
- TanStack Table: Post Title | Employer | Posts | Closing Date | Status | Actions.
- Status column: `draft` (grey), `published` (blue), `closed` (muted).
- Row actions: Edit (pencil) | Publish/Close (toggle) | View Applicants (people icon) | Delete (trash).
- "Create Vacancy" modal: full form with all fields, rich textarea for qualifications and duties.

### 5.3 Applicant Pipeline (`/admin/vacancies/:id/applicants`)

- Vacancy header card showing post title, employer, closing date, total applications count.
- Kanban-style view (or toggle to table):
  - Columns: Received | In Progress | Shortlisted | Placed | Rejected.
  - Applicant mini-cards showing name, ZanID, profile %, applied date.
  - Drag between columns to change status (or action buttons).
- Detail drawer: Click applicant to open right-side drawer with their full profile summary, CV download, and status action buttons.

### 5.4 Generic CRUD Tables (Academic, Professional, Reference Data)

- Consistent layout: page title + description + "Add [Item]" button.
- Table with Name | Type | Country (where applicable) | Edit | Delete.
- Add/Edit: Inline row edit or small modal form.
- Delete: Confirmation dialog.

### 5.5 Audit Logs (`/admin/audit-logs`)

- Filterable by: User | Action | Resource | Date range.
- Table: Timestamp | User | Action | Resource | IP Address.
- Row expand: shows `metadata_json` in a formatted code block.

### 5.6 System Config (`/admin/config`)

- Settings form grouped into categories:
  - **File Limits:** Max cert size (default 2MB), Max letter size (default 1MB).
  - **Profile Threshold:** Minimum % to apply (default 70%).
  - **Session:** Inactivity timeout (default 30 mins).
  - **Email Templates:** Rich text editors for activation, reset, confirmation emails.
- Save button per section, with success toast on save.

---

## 6. Shared Components

### 6.1 ProfileProgressBar

- Horizontal bar, full width of its container.
- Background: `#E2EAF4`. Fill: gradient from blue to gold as it approaches 100%.
- Label: `"85% Complete"` right-aligned.
- Threshold marker line at 70% with a small `"Min to Apply"` tooltip.

### 6.2 FileUploadInput

- Dashed border box (`border: 2px dashed #1B4F72`), `border-radius: 12px`.
- Center: PDF icon + "Drag & drop or click to upload" + "PDF only, max 2MB".
- Hover state: light blue fill.
- After upload: file name chip with size + red remove X button.
- Error (wrong type or oversized): red border + error message.

### 6.3 StatusBadge

| Status | Background | Text | Icon |
|--------|-----------|------|------|
| received | `#DBEAFE` | `#1B5FA6` | 📩 |
| in_progress | `#FEF3C7` | `#92400E` | ⏳ |
| shortlisted | `#EDE9FE` | `#5B21B6` | ⭐ |
| placed | `#D1FAE5` | `#065F46` | ✅ |
| rejected | `#FEE2E2` | `#991B1B` | ✗ |

### 6.4 Toast / Notification System

- Slide-in from top-right.
- Types: success (green) | error (red) | info (blue) | warning (amber).
- Auto-dismiss after 4 seconds. Manual close X.

### 6.5 Modal / Dialog

- Centered overlay. Backdrop: `rgba(26,41,64,0.55)` blur.
- Card: white, `border-radius: 20px`, max-width 560px.
- Header: Playfair title + close X.
- Footer: Cancel ghost button + Confirm primary button.

### 6.6 Empty States

Each empty state has:
- A custom SVG illustration with a Zanzibar motif (dhow, coral, geometric tile, carved door).
- A Playfair heading.
- A muted description.
- A CTA button.

### 6.7 Skeleton Loaders

- Grey shimmer animations for: vacancy cards, table rows, profile sections.
- Used while API data is loading.

---

## 7. Interaction & Motion Design

### 7.1 Page Load Sequence

1. Layout fades in (0ms, 200ms).
2. Header slides down (100ms delay, 300ms).
3. Main content cards stagger in from bottom (200ms, 150ms between each).
4. Numbers in stat cards count up (500ms, easing out).

### 7.2 Micro-Interactions

- **Buttons:** Scale `0.97` on active press. Blue glow `box-shadow` on hover.
- **Form fields:** Label floats up on focus with a smooth `200ms` transition.
- **Sidebar links:** Left border slides in on hover.
- **Progress bar:** Smooth width transition on value change (`transition: width 800ms ease`).
- **Status badges:** Pulse animation on `in_progress` status.
- **ZanID field:** Success state: border turns green, field glows, auto-fill animation plays.

### 7.3 Responsive Breakpoints

| Breakpoint | Layout changes |
|---|---|
| Mobile `< 640px` | Single column, sidebar collapses to bottom nav, hero reduces height |
| Tablet `640–1024px` | Two columns, sidebar becomes collapsible overlay |
| Desktop `> 1024px` | Full three-pane layout |

---

## 8. Bilingual (EN / SW) Interface

- Language toggle in header: `EN | SW`.
- All labels, headings, buttons, error messages, and empty states translated.
- Kiswahili example translations:
  - "Sign In" → "Ingia"
  - "Register" → "Jisajili"
  - "Apply" → "Omba"
  - "Profile Complete" → "Wasifu Umekamilika"
  - "My Applications" → "Maombi Yangu"
  - "Vacancies" → "Nafasi za Kazi"

---

## 9. Accessibility

- All interactive elements have `aria-label`.
- Color contrast ratio ≥ 4.5:1 for all text.
- Focus indicators visible and styled (gold ring).
- Form errors linked to fields via `aria-describedby`.
- Loading states announced via `aria-live="polite"`.
- Skip-to-main link at top of page.

---

*UI Documentation — ZanAjira Portal v1.0*
*Civil Service Commission, Revolutionary Government of Zanzibar*
