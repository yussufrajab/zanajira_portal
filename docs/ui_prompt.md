# ZanAjira Portal — UI Prompt for Claude Code

> **How to use this file:**
> Open this file together with `ui_documentation.md` and `technology_used.md` in your Claude.ai session, then paste the prompt from whichever section you are working on into Claude Code. The three files together give Claude Code full context to produce a perfect, production-grade UI.

---

## MASTER PROMPT — Read This First (Paste into Claude Code at Start of Session)

```
You are building the frontend UI for ZanAjira — a government civil service job application portal for the Revolutionary Government of Zanzibar (portal.zanajira.go.tz). This is a real production system replacing paper-based recruitment. Citizens use it to apply for government jobs. It must be beautiful, dignified, trustworthy, and fast.

I am providing you with three reference documents:
1. ui_documentation.md — Describes every screen, layout, component, and interaction.
2. technology_used.md — Describes the exact tech stack, dependencies, routing, and API.

Before writing any code, read both documents in full. They are your authoritative source of truth.

DESIGN MANDATE — Follow these exactly:

AESTHETIC DIRECTION: "Refined Coastal Governance" — official and trustworthy like a government portal, but beautiful and culturally alive like Zanzibar itself. Think Stone Town architecture meets modern civic design.

COLOR PALETTE (light theme, no dark mode):
- Primary: #1B4F72 (Deep Ocean Blue)
- Primary Light: #D6E8F7
- Accent: #C0932A (Zanzibar Gold)
- Accent Light: #FDF3DC
- Surface: #FFFFFF
- Background: #F5F8FC (cool soft white)
- Border: #E2EAF4
- Text: #1A2940 (primary), #5A7394 (secondary), #9BB2C9 (muted)
- Success: #1A7A4E | Warning: #C07A10 | Danger: #B03030

TYPOGRAPHY:
- Display/Headings: "Playfair Display" (serif, authoritative)
- UI/Body: "DM Sans" (clean, modern)
- Codes/IDs: "JetBrains Mono"
Import these from Google Fonts in index.css.

VISUAL LANGUAGE:
- Subtle Islamic geometric / mashrabiya patterns (SVG) as hero backgrounds at ~8% opacity.
- Soft grain texture on dividers.
- Gold on deep blue is the signature combination.
- Cards: white, border-radius 16px, box-shadow 0 4px 24px rgba(27,79,114,0.08).
- Buttons: Deep blue primary, gold accent secondary, ghost tertiary.
- Floating label inputs (label lifts on focus).
- Every empty state has a custom SVG illustration with a Zanzibar motif (dhow, coral, carved door, geometric tile).

MOTION:
- Page content staggered fade-in on load (cards appear 150ms apart).
- Stat numbers count up on dashboard load.
- Progress bars animate width on mount.
- Buttons scale(0.97) on press + glow shadow on hover.
- ZanID successful fetch: green flash + shimmer auto-fill animation.

ABSOLUTE RULES:
- NEVER use Inter, Roboto, Arial, or system fonts.
- NEVER use generic purple-gradient-on-white aesthetics.
- NEVER use flat, colourless, or sterile "government grey" design.
- ALWAYS use the exact colour palette above.
- ALWAYS import Playfair Display + DM Sans + JetBrains Mono.
- ALWAYS use Tailwind utility classes (configured with custom theme in tailwind.config.js).
- Use shadcn/ui primitives (Button, Input, Select, Dialog, Badge, etc.) as the base layer.
- All text must support both English and Kiswahili via react-i18next.
```

---

## SECTION PROMPTS

Use these targeted prompts in Claude Code, one section at a time. Always provide the master prompt context first.

---

### PROMPT 1 — Foundation Setup (Run First)

