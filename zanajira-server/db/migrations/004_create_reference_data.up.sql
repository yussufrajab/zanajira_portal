-- Migration 004: Reference Data & Admin Tables
-- ============================================================

CREATE TABLE academic_levels (
    id         SERIAL PRIMARY KEY,
    name       VARCHAR(100) UNIQUE NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE academic_institutions (
    id      SERIAL PRIMARY KEY,
    name    VARCHAR(255) UNIQUE NOT NULL,
    country VARCHAR(100),
    type    VARCHAR(10) NOT NULL DEFAULT 'local' CHECK (type IN ('local','foreign'))
);

CREATE TABLE academic_programmes (
    id             SERIAL PRIMARY KEY,
    level_id       INTEGER NOT NULL REFERENCES academic_levels(id),
    institution_id INTEGER REFERENCES academic_institutions(id),
    name           VARCHAR(255) NOT NULL,
    category       VARCHAR(100)
);

CREATE TABLE academic_subscriptions (
    id             SERIAL PRIMARY KEY,
    institution_id INTEGER NOT NULL REFERENCES academic_institutions(id) ON DELETE CASCADE,
    programme_id   INTEGER NOT NULL REFERENCES academic_programmes(id) ON DELETE CASCADE,
    UNIQUE (institution_id, programme_id)
);

CREATE TABLE professional_courses (
    id   SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE professional_institutions (
    id      SERIAL PRIMARY KEY,
    name    VARCHAR(255) UNIQUE NOT NULL,
    country VARCHAR(100)
);

CREATE TABLE computer_skill_definitions (
    id   SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE secretariats (
    id              SERIAL PRIMARY KEY,
    employer_id     INTEGER NOT NULL REFERENCES employers(id) ON DELETE CASCADE,
    officer_name    VARCHAR(255) NOT NULL,
    officer_contact VARCHAR(255),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TYPE permit_status AS ENUM ('active','expired','revoked');

CREATE TABLE permits (
    id          SERIAL PRIMARY KEY,
    employer_id INTEGER NOT NULL REFERENCES employers(id),
    vacancy_id  UUID REFERENCES vacancies(id),
    issued_by   UUID REFERENCES users(id),
    issued_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status      permit_status NOT NULL DEFAULT 'active'
);

CREATE TABLE key_matrices (
    id            SERIAL PRIMARY KEY,
    name          VARCHAR(255) NOT NULL,
    criteria_json JSONB NOT NULL DEFAULT '{}',
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE schemes_of_service (
    id                        SERIAL PRIMARY KEY,
    grade                     VARCHAR(50) NOT NULL,
    title                     VARCHAR(255) NOT NULL,
    qualification_requirements TEXT,
    career_path               TEXT,
    created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- System configuration table (key-value store)
CREATE TABLE system_config (
    key        VARCHAR(100) PRIMARY KEY,
    value      TEXT NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Default system config values
INSERT INTO system_config (key, value) VALUES
    ('cert_max_size_mb',          '2'),
    ('letter_max_size_mb',        '1'),
    ('profile_threshold_pct',     '70'),
    ('session_timeout_minutes',   '30'),
    ('max_login_attempts',        '5'),
    ('login_lockout_minutes',     '15'),
    ('activation_token_hours',    '24'),
    ('reset_token_hours',         '2'),
    ('system_version',            '1.0.0'),
    ('system_name',               'ZanAjira Portal'),
    ('support_email',             'info@zanajira.go.tz');

-- Seed academic levels
INSERT INTO academic_levels (name, sort_order) VALUES
    ('Ordinary Level (CSE)',        1),
    ('Advanced Level (ACSE)',       2),
    ('Certificate',                 3),
    ('Full Technician Certificate', 4),
    ('Diploma',                     5),
    ('Advanced Diploma',            6),
    ('Degree',                      7),
    ('Postgraduate Diploma',        8),
    ('Masters',                     9),
    ('PhD',                        10);

-- Seed computer skill definitions
INSERT INTO computer_skill_definitions (name) VALUES
    ('MS Word'),
    ('MS Excel'),
    ('MS PowerPoint');
