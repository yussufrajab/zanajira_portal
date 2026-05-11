-- name: CreateApplication :one
INSERT INTO applications (applicant_id, vacancy_id, application_letter_path)
VALUES ($1,$2,$3) RETURNING *;

-- name: GetApplication :one
SELECT a.*, v.post_title, v.closing_date, e.name AS employer_name
FROM applications a
JOIN vacancies v ON v.id = a.vacancy_id
JOIN employers e ON e.id = v.employer_id
WHERE a.id = $1 LIMIT 1;

-- name: GetApplicationByApplicantAndVacancy :one
SELECT * FROM applications WHERE applicant_id=$1 AND vacancy_id=$2 LIMIT 1;

-- name: ListApplicantApplications :many
SELECT a.id, a.status, a.applied_at, a.updated_at,
       v.post_title, v.closing_date, v.salary_scale,
       e.name AS employer_name
FROM applications a
JOIN vacancies v ON v.id = a.vacancy_id
JOIN employers e ON e.id = v.employer_id
WHERE a.applicant_id = $1
ORDER BY a.applied_at DESC;

-- name: UpdateApplicationLetter :one
UPDATE applications SET application_letter_path=$2, updated_at=NOW()
WHERE id=$1 RETURNING *;

-- name: UpdateApplicationStatus :one
UPDATE applications SET status=$2, updated_at=NOW() WHERE id=$1 RETURNING *;

-- name: ListApplicationsByVacancy :many
SELECT a.id, a.status, a.applied_at,
       ap.first_name, ap.last_name, ap.zanid, ap.profile_completion_pct,
       u.email
FROM applications a
JOIN applicants ap ON ap.id = a.applicant_id
JOIN users u ON u.id = ap.user_id
WHERE a.vacancy_id = $1
ORDER BY a.applied_at DESC
LIMIT $2 OFFSET $3;

-- name: CountApplicationsByVacancy :one
SELECT COUNT(*) FROM applications WHERE vacancy_id=$1;