```
Set up the complete foundation for ZanAjira's frontend in zanajira-web/.

1. TAILWIND CONFIG — Update tailwind.config.js with this exact custom theme:
   Colors: primary #1B4F72, primary-light #D6E8F7, accent #C0932A, accent-light #FDF3DC, surface #FFFFFF, background #F5F8FC, border #E2EAF4, text-primary #1A2940, text-secondary #5A7394, text-muted #9BB2C9, success #1A7A4E, warning #C07A10, danger #B03030, info #1B5FA6.
   Font families: display (Playfair Display), body (DM Sans), mono (JetBrains Mono).
   Border radius: card 16px, modal 20px, pill 9999px.
   Box shadows: card "0 4px 24px rgba(27,79,114,0.08)", card-hover "0 8px 32px rgba(27,79,114,0.14)", modal "0 16px 64px rgba(26,41,64,0.18)".

2. INDEX CSS — In src/index.css:
   Import Playfair Display (400, 600, 700) + DM Sans (400, 500, 600) + JetBrains Mono (400, 600) from Google Fonts.
   Set body to DM Sans. Set font-display elements to Playfair Display.
   Add CSS custom properties matching the colour palette.
   Add a subtle geometric SVG background pattern (Islamic tile / mashrabiya-inspired) as a CSS data URI for use in hero sections.
   Add floating label CSS animation: label transforms on input focus/filled state.

3. I18N SETUP — Create src/i18n/index.ts with react-i18next.
   Create src/i18n/en.json and src/i18n/sw.json with translations for: nav items, form labels, button text, error messages, empty state text, and status labels.

4. API INSTANCE — Create src/lib/api.ts:
   Axios instance with baseURL http://localhost:8080/api and withCredentials: true.
   Request interceptor: attach Bearer token from Zustand auth store.
   Response interceptor: auto-refresh on 401, then retry.

5. AUTH STORE — Create src/store/authStore.ts with Zustand:
   State: user (id, email, role), accessToken.
   Actions: login, logout, refresh, setUser.

6. PROFILE STORE — Create src/store/profileStore.ts with Zustand:
   State: completionPct, all profile section data.
   Actions: fetchProfile, updateCompletion.

After setup, confirm each file is created and working correctly.
```

---

### PROMPT 2 — Shared Components

```
Build the following shared components for ZanAjira in src/components/. Each must be beautiful, functional, and fully typed in TypeScript.

1. ProfileProgressBar.tsx
   - Horizontal pill bar showing completion percentage (0–100%).
   - Background: #E2EAF4. Fill: gradient from #1B4F72 to #C0932A as it increases.
   - Animated width transition (800ms ease) on mount and value change.
   - A vertical marker line at exactly 70% with a small "Min to Apply" tooltip.
   - Label: "85% Complete" shown right-aligned in DM Sans.
   - Below 70%: warning text "Complete your profile to apply for vacancies."
   - At/above 70%: success text with checkmark "You can now apply for vacancies!"

2. FileUploadInput.tsx
   Props: label, name, maxSizeMB (number), accept ('.pdf'), onUpload, onRemove, error?, existingFileUrl?
   - Dashed border box (2px dashed #1B4F72), border-radius 12px, min-height 120px.
   - Center content: PDF red icon + "Drag & drop or click to upload" + "PDF only, max {maxSizeMB}MB".
   - Hover: light blue fill (#D6E8F7), border solid.
   - Drag-over: stronger blue border + scale(1.02).
   - After upload: file name chip (blue background) with size + red X remove button.
   - Error state: red border + error message below with warning icon.
   - Client-side validation: reject non-PDF, reject oversized.

3. StatusBadge.tsx
   Props: status ('received' | 'in_progress' | 'shortlisted' | 'placed' | 'rejected')
   - Styled pill badges with the exact colours from the design system:
     received: #DBEAFE bg, #1B5FA6 text, 📩 icon
     in_progress: #FEF3C7 bg, #92400E text, ⏳ icon (pulse animation)
     shortlisted: #EDE9FE bg, #5B21B6 text, ⭐ icon
     placed: #D1FAE5 bg, #065F46 text, ✅ icon
     rejected: #FEE2E2 bg, #991B1B text, ✗ icon
   - Font: DM Sans 500, 13px, letter-spacing 0.02em.

4. ZanIDInput.tsx
   - Large monospace input field (JetBrains Mono) for 9-digit ZanID.
   - Auto-formats as user types (9 digits only, no letters).
   - Three states:
     a. Empty: blue border, helper text "Enter your 9-digit Zanzibar National ID".
     b. Loading: spinner + "Fetching from ZanID..." skeleton overlay on adjacent fields.
     c. Success: green border + checkmark icon + shimmer animation as fields auto-fill.
     d. Error: red border + "Invalid ZanID or service unavailable."
   - Calls the ZanID API on valid 9-digit entry (debounced 500ms).

5. EmptyState.tsx
   Props: illustration ('no-vacancies' | 'no-applications' | 'no-results' | 'no-data'), title, description, ctaLabel?, ctaOnClick?
   - Large centered layout with custom SVG illustration for each type:
     no-vacancies: dhow sailing on geometric waves
     no-applications: empty folder with Zanzibar Gold star
     no-results: magnifying glass over mashrabiya pattern
     no-data: coral stone arch with birds
   - Playfair Display title (22px), muted description (DM Sans), optional CTA button.

6. SkeletonCard.tsx
   - Grey shimmer placeholder for vacancy cards and table rows.
   - Animated via CSS keyframes (shimmer sweep left to right).
   - Variants: 'card' | 'table-row' | 'profile-section'.

7. Toast system (using shadcn/ui's Toaster):
   - Extend with ZanAjira styling: success (green), error (red), info (blue), warning (amber).
   - Slide in from top-right, auto-dismiss 4 seconds.

Export all components from src/components/index.ts.
```

