-- name: ListOpenVacancies :many
SELECT v.*, e.name AS employer_name
FROM vacancies v
JOIN employers e ON e.id = v.employer_id
WHERE v.status = 'published' AND v.closing_date >= CURRENT_DATE
ORDER BY v.created_at DESC
LIMIT $1 OFFSET $2;

-- name: CountOpenVacancies :one
SELECT COUNT(*) FROM vacancies WHERE status = 'published' AND closing_date >= CURRENT_DATE;

-- name: SearchVacancies :many
SELECT v.*, e.name AS employer_name
FROM vacancies v
JOIN employers e ON e.id = v.employer_id
WHERE v.status = 'published' AND v.closing_date >= CURRENT_DATE
  AND (v.post_title ILIKE $1 OR e.name ILIKE $1 OR v.qualifications ILIKE $1)
ORDER BY v.created_at DESC
LIMIT $2 OFFSET $3;

-- name: GetVacancyByID :one
SELECT v.*, e.name AS employer_name
FROM vacancies v
JOIN employers e ON e.id = v.employer_id
WHERE v.id = $1 LIMIT 1;

-- name: CreateVacancy :one
INSERT INTO vacancies (employer_id, post_title, num_posts, location, qualifications,
    duties, salary_scale, closing_date, status, created_by)
VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *;

-- name: UpdateVacancy :one
UPDATE vacancies SET
    post_title=$2, num_posts=$3, location=$4, qualifications=$5,
    duties=$6, salary_scale=$7, closing_date=$8, updated_at=NOW()
WHERE id=$1 RETURNING *;

-- name: UpdateVacancyStatus :one
UPDATE vacancies SET status=$2, updated_at=NOW() WHERE id=$1 RETURNING *;

-- name: DeleteVacancy :exec
DELETE FROM vacancies WHERE id=$1;

-- name: ListAllVacancies :many
SELECT v.*, e.name AS employer_name
FROM vacancies v
JOIN employers e ON e.id = v.employer_id
ORDER BY v.created_at DESC
LIMIT $1 OFFSET $2;

-- name: CountAllVacancies :one
SELECT COUNT(*) FROM vacancies;
