-- name: GetDashboardStats :one
SELECT
    (SELECT COUNT(*) FROM applicants)                                          AS total_applicants,
    (SELECT COUNT(*) FROM applicants WHERE created_at >= NOW() - INTERVAL '30 days') AS new_applicants,
    (SELECT COUNT(*) FROM applications WHERE status = 'in_progress')           AS in_progress,
    (SELECT COUNT(*) FROM applications WHERE status = 'placed')                AS placements;

-- name: GetApplicantsByEmployer :many
SELECT e.name AS employer_name, COUNT(a.id) AS applicant_count
FROM employers e
LEFT JOIN vacancies v ON v.employer_id = e.id
LEFT JOIN applications a ON a.vacancy_id = v.id
GROUP BY e.id, e.name
ORDER BY applicant_count DESC;

-- name: ListAuditLogs :many
SELECT al.*, u.email AS user_email
FROM audit_logs al
LEFT JOIN users u ON u.id = al.user_id
ORDER BY al.timestamp DESC
LIMIT $1 OFFSET $2;

-- name: ListAuditLogsByUser :many
SELECT al.*, u.email AS user_email
FROM audit_logs al
LEFT JOIN users u ON u.id = al.user_id
WHERE al.user_id = $1
ORDER BY al.timestamp DESC
LIMIT $2 OFFSET $3;

-- name: InsertAuditLog :exec
INSERT INTO audit_logs (user_id, action, resource, resource_id, ip_address, metadata_json)
VALUES ($1,$2,$3,$4,$5,$6);

-- name: GetSystemConfig :many
SELECT key, value FROM system_config ORDER BY key;

-- name: GetSystemConfigByKey :one
SELECT key, value FROM system_config WHERE key=$1;

-- name: UpsertSystemConfig :exec
INSERT INTO system_config (key, value, updated_at)
VALUES ($1,$2,NOW())
ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value, updated_at=NOW();

-- Employers
-- name: ListEmployers :many
SELECT * FROM employers ORDER BY name LIMIT $1 OFFSET $2;

-- name: GetEmployerByID :one
SELECT * FROM employers WHERE id=$1;

-- name: CreateEmployer :one
INSERT INTO employers (name, contact_email, contact_phone, address)
VALUES ($1,$2,$3,$4) RETURNING *;

-- name: UpdateEmployer :one
UPDATE employers SET name=$2, contact_email=$3, contact_phone=$4, address=$5, updated_at=NOW()
WHERE id=$1 RETURNING *;

-- name: DeleteEmployer :exec
DELETE FROM employers WHERE id=$1;

-- Secretariats
-- name: ListSecretariats :many
SELECT s.*, e.name AS employer_name FROM secretariats s
JOIN employers e ON e.id = s.employer_id ORDER BY s.created_at DESC;

-- name: CreateSecretariat :one
INSERT INTO secretariats (employer_id, officer_name, officer_contact)
VALUES ($1,$2,$3) RETURNING *;

-- name: UpdateSecretariat :one
UPDATE secretariats SET officer_name=$2, officer_contact=$3, updated_at=NOW()
WHERE id=$1 RETURNING *;

-- name: DeleteSecretariat :exec
DELETE FROM secretariats WHERE id=$1;

-- Permits
-- name: ListPermits :many
SELECT p.*, e.name AS employer_name, v.post_title
FROM permits p
JOIN employers e ON e.id = p.employer_id
LEFT JOIN vacancies v ON v.id = p.vacancy_id
ORDER BY p.issued_at DESC;

-- name: CreatePermit :one
INSERT INTO permits (employer_id, vacancy_id, issued_by) VALUES ($1,$2,$3) RETURNING *;

-- name: UpdatePermitStatus :one
UPDATE permits SET status=$2 WHERE id=$1 RETURNING *;

-- Academic Levels
-- name: ListAcademicLevels :many
SELECT * FROM academic_levels ORDER BY sort_order;

-- name: CreateAcademicLevel :one
INSERT INTO academic_levels (name, sort_order) VALUES ($1,$2) RETURNING *;

-- name: UpdateAcademicLevel :one
UPDATE academic_levels SET name=$2, sort_order=$3 WHERE id=$1 RETURNING *;

-- name: DeleteAcademicLevel :exec
DELETE FROM academic_levels WHERE id=$1;

-- Academic Institutions
-- name: ListAcademicInstitutions :many
SELECT * FROM academic_institutions ORDER BY name LIMIT $1 OFFSET $2;