---

### PROMPT 3 — Layouts

```
Build the three main layout components for ZanAjira in src/layouts/.

1. PublicLayout.tsx
   Wrapper for all public/unauthenticated pages.

   HEADER (sticky, z-50):
   - 4px gold (#C0932A) top accent border (not shadow — actual border).
   - White background, 1px solid #E2EAF4 bottom border.
   - Height: 68px.
   - Left: Government emblem (circular SVG seal, deep blue) + "ZanAjira" in Playfair Display bold 24px + subtitle "portal.zanajira.go.tz" in text-muted 11px below.
   - Center (desktop only): "Portal ya Maombi ya Kazi za Serikali" in small-caps DM Sans, text-secondary.
   - Right: Language toggle (EN | SW pills) + "Sign In" button (primary blue) + "Register" ghost button.
   - Mobile: hamburger menu, collapsible nav drawer from right.
   - Smooth scroll behaviour. Header slightly compresses (60px) on scroll.

   FOOTER:
   - Background: #1A2940. Text: #C8D8E8.
   - Three columns: About ZanAjira | Quick Links | Contact.
   - Contact: info@zanajira.go.tz | habari@zanajira.go.tz
   - Bottom strip: "© 2026 Civil Service Commission, Revolutionary Government of Zanzibar | Developed by eGaz | Version 1.0.0"
   - Small ZanAjira emblem (white version) centered at top of footer.

2. ApplicantLayout.tsx
   Wrapper for all authenticated applicant pages.

   SIDEBAR (fixed, 260px wide):
   - White background. Right border: 1px solid #E2EAF4.
   - Top section: Circular avatar (80px) showing passport photo or gold initials circle. Below: Name in DM Sans 600, ZanID in JetBrains Mono text-muted small.
   - Profile completion ring (80px circular SVG progress indicator, animated):
     Below 70%: amber ring with percentage inside.
     70%+: blue ring with gold tick inside.
   - Navigation links (with Lucide icons, 16px):
     Personal Details (UserRound), Contact Details (MapPin), Academic Qualifications (GraduationCap), Professional Qualifications (Award), Language Proficiency (Globe), Work Experience (Briefcase), Training & Workshops (BookOpen), Computer Literacy (Monitor), Referees (Users), Other Attachments (Paperclip), Declaration (FileCheck), CV Preview (FileText).
   - Active link style: #D6E8F7 background, #1B4F72 text, left 3px solid #C0932A border.
   - Hover: gentle #F5F8FC background, left border slides in with transition.
   - Bottom: "Back to Vacancies" and "Logout" links.
   - Mobile: collapses to a slide-out drawer, triggered by hamburger in top nav.

   TOP NAV (sticky, 64px):
   - White. Box-shadow: 0 1px 8px rgba(27,79,114,0.08).
   - Left: Hamburger (mobile) + Breadcrumb (desktop).
   - Center: ProfileProgressBar component (compact, 200px wide, shows %).
   - Right: "Vacancies" link | "My Applications" link | Avatar dropdown (Change Password, Logout).

3. AdminLayout.tsx
   Wrapper for all admin portal pages.

   SIDEBAR (fixed, 240px):
   - Background: #1A2940. Text: #C8D8E8.
   - Top: White ZanAjira logo + "Admin Portal" label in gold small-caps.
   - Nav groups (with bold section headers in #5A7394 11px uppercase tracked):
     OVERVIEW: Dashboard
     RECRUITMENT: Vacancies, Applicant Pipeline, Applications
     USERS: Staff Management, Roles & Permissions, Audit Logs
     REFERENCE DATA: Academic, Professional, Computer Skills
     ADMIN TOOLS: Employers, Secretariats, Permits, Key Matrices, Schemes of Service
     SYSTEM: System Configuration
   - Active item: #1B4F72 background, white text, left 3px solid #C0932A.
   - Hover: rgba(255,255,255,0.06) background.
   - Bottom: Logged-in user card (avatar + name + role badge + logout icon button).

   TOP BAR (sticky, 60px):
   - Background: white. Box-shadow: 0 1px 8px rgba(27,79,114,0.08).
   - Left: Breadcrumb in text-secondary.
   - Right: Global search input + notification bell icon + admin avatar dropdown.
```

