# Software Requirements Specification (SRS)
## ZanAjira — Government Job Application Portal
**The Revolutionary Government of Zanzibar — Civil Service Commission**

| Field | Details |
|---|---|
| Document Version | 1.0 |
| Prepared By | Civil Service Commission, Zanzibar |
| System | ZanAjira Portal (portal.zanajira.go.tz) |
| Date | May 2026 |
| Status | Draft |

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Overall Description](#2-overall-description)
3. [System Users and Roles](#3-system-users-and-roles)
4. [Functional Requirements](#4-functional-requirements)
   - 4.1 Public / Unauthenticated Users
   - 4.2 Job Seeker (Applicant) Module
   - 4.3 Admin Portal Module
5. [Non-Functional Requirements](#5-non-functional-requirements)
6. [System Constraints](#6-system-constraints)
7. [External Interface Requirements](#7-external-interface-requirements)
8. [Data Requirements](#8-data-requirements)
9. [Security Requirements](#9-security-requirements)
10. [Assumptions and Dependencies](#10-assumptions-and-dependencies)
11. [Glossary](#11-glossary)

---

## 1. Introduction

### 1.1 Purpose

This Software Requirements Specification (SRS) document defines the functional and non-functional requirements for the **ZanAjira Portal**, a web-based government job application and recruitment management system developed for the Civil Service Commission of the Revolutionary Government of Zanzibar. It serves as the authoritative reference for developers, testers, project managers, and stakeholders throughout the system lifecycle.

### 1.2 Project Scope

ZanAjira is a web-based application portal designed to:

- Simplify and standardize the job application process for job seekers (applicants) in Zanzibar.
- Digitize, automate, and increase transparency in the civil service recruitment process.
- Provide administrators with tools to manage vacancies, applicants, employers, academic records, professional data, and recruitment workflows.
- Replace or reduce manual, paper-based recruitment processes within Zanzibar's public sector.

The system serves two distinct user groups: **Job Seekers (Applicants)** who register, build profiles, and apply for vacancies; and **Administrators** who manage the entire recruitment lifecycle from job posting through placement.

### 1.3 Intended Audience

- Software developers and engineers
- System architects
- Quality assurance and testing teams
- Project managers
- Civil Service Commission stakeholders
- Government ICT compliance officers

### 1.4 Definitions, Acronyms, and Abbreviations

See Section 11 — Glossary.

### 1.5 References

- ZanAjira Portal User Guide Manual, Version 1.0, July 2022
- ZanAjira Portal — portal.zanajira.go.tz (observed system screenshots, May 2026)
- OR-KSUUB / eGaz — Developed and maintained by eGaz (system footer attribution)

---

## 2. Overall Description

### 2.1 Product Perspective

ZanAjira is a standalone, web-based recruitment portal accessible via standard web browsers. It integrates with Zanzibar's national civil identity system (ZanID) for applicant identity verification and profile population. The system has two separate interface layers:

- **Public/Applicant Portal** — `portal.zanajira.go.tz` — used by job seekers and unauthenticated visitors.
- **Admin Portal** — used by Civil Service Commission staff and authorized government employers for recruitment management.

### 2.2 Product Functions (Summary)

**Applicant-facing:**
- Account registration and login
- Profile creation and management (personal, academic, professional, experiential)
- Job vacancy browsing and search
- Job application submission
- Application status tracking

**Admin-facing:**
- Dashboard with real-time applicant and vacancy statistics
- User and authorization management (roles, permissions, staff, applicant records, logs)
- System configuration management
- Vacancy (advert) creation and management
- Secretariat and permit management
- Academic and professional data management (levels, programmes, institutions, subscriptions)
- Key metrics and scheme of service management
- Applicant pipeline tracking (in-progress, placements)

### 2.3 User Classes and Characteristics

| User Class | Description |
|---|---|
| Anonymous Visitor | Browses public vacancies without an account |
| Applicant (Job Seeker) | Registered user who builds a profile and applies for jobs |
| Admin (System Administrator) | Full access to admin portal; manages all system data |
| Employer/Secretariat User | Government institution user with access to their vacancy and applicant data |
| Staff (HR Officer) | Civil Service Commission staff with defined role-based permissions |

### 2.4 Operating Environment

- Web-based application accessible on any device with a modern browser
- Internet connectivity required (no offline mode)
- Hosted on government infrastructure, maintained by eGaz
- Compatible browsers: Chrome, Firefox, Edge, Safari (current versions)

### 2.5 Design and Implementation Constraints

- Applicants must possess a valid **ZanID** (Zanzibar National Identification Number) to complete their profile.
- All uploaded documents must be in **PDF format**, maximum **2MB** per certificate, **1MB** for application letters.
- Profile must be at least **70% complete** before an applicant can submit a job application.
- Password must be a minimum of **8 characters** containing alphabetic characters, symbols, and numbers.
- Communication between the system and applicants is primarily via **email**.

---

## 3. System Users and Roles

### 3.1 Applicant (Job Seeker)

An individual who creates an account on the portal to apply for civil service vacancies. Applicants interact exclusively with the public-facing portal.

**Capabilities:**
- Self-register using email and password
- Verify account via email activation link
- Complete a structured multi-section profile
- Browse and search available job vacancies
- Apply to open vacancies (requires ≥70% profile completion)
- Track the status of submitted applications
- Change password
- Preview and print their system-generated CV

### 3.2 Administrator

A Civil Service Commission staff member with access to the Admin Portal.

**Capabilities:**
- Full dashboard visibility (total applicants, new applicants, in-progress, placements)
- Manage system users, roles, permissions, staff accounts, and applicant accounts
- Configure system-wide settings
- Manage and publish job adverts (vacancies)
- Manage academic data (levels, programmes, institutions, subscriptions)
- Manage professional data (computer skills, courses, institutions)
- Manage employer/secretariat records
- Manage scheme of service and key matrices
- Review logs and audit trails
- Issue permits

### 3.3 Employer / Secretariat

A government institution or ministry that posts vacancies and views applicants for their advertised posts.

### 3.4 Staff (HR Officer)

A Civil Service Commission HR employee with permissions assigned by the Administrator. Access is role-based and may be limited to specific functions such as shortlisting or reviewing applications.

---

## 4. Functional Requirements

---

### 4.1 Public / Unauthenticated User Requirements

#### FR-PUB-001: View Job Vacancies
- The system shall display all currently open job vacancies to any visitor on the portal homepage without requiring login.
- Each vacancy listing shall display: post title, number of available posts, employer name, and application closing date.
- A "More Details" link shall be available on each listing, displaying full job details including qualifications, duties and responsibilities, and salary scale.

#### FR-PUB-002: Search Vacancies
- The system shall provide a search bar allowing visitors to search vacancies by keyword.
- Search results shall update to show only matching vacancies.

#### FR-PUB-003: Register
- The system shall provide a registration form requiring: email address, password, and password confirmation.
- Passwords must meet the minimum complexity rule: at least 8 characters including alphabetic characters, symbols, and numbers.
- On successful registration, the system shall send an account activation email to the provided address.
- The activation email shall contain a link the user must click to activate their account before logging in.
- Each email address may only be registered once.

#### FR-PUB-004: Login
- The system shall provide a login page accepting email address and password.
- On successful authentication, the user shall be redirected to the applicant dashboard.
- A "Lost Password?" recovery option shall be available.
- A "Show Password" toggle shall be available on the login form.

---

### 4.2 Job Seeker (Applicant) Module

#### 4.2.1 Dashboard

**FR-APP-001: Applicant Dashboard**
- After login, the applicant shall be presented with a dashboard showing available job vacancies and their current profile completion percentage.
- The top navigation bar shall provide links to: Vacancies, My Applications, Change Password, and Logout.
- The left sidebar shall provide navigation links to all profile sections.

---

#### 4.2.2 Profile Management

The applicant profile consists of the following sections. Profile completeness is tracked as a percentage and must reach at least 70% to enable job applications.

**FR-APP-002: Personal Details**
- The applicant shall enter their ZanID (Zanzibar Identification Number) in the format `XXXXXXXXX` (9 digits).
- On submission of a valid ZanID, the system shall auto-populate core personal details fetched from the national identity system.
- The applicant shall be able to update additional personal fields: Originality, Government Employment Status, Marital Status, and Impairments.
- The applicant shall upload a passport-size photograph.

**FR-APP-003: Contact Details**
- The applicant shall provide: Country of Residence, State/City, Province/County, Mobile Number, Alternative Email Address, Present Address.
- The applicant shall attach a birth certificate (PDF format).

**FR-APP-004: Academic Qualifications**
- The applicant shall be able to add multiple academic qualifications, one at a time.
- Supported education levels: Ordinary Level (CSE), Advanced Level (ACSE), Certificate, Full Technician Certificate (FTC), Diploma, Advanced Diploma, Degree, Postgraduate Diploma, Masters, PhD.
- For each qualification, the applicant shall provide: Education Level, Country of Study, Institution Name, Programme Name, Programme Category (auto-filled), Year From, Year To, GPA/Result.
- The applicant shall attach the certificate as a PDF (max 2MB).
- For degrees studied abroad, applicants must attach a TCU verification certificate.
- For diplomas/certificates studied abroad, applicants must attach a NACTE verification.
- For secondary education studied abroad, applicants must attach a NECTA verification.
- The system shall support declaration of lost CSE or ACSE certificates by capturing the examination index number and year of completion.

**FR-APP-005: Professional Qualifications**
- The applicant shall be able to add professional qualifications (e.g., CPA, ERB, CCNA, CISA, CISM, Medical Practising Licence, Driving Licence, Advocate Practising Licence).
- For each qualification: Country, Institution/Organization, Course Name, Start Date, End Date, and certificate attachment (PDF) shall be required.

**FR-APP-006: Language Proficiency**
- The applicant shall add one or more languages they are proficient in.
- For each language, the applicant shall rate their proficiency level (Very Good / Good / Fair) separately for: Speaking, Reading, and Writing.
- Added languages shall be displayed in a summary table with a delete option.

**FR-APP-007: Working Experience**
- The applicant shall add zero or more work experience records.
- For each entry, the following fields are required: Institution/Organization, Job Title, Supervisor Name, Supervisor Address, Supervisor Mobile Number, Duties & Responsibilities, Start Date, End Date (or "Is this your Current Job" checkbox).

**FR-APP-008: Training and Workshops**
- The applicant shall add records of training, workshops, or seminars attended.
- For each entry: Training Name, Institution Name, Training Description, Start Date, End Date, and an optional certificate attachment (PDF) shall be provided.

**FR-APP-009: Computer Literacy**
- The applicant shall declare proficiency in computer skills.
- Supported skills include: MS Word, MS Excel, MS PowerPoint.
- For each skill, the proficiency level (Very Good / Good / Fair) shall be selected.
- An optional supporting certificate may be attached.

**FR-APP-010: Referees**
- The applicant shall provide at least one referee's details.
- For each referee: Title, Full Name, Institution/Organisation, Email Address, Mobile Number, and Postal Address shall be provided.

**FR-APP-011: Other Attachments**
- The applicant shall be able to attach additional supporting documents not covered by other sections.
- Supported attachment types include: Birth Certificate, CV, and Recommendation Letters.
- The applicant shall select the attachment type before uploading.

**FR-APP-012: Declaration**
- The applicant shall submit a declaration confirming all provided information is complete, correct, and truthful.
- Ticking the declaration checkbox shall be legally binding (equivalent to a signature).
- The system shall warn that false information may result in disqualification or discharge.

**FR-APP-013: CV Preview**
- The applicant shall be able to preview a system-generated CV populated from their profile data.
- The CV preview shall include: Personal Details, Language Proficiency, Academic Qualifications, Working Experience, Trainings and Workshops, and Computer Literacy.
- A "Print" button shall allow the applicant to print the CV.

---

#### 4.2.3 Job Application

**FR-APP-014: Browse Vacancies**
- The authenticated applicant shall see all open vacancies on the dashboard home screen.
- Each vacancy shall show the post title, number of posts, employer, and closing date.
- A "More Details" link shall display full job requirements, qualifications, duties, and salary scale.

**FR-APP-015: Apply for a Vacancy**
- The applicant shall click "Apply" on any open vacancy to initiate an application.
- The system shall verify that the applicant's profile is at least 70% complete before allowing submission; otherwise a prompt shall inform the applicant to complete their profile.
- The applicant shall read and acknowledge the Application Confirmation declaration.
- The applicant shall upload a signed application letter in PDF format (max 1MB).
- On clicking "Confirm Application", the application shall be submitted and a success message displayed.
- The applicant shall be able to apply to multiple vacancies using the same profile.

**FR-APP-016: Replace Application Letter**
- After submission, the applicant shall be able to replace their uploaded application letter before the vacancy closing date.

---

#### 4.2.4 Application Tracking

**FR-APP-017: My Applications**
- The applicant shall access a "My Applications" section listing all their submitted applications.
- Each record shall display: Employer, Job Post Title, Date Applied, Closing Date, and Application Status.
- Application statuses shall include at minimum: Received, In Progress, Shortlisted, and Placed.

---

#### 4.2.5 Account Management

**FR-APP-018: Change Password**
- The applicant shall be able to change their password by entering their old password and the new password twice.
- The new password must meet the system's complexity requirements.
- Clicking "Submit" shall save the new password.

**FR-APP-019: Logout**
- The applicant shall be able to log out of the system at any time, terminating their session.

---

### 4.3 Admin Portal Module

#### 4.3.1 Dashboard

**FR-ADM-001: Admin Dashboard**
- The admin shall be presented with a real-time summary dashboard upon login displaying:
  - Total Applicants (aggregate)
  - New Applicants
  - In Progress (applications under review)
  - Placements (confirmed hires)
- A bar chart shall visualize applicant distribution across government institutions/employers.
- A "Current Employers" list shall display all registered employers with their applicant counts.
- The dashboard shall support toggling between "Applicants" view and "Users" view on the chart.

---

#### 4.3.2 User and Authorization Management

**FR-ADM-002: Roles Management**
- The admin shall create, edit, and delete user roles.
- Each role shall have a defined set of permissions.

**FR-ADM-003: Permissions Management**
- The admin shall define granular permissions and assign them to roles.

**FR-ADM-004: Staff Management**
- The admin shall create, view, edit, and deactivate staff accounts (Civil Service Commission employees).
- Staff accounts shall be assigned one or more roles.

**FR-ADM-005: Applicant Account Management**
- The admin shall view all registered applicant accounts.
- The admin shall be able to search and filter applicant records.

**FR-ADM-006: Audit Logs**
- The system shall maintain a log of all significant actions taken by all users.
- The admin shall be able to view and filter the audit log by user, action type, and date range.

---

#### 4.3.3 Configurations

**FR-ADM-007: System Configuration**
- The admin shall manage system-wide configuration parameters including but not limited to: supported file types, file size limits, profile completion thresholds, email notification templates, and system metadata.

---

#### 4.3.4 Secretariat Management

**FR-ADM-008: Secretariat**
- The admin shall manage secretariat records for government institutions participating in recruitment.
- The admin shall assign secretariat officers to specific employers or vacancies.

---

#### 4.3.5 Permit Management

**FR-ADM-009: Permits**
- The admin shall issue, view, and manage recruitment permits for government employer institutions.
- A permit shall authorize an employer to advertise and recruit for specific vacancies.

---

#### 4.3.6 Key Matrices and Scheme of Service

**FR-ADM-010: Key Matrices**
- The admin shall manage key recruitment matrices used for applicant scoring and shortlisting criteria.

**FR-ADM-011: Scheme of Service**
- The admin shall define and manage schemes of service (job grade structures, career progression paths, and associated qualification requirements) for all civil service posts.

---

#### 4.3.7 Adverts (Vacancy Management)

**FR-ADM-012: Create Job Advert**
- The admin (or authorized employer) shall create a new job vacancy/advert specifying: Post Title, Number of Posts, Employer/Institution, Location (e.g., Unguja or Pemba), Required Qualifications, Duties and Responsibilities, Salary Scale, and Application Closing Date.

**FR-ADM-013: Publish and Manage Adverts**
- The admin shall publish, edit, or close vacancies.
- Published vacancies shall be immediately visible to applicants on the public portal.
- Once the closing date passes, applications shall no longer be accepted for that vacancy.

**FR-ADM-014: View Applicants per Vacancy**
- The admin shall view all applicants who have applied to a specific vacancy.
- The admin shall be able to shortlist, progress, or reject applicants within a vacancy pipeline.

---

#### 4.3.8 Academic Management

**FR-ADM-015: Academic Levels**
- The admin shall manage the list of recognized academic levels (e.g., Ordinary Level, Degree, Masters, PhD).

**FR-ADM-016: Academic Programmes**
- The admin shall manage the list of academic programmes available per institution and level.

**FR-ADM-017: Academic Subscription**
- The admin shall manage subscriptions linking academic institutions to recognized programmes.

**FR-ADM-018: Academic Institutions**
- The admin shall manage the list of recognized academic institutions (local and foreign) available for selection by applicants.

---

#### 4.3.9 Professional Management

**FR-ADM-019: Computer Skills**
- The admin shall manage the list of computer skills available for applicant selection (e.g., MS Word, MS Excel, MS PowerPoint).

**FR-ADM-020: Professional Courses**
- The admin shall manage the list of recognized professional courses and certifications.

**FR-ADM-021: Professional Institutions**
- The admin shall manage the list of recognized professional institutions that issue professional qualifications.

---

## 5. Non-Functional Requirements

### 5.1 Performance

- **NFR-PERF-001:** The portal homepage and vacancy listing shall load within 3 seconds under normal network conditions.
- **NFR-PERF-002:** File uploads (PDF certificates, application letters) shall be processed and confirmed within 10 seconds.
- **NFR-PERF-003:** The admin dashboard statistics shall refresh or load within 5 seconds.
- **NFR-PERF-004:** The system shall support at least 1,000 concurrent users without degradation in response time.

### 5.2 Usability

- **NFR-USE-001:** The applicant portal shall be navigable without technical training; a user guide shall be accessible from the portal homepage.
- **NFR-USE-002:** All form validation errors shall be clearly communicated inline with descriptive error messages.
- **NFR-USE-003:** Profile completion progress shall be visible to the applicant at all times on the dashboard as a percentage.
- **NFR-USE-004:** The system shall support both English and Kiswahili language navigation (consistent with the bilingual nature of the portal content).

### 5.3 Reliability

- **NFR-REL-001:** The system shall maintain an uptime of at least 99.5% excluding planned maintenance windows.
- **NFR-REL-002:** The system shall implement automatic session timeout after a period of inactivity (recommended: 30 minutes) to protect user accounts.
- **NFR-REL-003:** Data entered and saved in any profile section shall be persistently stored and retrievable across sessions.

### 5.4 Scalability

- **NFR-SCA-001:** The system architecture shall support horizontal scaling to accommodate growth in registered users. (As of May 2026, the system has 51,167 registered applicants with 21,456 in-progress.)
- **NFR-SCA-002:** The database shall support storage of scanned PDF documents for tens of thousands of applicants without performance degradation.

### 5.5 Maintainability

- **NFR-MNT-001:** System configuration parameters (file size limits, completion thresholds, email templates) shall be manageable from the admin portal without requiring code changes.
- **NFR-MNT-002:** The system shall support versioning, and the current version shall be displayed in the portal footer (current: Version 1.0.0).
- **NFR-MNT-003:** The codebase shall be documented sufficiently to allow maintenance by the eGaz development team.

### 5.6 Accessibility

- **NFR-ACC-001:** The portal shall be accessible on mobile devices and tablets as well as desktop computers.
- **NFR-ACC-002:** The system shall support applicants with declared impairments as a profile attribute, which may be used for affirmative recruitment policies.

---

## 6. System Constraints

| Constraint | Description |
|---|---|
| Identity Dependency | Applicant profiles require a valid ZanID from Zanzibar's national identity system. Without ZanID, personal details cannot be auto-populated. |
| File Format | All document uploads must be in PDF format only. |
| File Size | Certificates: max 2MB each. Application letters: max 1MB. |
| Profile Threshold | A minimum of 70% profile completion is required before applying for any vacancy. |
| Email Dependency | Account activation, password recovery, and all official communications depend on a functioning email delivery system. |
| Browser Dependency | The system requires a modern web browser and stable internet connection. No offline functionality is provided. |
| Legal Compliance | Applicants declare under digital signature (checkbox) that all information is truthful; false information may result in legal consequences and disqualification. |

---

## 7. External Interface Requirements

### 7.1 User Interfaces

- **Applicant Portal:** Web-based, responsive layout. Header with government branding (President's Office / Civil Service Commission). Left sidebar navigation for profile sections. Main content area for forms and vacancy listings.
- **Admin Portal:** Dark-themed left sidebar navigation. Top breadcrumb navigation. Main dashboard with stat cards and charts. Data tables for all management modules.

### 7.2 Hardware Interfaces

- No dedicated hardware interface requirements. The system is accessed via standard computing devices (desktop, laptop, tablet, mobile phone) with internet connectivity.

### 7.3 Software Interfaces

- **ZanID System:** Integration with Zanzibar's National Identification System to auto-populate applicant personal details upon entry of a valid ZanID.
- **Email Server (SMTP):** Integration with an email delivery service for account activation, password recovery, and recruitment notifications. Contact addresses: info@zanajira.go.tz, habari@zanajira.go.tz, maulizo@zanajira.go.tz.
- **Web Browser:** The application interface is delivered through standard HTTP/HTTPS to any compatible web browser.

### 7.4 Communication Interfaces

- All client-server communication shall occur over **HTTPS** (TLS-encrypted).
- Email communication shall use standard SMTP protocols.

---

## 8. Data Requirements

### 8.1 Key Data Entities

| Entity | Description |
|---|---|
| Applicant | Registered job seeker with profile data |
| Personal Details | Name, DOB, sex, marital status, ZanID, nationality, impairment status |
| Contact Details | Address, phone, email, birth certificate |
| Academic Qualification | Education level, institution, programme, year, GPA, certificate |
| Professional Qualification | Course, institution, country, validity dates, certificate |
| Language Proficiency | Language, speak/read/write levels |
| Work Experience | Organization, role, dates, supervisor, duties |
| Training & Workshop | Name, institution, description, dates, certificate |
| Computer Literacy | Skill name, proficiency level, optional certificate |
| Referee | Name, title, organization, contact details |
| Other Attachment | Document type, file |
| Declaration | Timestamp, applicant confirmation |
| Vacancy (Advert) | Post title, posts available, employer, location, requirements, closing date |
| Application | Applicant, vacancy, application letter, status, date applied |
| Employer | Government institution name, contact details |
| User Account | Email, hashed password, role, activation status |
| Role & Permission | Role name, list of permissions |
| Audit Log | User, action, timestamp, IP address |

### 8.2 Data Retention

- Applicant profile data and application records shall be retained for a minimum period consistent with Zanzibar government records management policy.
- Audit logs shall be retained for a minimum of 5 years.

### 8.3 Data Integrity

- Each applicant shall be uniquely identified by their email address and ZanID.
- The system shall prevent duplicate registrations using the same email address.
- Referential integrity shall be maintained between applications and their corresponding vacancy and applicant records.

---

## 9. Security Requirements

| ID | Requirement |
|---|---|
| SEC-001 | All passwords shall be stored as cryptographic hashes (e.g., bcrypt). Plaintext passwords shall never be stored. |
| SEC-002 | All communications between the client and server shall be encrypted using TLS (HTTPS). |
| SEC-003 | Account activation shall require email verification via a unique, time-limited activation link. |
| SEC-004 | The system shall enforce role-based access control (RBAC) ensuring users can only access functions permitted by their assigned role. |
| SEC-005 | Admin portal access shall be restricted to authorized staff accounts only and shall not be publicly accessible. |
| SEC-006 | Sessions shall expire after a defined period of inactivity to prevent unauthorized access on shared devices. |
| SEC-007 | All file uploads shall be validated for file type (PDF only) and file size before acceptance. |
| SEC-008 | The system shall log all authentication events (login, logout, failed login attempts) in the audit trail. |
| SEC-009 | Input validation and sanitization shall be enforced on all form fields to prevent SQL injection, XSS, and other injection attacks. |
| SEC-010 | Password recovery shall only be possible via a unique, time-limited link sent to the registered email address. |

---

## 10. Assumptions and Dependencies

### 10.1 Assumptions

- All applicants have access to a valid ZanID issued by the Zanzibar national identity authority.
- All applicants have access to a personal, regularly monitored email address.
- Applicants have the capability to scan their certificates and save them as PDF files (max 2MB).
- Government employers and their posts are pre-configured in the system by administrators before vacancies are published.
- Internet connectivity is available to all intended users (applicants and admin staff).

### 10.2 Dependencies

- The ZanID national identity system must be available and accessible via API or integration for applicant profile auto-population.
- A reliable email delivery service must be operational for account activation and notifications.
- The system infrastructure (hosting, database, storage) is maintained by eGaz on behalf of OR-KSUUB.
- Academic institutions, programmes, and professional courses must be pre-loaded into the system by administrators before applicants can select them.

---

## 11. Glossary

| Term | Definition |
|---|---|
| ACSE | Advanced Certificate of Secondary Education — the Zanzibar Advanced Level qualification |
| Admin Portal | The backend administration interface used by Civil Service Commission staff |
| Applicant | A registered job seeker using the ZanAjira portal to apply for civil service positions |
| CSE | Certificate of Secondary Education — the Zanzibar Ordinary Level qualification |
| eGaz | The technology company responsible for developing and maintaining ZanAjira |
| GPA | Grade Point Average — academic performance measure |
| NACTE | National Accreditation Council for Technical Education — Tanzania |
| NECTA | National Examinations Council of Tanzania |
| OR-KSUUB | Ofisi ya Rais — Katiba, Sheria, Utumishi wa Umma na Utawala Bora (President's Office — Constitution, Legal Affairs, Public Service and Good Governance) |
| Placement | A successful hiring outcome where an applicant is confirmed in a civil service post |
| Profile Completion | A percentage score indicating how much of the applicant's profile has been filled in |
| RBAC | Role-Based Access Control — a security model restricting system access based on assigned roles |
| SRS | Software Requirements Specification — this document |
| TCU | Tanzania Commission for Universities |
| TLS | Transport Layer Security — cryptographic protocol for secure communication |
| Vacancy | An advertised civil service job post open for applications |
| ZanAjira | The name of the government job portal ("Zan" for Zanzibar, "Ajira" for employment in Kiswahili) |
| ZanID | Zanzibar National Identification Number — a unique identity number issued to Zanzibar residents |

---

*Document End — ZanAjira SRS v1.0 — Civil Service Commission, Revolutionary Government of Zanzibar*
