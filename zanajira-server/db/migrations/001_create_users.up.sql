-- Migration 001: Users, Roles, Permissions
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE roles (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(50) UNIQUE NOT NULL,
    description TEXT
);

CREATE TABLE permissions (
    id       SERIAL PRIMARY KEY,
    name     VARCHAR(100) UNIQUE NOT NULL,
    resource VARCHAR(50) NOT NULL,
    action   VARCHAR(50) NOT NULL
);

CREATE TABLE users (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email               VARCHAR(255) UNIQUE NOT NULL,
    password_hash       TEXT NOT NULL,
    role                VARCHAR(50) NOT NULL DEFAULT 'applicant'
                            REFERENCES roles(name) ON UPDATE CASCADE,
    is_active           BOOLEAN NOT NULL DEFAULT FALSE,
    activation_token    VARCHAR(255),
    activation_expires  TIMESTAMPTZ,
    reset_token         VARCHAR(255),
    reset_expires       TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE role_permissions (
    role_id       INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id INTEGER NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- Seed default roles
INSERT INTO roles (name, description) VALUES
    ('applicant', 'Job seeker — applicant portal access'),
    ('admin',     'System administrator — full admin portal access'),
    ('staff',     'HR officer — limited admin portal access'),
    ('employer',  'Government employer — vacancy and applicant data');

-- Seed default permissions
INSERT INTO permissions (name, resource, action) VALUES
    ('vacancies:read',              'vacancies',   'read'),
    ('vacancies:write',             'vacancies',   'write'),
    ('vacancies:delete',            'vacancies',   'delete'),
    ('applications:read',           'applications','read'),
    ('applications:write',          'applications','write'),
    ('applications:status',         'applications','status'),
    ('applicants:read',             'applicants',  'read'),
    ('staff:read',                  'staff',       'read'),
    ('staff:write',                 'staff',       'write'),
    ('staff:delete',                'staff',       'delete'),
    ('roles:read',                  'roles',       'read'),
    ('roles:write',                 'roles',       'write'),
    ('config:read',                 'config',      'read'),
    ('config:write',                'config',      'write'),
    ('audit_logs:read',             'audit_logs',  'read'),
    ('secretariats:write',          'secretariats','write'),
    ('permits:write',               'permits',     'write'),
    ('academic:write',              'academic',    'write'),
    ('professional:write',          'professional','write'),
    ('key_matrices:write',          'key_matrices','write'),
    ('schemes_of_service:write',    'schemes',     'write');

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_activation_token ON users(activation_token) WHERE activation_token IS NOT NULL;
CREATE INDEX idx_users_reset_token ON users(reset_token) WHERE reset_token IS NOT NULL;