-- name: CreateAcademicInstitution :one
INSERT INTO academic_institutions (name, country, type) VALUES ($1,$2,$3) RETURNING *;

-- name: UpdateAcademicInstitution :one
UPDATE academic_institutions SET name=$2, country=$3, type=$4 WHERE id=$1 RETURNING *;

-- name: DeleteAcademicInstitution :exec
DELETE FROM academic_institutions WHERE id=$1;

-- Academic Programmes
-- name: ListAcademicProgrammes :many
SELECT p.*, l.name AS level_name, i.name AS institution_name
FROM academic_programmes p
JOIN academic_levels l ON l.id = p.level_id
LEFT JOIN academic_institutions i ON i.id = p.institution_id
ORDER BY p.name LIMIT $1 OFFSET $2;

-- name: CreateAcademicProgramme :one
INSERT INTO academic_programmes (level_id, institution_id, name, category)
VALUES ($1,$2,$3,$4) RETURNING *;

-- name: UpdateAcademicProgramme :one
UPDATE academic_programmes SET level_id=$2, institution_id=$3, name=$4, category=$5
WHERE id=$1 RETURNING *;

-- name: DeleteAcademicProgramme :exec
DELETE FROM academic_programmes WHERE id=$1;

-- Academic Subscriptions
-- name: ListAcademicSubscriptions :many
SELECT s.*, i.name AS institution_name, p.name AS programme_name
FROM academic_subscriptions s
JOIN academic_institutions i ON i.id = s.institution_id
JOIN academic_programmes p ON p.id = s.programme_id
ORDER BY i.name;

-- name: CreateAcademicSubscription :one
INSERT INTO academic_subscriptions (institution_id, programme_id) VALUES ($1,$2) RETURNING *;

-- name: DeleteAcademicSubscription :exec
DELETE FROM academic_subscriptions WHERE id=$1;

-- Computer Skill Definitions
-- name: ListComputerSkillDefinitions :many
SELECT * FROM computer_skill_definitions ORDER BY name;

-- name: CreateComputerSkillDefinition :one
INSERT INTO computer_skill_definitions (name) VALUES ($1) RETURNING *;

-- name: DeleteComputerSkillDefinition :exec
DELETE FROM computer_skill_definitions WHERE id=$1;

-- Professional Courses
-- name: ListProfessionalCourses :many
SELECT * FROM professional_courses ORDER BY name;

-- name: CreateProfessionalCourse :one
INSERT INTO professional_courses (name) VALUES ($1) RETURNING *;

-- name: DeleteProfessionalCourse :exec
DELETE FROM professional_courses WHERE id=$1;

-- Professional Institutions
-- name: ListProfessionalInstitutions :many
SELECT * FROM professional_institutions ORDER BY name;

-- name: CreateProfessionalInstitution :one
INSERT INTO professional_institutions (name, country) VALUES ($1,$2) RETURNING *;

-- name: UpdateProfessionalInstitution :one
UPDATE professional_institutions SET name=$2, country=$3 WHERE id=$1 RETURNING *;

-- name: DeleteProfessionalInstitution :exec
DELETE FROM professional_institutions WHERE id=$1;

-- Key Matrices
-- name: ListKeyMatrices :many
SELECT * FROM key_matrices ORDER BY name;

-- name: CreateKeyMatrix :one
INSERT INTO key_matrices (name, criteria_json) VALUES ($1,$2) RETURNING *;

-- name: UpdateKeyMatrix :one
UPDATE key_matrices SET name=$2, criteria_json=$3, updated_at=NOW() WHERE id=$1 RETURNING *;

-- name: DeleteKeyMatrix :exec
DELETE FROM key_matrices WHERE id=$1;

-- Schemes of Service
-- name: ListSchemesOfService :many
SELECT * FROM schemes_of_service ORDER BY grade;

-- name: CreateSchemeOfService :one
INSERT INTO schemes_of_service (grade, title, qualification_requirements, career_path)
VALUES ($1,$2,$3,$4) RETURNING *;

-- name: UpdateSchemeOfService :one
UPDATE schemes_of_service SET grade=$2, title=$3, qualification_requirements=$4, career_path=$5, updated_at=NOW()
WHERE id=$1 RETURNING *;

-- name: DeleteSchemeOfService :exec
DELETE FROM schemes_of_service WHERE id=$1;