---

### PROMPT 4 — Public Pages

```
Build the following public-facing pages for ZanAjira in src/features/public/.

1. Homepage / VacancyList.tsx (route: /)

   HERO SECTION:
   - Full width, 480px tall.
   - Background: #1B4F72 with a subtle SVG Islamic geometric pattern overlay at 8% opacity (white lines).
   - Decorative gold scallop/arch silhouette SVG along the bottom edge.
   - Large heading: "Karibu ZanAjira" in Playfair Display 56px white, letter-spacing -0.02em.
   - Sub-heading: "Tafuta na Omba Nafasi za Kazi za Serikali ya Zanzibar" in #D6E8F7 18px DM Sans.
   - Search bar below: wide white pill input (placeholder: "Tafuta nafasi za kazi...") + blue "Tafuta" button. Subtle shadow on the bar.
   - Stats strip (3 numbers, animated count-up on load):
     "51,167 Waliojisajili" | "13 Nafasi Wazi" | "23 Waajiri"
     Each in a small white pill card with gold number + blue label.
   - Staggered fade-in animation for all hero elements (0ms, 150ms, 300ms, 450ms).

   VACANCY SECTION:
   - Section heading: "Nafasi za Kazi Zilizopo" in Playfair Display 28px #1A2940, with a 2px gold underline accent.
   - 3-column grid (desktop), 2-column (tablet), 1-column (mobile).
   - Each VacancyCard:
     White card, border-radius 16px, box-shadow card.
     Hover: box-shadow card-hover + translateY(-2px) + left 3px gold accent border appears.
     Top: employer name in gold small-caps 11px (truncated).
     Main: post title in Playfair Display 18px text-primary (2-line clamp).
     Meta row: 📌 [Location] | 🗓 [Closing Date] | 👤 [N] Posts — in text-secondary 13px.
     "Closing Soon" amber banner (amber bg, amber text) if closing within 7 days.
     Bottom: "Maelezo Zaidi" ghost button (left) + "Omba" primary button (right).
   - Loading: 6 SkeletonCard components.
   - Empty: EmptyState with no-vacancies illustration.
   - Pagination: simple page number buttons at bottom (blue active, ghost inactive).

2. VacancyDetail.tsx (route: /vacancies/:id)

   - Breadcrumb: Home > Nafasi za Kazi > [Post Title]
   - Two-column layout (70/30), stacks on mobile.
   - Left (main):
     Post title in Playfair Display H1 (32px), deep blue.
     Employer badge: gold pill with employer name.
     Gold divider (2px, 60px wide, left-aligned).
     Three content sections each in an arched-top card (the arch is a CSS border-radius trick on the top-left and top-right, with a blue header strip):
       "Sifa Zinazohitajika" (Qualifications), "Majukumu na Wajibu" (Duties), "Kiwango cha Mshahara" (Salary Scale).
     Each section header: blue background, white Playfair Display title, 12px.
     Body: prose text in DM Sans 15px, line-height 1.7.
   - Right sidebar (sticky):
     White card, border-radius 16px.
     Posts available: large gold number + "Posts Available" label.
     Closing date: with countdown (e.g., "Closes in 14 days").
     Employer name + contact.
     Large "Omba Sasa" primary button (full width, 48px tall).
     "Share" and "Bookmark" ghost icon buttons below.

3. Login.tsx (route: /login)

   - Centered container, max-width 420px, vertically centered in viewport.
   - Background: page background #F5F8FC with very faint geometric pattern.
   - Card: white, border-radius 20px, box-shadow modal.
   - Animate in: scale(0.96)→scale(1) + opacity 0→1, 300ms ease-out.
   - Top: ZanAjira emblem (48px) + "Ingia" / "Sign In" in Playfair 28px, centered.
   - Sub: "Karibu tena kwenye ZanAjira" text-secondary 14px.
   - Email field: floating label, full-width.
   - Password field: floating label + show/hide toggle eye icon (Lucide Eye/EyeOff).
   - "Umesahau neno la siri?" / "Lost Password?" link — right-aligned, text-secondary, 13px.
   - "Ingia" / "Sign In" primary button, full width, 48px tall.
   - Divider with "au" / "or".
   - "Jisajili sasa" / "Register now" link.
   - Error alert (shadcn Alert, danger variant) sliding down when credentials fail.

4. Register.tsx (route: /register)

   - Same card style as Login.
   - Title: "Unda Akaunti" / "Create Account".
   - Fields: Email, Password, Confirm Password — all floating label.
   - Password strength bar below password field:
     1-bar red (weak), 2-bar amber (medium), 3-bar green (strong).
     Strength criteria checklist below (8+ chars ✓, letters ✓, numbers ✓, symbols ✓) — icons change to green checks in real time.
   - "Unda Akaunti" primary button.
   - After submit success: card transforms (fade out form, fade in success state):
     Large email illustration (envelope with gold star), "Angalia Barua Pepe Yako!" / "Check your inbox!", muted instruction text.

5. Activate.tsx (route: /activate/:token)
   - Centered card. Three states:
     Loading: spinner + "Inakagua akaunti yako..."
     Success: animated checkmark (green) + "Akaunti yako imefunguliwa!" + "Ingia sasa" button.
     Error: X icon (red) + "Kiungo hakifanyi kazi au kimekwisha muda" + "Omba kiungo kipya" button.

6. ForgotPassword.tsx + ResetPassword.tsx
   - Same card style. Simple, clean forms. Success states with illustration.
```

