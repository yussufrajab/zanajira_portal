-- Migration 002: Applicant Profile Tables
-- ============================================================

CREATE TABLE applicants (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                 UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    zanid                   VARCHAR(20) UNIQUE,
    first_name              VARCHAR(100),
    last_name               VARCHAR(100),
    sex                     VARCHAR(10),
    date_of_birth           DATE,
    nationality             VARCHAR(100),
    originality             VARCHAR(100),
    govt_employment_status  VARCHAR(50),
    marital_status          VARCHAR(30),
    impairment              VARCHAR(100),
    photo_path              TEXT,
    profile_completion_pct  INTEGER NOT NULL DEFAULT 0,
    declaration_accepted    BOOLEAN NOT NULL DEFAULT FALSE,
    declaration_at          TIMESTAMPTZ,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE contact_details (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    applicant_id     UUID UNIQUE NOT NULL REFERENCES applicants(id) ON DELETE CASCADE,
    country          VARCHAR(100),
    state_city       VARCHAR(100),
    province_county  VARCHAR(100),
    mobile_number    VARCHAR(30),
    alt_email        VARCHAR(255),
    present_address  TEXT,
    birth_cert_path  TEXT,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE academic_qualifications (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    applicant_id     UUID NOT NULL REFERENCES applicants(id) ON DELETE CASCADE,
    education_level  VARCHAR(50) NOT NULL,
    country          VARCHAR(100),
    institution_id   INTEGER,
    programme_id     INTEGER,
    programme_category VARCHAR(100),
    year_from        INTEGER,
    year_to          INTEGER,
    gpa_result       VARCHAR(50),
    cert_path        TEXT,
    tcu_cert_path    TEXT,
    nacte_cert_path  TEXT,
    necta_cert_path  TEXT,
    lost_cert_index  VARCHAR(50),
    lost_cert_year   INTEGER,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE professional_qualifications (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    applicant_id UUID NOT NULL REFERENCES applicants(id) ON DELETE CASCADE,
    country      VARCHAR(100),
    institution  VARCHAR(255),
    course_name  VARCHAR(255) NOT NULL,
    start_date   DATE,
    end_date     DATE,
    cert_path    TEXT,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE language_proficiencies (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    applicant_id UUID NOT NULL REFERENCES applicants(id) ON DELETE CASCADE,
    language     VARCHAR(100) NOT NULL,
    speaking     VARCHAR(20) NOT NULL CHECK (speaking IN ('Very Good','Good','Fair')),
    reading      VARCHAR(20) NOT NULL CHECK (reading  IN ('Very Good','Good','Fair')),
    writing      VARCHAR(20) NOT NULL CHECK (writing  IN ('Very Good','Good','Fair')),
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE work_experiences (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    applicant_id      UUID NOT NULL REFERENCES applicants(id) ON DELETE CASCADE,
    organization      VARCHAR(255) NOT NULL,
    job_title         VARCHAR(255) NOT NULL,
    supervisor_name   VARCHAR(255),
    supervisor_address TEXT,
    supervisor_mobile VARCHAR(30),
    duties            TEXT,
    start_date        DATE NOT NULL,
    end_date          DATE,
    is_current        BOOLEAN NOT NULL DEFAULT FALSE,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE trainings (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    applicant_id UUID NOT NULL REFERENCES applicants(id) ON DELETE CASCADE,
    name         VARCHAR(255) NOT NULL,
    institution  VARCHAR(255),
    description  TEXT,
    start_date   DATE,
    end_date     DATE,
    cert_path    TEXT,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE computer_skills (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    applicant_id UUID NOT NULL REFERENCES applicants(id) ON DELETE CASCADE,
    skill        VARCHAR(100) NOT NULL,
    proficiency  VARCHAR(20) NOT NULL CHECK (proficiency IN ('Very Good','Good','Fair')),
    cert_path    TEXT,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (applicant_id, skill)
);

CREATE TABLE referees (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    applicant_id   UUID NOT NULL REFERENCES applicants(id) ON DELETE CASCADE,
    title          VARCHAR(30),
    full_name      VARCHAR(255) NOT NULL,
    organization   VARCHAR(255),
    email          VARCHAR(255),
    mobile         VARCHAR(30),
    postal_address TEXT,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE other_attachments (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    applicant_id UUID NOT NULL REFERENCES applicants(id) ON DELETE CASCADE,
    type         VARCHAR(50) NOT NULL CHECK (type IN ('birth_cert','cv','recommendation','other')),
    file_path    TEXT NOT NULL,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_applicants_user_id  ON applicants(user_id);
CREATE INDEX idx_applicants_zanid    ON applicants(zanid) WHERE zanid IS NOT NULL;
CREATE INDEX idx_academic_applicant  ON academic_qualifications(applicant_id);
CREATE INDEX idx_experience_applicant ON work_experiences(applicant_id);
