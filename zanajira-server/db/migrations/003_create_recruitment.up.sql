-- Migration 003: Recruitment — Employers, Vacancies, Applications, Audit
-- ============================================================

CREATE TABLE employers (
    id            SERIAL PRIMARY KEY,
    name          VARCHAR(255) UNIQUE NOT NULL,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(30),
    address       TEXT,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TYPE vacancy_status AS ENUM ('draft','published','closed');
CREATE TYPE application_status AS ENUM ('received','in_progress','shortlisted','placed','rejected');

CREATE TABLE vacancies (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employer_id    INTEGER NOT NULL REFERENCES employers(id),
    post_title     VARCHAR(255) NOT NULL,
    num_posts      INTEGER NOT NULL DEFAULT 1,
    location       VARCHAR(100),
    qualifications TEXT,
    duties         TEXT,
    salary_scale   VARCHAR(100),
    closing_date   DATE NOT NULL,
    status         vacancy_status NOT NULL DEFAULT 'draft',
    created_by     UUID REFERENCES users(id),
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE applications (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    applicant_id            UUID NOT NULL REFERENCES applicants(id) ON DELETE CASCADE,
    vacancy_id              UUID NOT NULL REFERENCES vacancies(id) ON DELETE CASCADE,
    application_letter_path TEXT,
    status                  application_status NOT NULL DEFAULT 'received',
    applied_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (applicant_id, vacancy_id)
);

CREATE TABLE audit_logs (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID REFERENCES users(id) ON DELETE SET NULL,
    action        VARCHAR(100) NOT NULL,
    resource      VARCHAR(100),
    resource_id   TEXT,
    ip_address    INET,
    timestamp     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metadata_json JSONB
);

CREATE INDEX idx_vacancies_status       ON vacancies(status);
CREATE INDEX idx_vacancies_closing_date ON vacancies(closing_date);
CREATE INDEX idx_vacancies_employer     ON vacancies(employer_id);
CREATE INDEX idx_applications_applicant ON applications(applicant_id);
CREATE INDEX idx_applications_vacancy   ON applications(vacancy_id);
CREATE INDEX idx_audit_logs_user        ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_timestamp   ON audit_logs(timestamp DESC);