---

### PROMPT 5 — Applicant Profile Pages

```
Build the applicant profile pages in src/features/applicant/profile/. All pages use ApplicantLayout. Each page follows the consistent structure from ui_documentation.md Section 4.2.

Build these components:

1. PersonalDetails.tsx
   - Page header: UserRound icon (gold, 28px) + "Taarifa za Kibinafsi" H2 + completion badge.
   - ZanIDInput component (prominent, full-width, with all three states: empty, loading, success).
   - Auto-filled read-only fields (with lock icon, slightly grey background): First Name, Last Name, Sex, Date of Birth, Nationality.
   - Editable fields: Originality, Government Employment Status, Marital Status, Impairments — all custom-styled Select dropdowns.
   - Passport photo upload: circular upload zone (128px diameter), shows preview after upload, with edit overlay on hover.
   - Save button (bottom right, primary blue).

2. ContactDetails.tsx
   - Fields: Country, State/City, Province/County, Mobile Number, Alternative Email, Present Address (textarea).
   - Birth Certificate upload zone (FileUploadInput, max 2MB).

3. AcademicQualifications.tsx
   - "Add Qualification" button (+ icon, gold) opens an animated accordion/drawer form.
   - Form fields: Education Level (Select with all 10 levels), Country, Institution (searchable Command component), Programme (filtered by level+institution), Year From/To (number inputs), GPA/Result.
   - Certificate upload zone. Conditional additional upload zones that appear based on: degree+foreign → TCU; diploma+foreign → NACTE; secondary+foreign → NECTA.
   - Lost certificate toggle: Switch component → reveals Index Number + Year fields.
   - Qualifications list below: card for each entry.
     Education level colored badge (PhD: #1A2940, Masters: #1B4F72, Degree: #2B6CB0, Diploma: #3182CE, Advanced: #4299E1, Certificate: #63B3ED, CSE/ACSE: #90CDF4).
     Institution + Programme + Years. Certificate status icon. Edit | Delete actions.

4. LanguageProficiency.tsx
   - Add language form: Language input + three rating rows (Speaking, Reading, Writing).
   - Each rating: three pill buttons (Fair | Good | Very Good). Selected: blue fill, white text. Unselected: white with blue border.
   - Languages table below: Language | Speaking | Reading | Writing | Delete.

5. WorkExperience.tsx
   - Multi-entry form. "Current Job" Switch — when on, End Date is replaced by a "Sasa Hivi / Current" green badge.
   - Duties field: Textarea with character count.
   - Entry cards in list below with collapse/expand for long duty text.

6. ComputerLiteracy.tsx
   - Three side-by-side skill cards (stagger-in animation, 100ms apart):
     MS Word (blue W icon), MS Excel (green X icon), MS PowerPoint (red P icon).
   - Each card: app icon (32px colored SVG) + skill name + proficiency rating pills (Fair/Good/Very Good) + optional cert upload.
   - Cards have a subtle selected state (light blue tint when proficiency is set).

7. Declaration.tsx
   - Warning card (amber background) explaining the legal significance.
   - Declaration text in a scrollable box (max-height 200px, border).
   - Large Checkbox (shadcn) with label: "Nathibitisha kwamba taarifa zote nilizotoa ni za kweli..." / legal text.
   - Submit button: only enabled when checkbox is checked.
   - After submit: success state with green banner.
```

---

### PROMPT 6 — CV Preview & Application Flow

```
Build the CV Preview and Application flow pages.

1. CVPreview.tsx (route: /cv)
   - Outer wrapper: white A4-proportioned card (max-width 820px, centered, top/bottom margin).
   - Print button: fixed bottom-right, gold background, white printer icon, "Chapisha CV" label.
   - Very faint diagonal "ZanAjira" watermark text on the card (opacity 0.04).
   - CV card structure:
     HEADER: Name in Playfair Display 28px, ZanID badge (mono font, blue pill), photo (80px circle, right-aligned), Contact info row below.
     Gold divider (3px, full width).
     SECTIONS (each with a Playfair section heading + thin gold underline):
       Language Proficiency | Academic Qualifications | Work Experience | Trainings & Workshops | Computer Literacy.
     Each section item: clean table-like layout with dates right-aligned in text-muted.
   - Print styles: @media print — hide everything except the CV card, set page margins, remove watermark opacity, force white background.

2. ApplyFlow.tsx (route: /vacancies/:id/apply)
   - Step indicator bar at top: 3 steps ("Kagua" / Review, "Tamko" / Declaration, "Wasilisha" / Submit). Current step: filled blue circle + gold underline. Completed: green checkmark.
   - STEP 1 — Review:
     If profile >= 70%: green completion ring (80px) + "Wasifu wako uko tayari!" + vacancy summary card.
     If profile < 70%: blocking red alert card — completion ring (amber, shows %) + warning message + "Kamilisha Wasifu" button. Cannot proceed.
   - STEP 2 — Declaration:
     Scrollable declaration text box. Checkbox to acknowledge. "Niendelee" / "Continue" button enabled only when checked.
   - STEP 3 — Upload & Submit:
     FileUploadInput for application letter (max 1MB, PDF only).
     Vacancy summary (right column, sticky).
     "Thibitisha Maombi" / "Confirm Application" primary button (full width, 48px).
     Loading state on submit: button shows spinner + "Inatuma...".
     Success state: animated checkmark + "Maombi yako yametumwa!" + "Angalia Maombi Yangu" link.

3. MyApplications.tsx (route: /applications)
   - Page title: "Maombi Yangu" / "My Applications" with application count badge.
   - TanStack Table: Employer | Post Title | Date Applied | Closing Date | Status | Actions.
   - Status column: StatusBadge component.
   - Actions column: "Badilisha Barua" (Replace Letter, ghost button) — visible only when status is received/in_progress and not past closing date.
   - Row hover: light blue background.
   - Empty state: EmptyState component with 'no-applications' illustration.
   - Replace Letter modal: FileUploadInput + confirm button.
```

---

### PROMPT 7 — Admin Dashboard & Management

```
Build the admin portal pages in src/features/admin/.

1. AdminDashboard.tsx (route: /admin/dashboard)
   - Page title: "Dashibodi" / "Dashboard" + last-updated timestamp in text-muted.
   - STATS ROW (4 cards, stagger-in on load):
     Each card: white, border-radius 16px, shadow.
     Large animated count-up number (DM Sans 800, 40px) + label (DM Sans 500, 14px) + icon (Lucide, 32px, coloured).
     Total Applicants (#1B4F72 icon), New (#C0932A icon, gold), In Progress (#C07A10 icon, amber), Placements (#1A7A4E icon, green).
     Subtle trend arrow below number (▲ or ▼ in green/red).
   - BAR CHART (Recharts BarChart):
     Title: "Maombi kwa Mwajiri" / "Applications by Employer".
     Toggle buttons: "Waombaji" | "Watumiaji".
     Bars: gradient fill from #1B4F72 to #4A90D9. Hover: gold (#C0932A) fill.
     X-axis: employer names (truncated), Y-axis: counts.
     Tooltip: custom styled (white card, shadow, DM Sans).
   - CURRENT EMPLOYERS TABLE:
     Compact table: Employer | Applications | Posts | Status.
     Striped rows (light blue on alternate rows).
   - RECENT AUDIT ACTIVITY:
     Mini feed of last 5 audit entries. Each: avatar (initials) + "User X [action] [resource]" + time-ago in text-muted.

2. VacancyManagement.tsx (route: /admin/vacancies)
   - Header: "Usimamizi wa Nafasi za Kazi" + "Unda Nafasi Mpya" primary button (top right, + icon).
   - TanStack Table with columns: Post Title | Employer | Posts | Location | Closing Date | Status | Actions.
   - Status column: coloured badges (draft: grey, published: blue, closed: muted).
   - Actions: Edit (pencil icon) | Publish/Close (toggle icon) | View Applicants (Users icon) | Delete (trash icon, red, with confirm dialog).
   - Filter bar above table: search input + status filter select + employer filter select.
   - "Unda Nafasi Mpya" modal (Dialog, max-width 640px):
     Form: Post Title, Employer (Select), Number of Posts, Location (Unguja/Pemba/Both), Salary Scale, Closing Date (date picker), Qualifications (Textarea), Duties (Textarea).
     Footer: Cancel + "Hifadhi Rasimu" (Save Draft) + "Chapisha" (Publish) buttons.

3. VacancyApplicants.tsx (route: /admin/vacancies/:id/applicants)
   - Vacancy header card (full width, blue gradient, white text): Post Title | Employer | Closing Date | Total Applications count.
   - View toggle: "Jedwali" (Table) | "Kanban" (Board). Default table.
   - TABLE VIEW:
     Columns: Name | ZanID | Profile % | Applied Date | Status | Actions.
     Actions: "Angalia" (view detail), status change dropdown.
   - KANBAN VIEW:
     5 columns: Received | In Progress | Shortlisted | Placed | Rejected.
     Each column header: count badge.
     Applicant mini-cards: name (DM Sans 600) + ZanID badge + profile % pill + applied date.
     Draggable between columns (or action buttons to change status).
   - DETAIL DRAWER (shadcn Sheet from right, 480px):
     Applicant name + photo (or initials) at top.
     Profile completion ring + key stats.
     Scrollable sections: Personal Info, Academic Qualifications, Work Experience, Referees.
     Action buttons at bottom: Shortlist | In Progress | Reject | Place — with confirmation.

4. GenericCRUD.tsx (used for all reference data tables)
   - Reusable component accepting: title, description, columns, data, addFormFields, editFormFields.
   - Renders: page header + "Ongeza" (Add) button + TanStack Table + Add/Edit Modal + Delete confirmation.
   - Used for: Academic Levels, Institutions, Programmes, Professional Courses, Computer Skills, etc.

5. AuditLogs.tsx (route: /admin/audit-logs)
   - Page title: "Kumbukumbu za Mfumo" / "Audit Logs".
   - Filter row: User search | Action type select | Resource select | Date range picker.
   - Table: Timestamp | User (with avatar initials) | Action (coloured badge) | Resource | IP Address | Expand icon.
   - Row expand: reveals metadata_json in a styled code block (dark background, monospace, syntax highlighted).

6. SystemConfig.tsx (route: /admin/config)
   - Grouped settings form.
   - Section: "Mipaka ya Faili" (File Limits) — Max cert size input (MB) | Max letter size input (MB).
   - Section: "Ukamilishaji wa Wasifu" (Profile Threshold) — Minimum % slider (default 70, range 50–100).
   - Section: "Muda wa Kikao" (Session) — Inactivity timeout minutes input.
   - Each section has its own "Hifadhi" (Save) button. Success toast on save.
```

---

### PROMPT 8 — Accessibility, Animation Polish & Responsive Fixes

```
Review and polish the entire ZanAjira frontend for the following:

1. ACCESSIBILITY:
   - Add aria-label to all icon-only buttons (hamburger, close X, eye toggle, etc.).
   - Ensure all form errors are linked via aria-describedby.
   - All custom Select dropdowns must have correct ARIA roles.
   - Add role="alert" aria-live="polite" to toast container.
   - Ensure color contrast ≥ 4.5:1 everywhere (especially text-secondary #5A7394 on white).
   - Add a "Skip to main content" link as the first element in each layout.
   - Ensure all interactive elements are keyboard-navigable (Tab/Enter/Space/Escape).

2. MOTION POLISH:
   - Audit all page load animations — ensure stagger timings are consistent (150ms between items).
   - Add a reduced-motion media query: @media (prefers-reduced-motion: reduce) removes all transitions and animations.
   - Ensure progress bars use will-change: width for GPU compositing.
   - Add a page transition: when navigating between routes, previous page fades out (150ms), new page fades in (200ms).

3. RESPONSIVE:
   - Mobile (<640px): sidebar becomes bottom drawer. Hero reduces to 320px. Vacancy grid 1-column. Tables become scrollable horizontally with sticky first column.
   - Tablet (640–1024px): sidebar collapsible overlay. Vacancy grid 2-column. Admin sidebar becomes icon-only mode (shows full labels on hover).
   - Ensure touch targets are minimum 44×44px on mobile.
   - Test and fix: admin kanban board stacks vertically on mobile.

4. PERFORMANCE:
   - Add React.lazy() and Suspense for all route components (code splitting).
   - Add loading fallback (SkeletonCard or spinner) for each lazy-loaded page.
   - Ensure images (applicant photos) use loading="lazy".
   - Add error boundaries around each major page section.

5. FINAL CHECKS:
   - Verify all Tailwind classes exist in the custom config (no arbitrary values that bypass the theme).
   - Verify all API calls use the central Axios instance from src/lib/api.ts.
   - Verify all strings visible to users are wrapped in t() for i18n.
   - Verify all form validations show errors in DM Sans 13px text-danger, with the input border in danger red.
   - Remove any console.log statements from production code.
```

---

## QUICK REFERENCE — Design System Snapshot

| Token | Value |
|-------|-------|
| Primary Blue | `#1B4F72` |
| Gold | `#C0932A` |
| Background | `#F5F8FC` |
| Surface | `#FFFFFF` |
| Border | `#E2EAF4` |
| Text | `#1A2940` |
| Text Secondary | `#5A7394` |
| Heading Font | Playfair Display |
| Body Font | DM Sans |
| Mono Font | JetBrains Mono |
| Card Radius | 16px |
| Card Shadow | `0 4px 24px rgba(27,79,114,0.08)` |
| Primary Button | Blue bg, white text, 48px tall, border-radius 9999px |
| Ghost Button | Transparent bg, blue border + text |
| Active Nav Border | 3px solid #C0932A (left edge) |

---

*ZanAjira UI Prompt — v1.0*
*Use alongside ui_documentation.md and technology_used.md*
*Civil Service Commission, Revolutionary Government of Zanzibar*
