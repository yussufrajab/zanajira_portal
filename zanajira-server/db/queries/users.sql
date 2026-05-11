-- name: CreateUser :one
INSERT INTO users (email, password_hash, role, activation_token, activation_expires)
VALUES ($1, $2, 'applicant', $3, NOW() + INTERVAL '24 hours')
RETURNING *;

-- name: GetUserByEmail :one
SELECT * FROM users WHERE email = $1 LIMIT 1;

-- name: GetUserByID :one
SELECT * FROM users WHERE id = $1 LIMIT 1;

-- name: ActivateUser :one
UPDATE users
SET is_active = TRUE, activation_token = NULL, activation_expires = NULL, updated_at = NOW()
WHERE activation_token = $1 AND activation_expires > NOW()
RETURNING *;

-- name: SetResetToken :one
UPDATE users
SET reset_token = $2, reset_expires = NOW() + INTERVAL '2 hours', updated_at = NOW()
WHERE email = $1
RETURNING *;

-- name: ResetPassword :one
UPDATE users
SET password_hash = $2, reset_token = NULL, reset_expires = NULL, updated_at = NOW()
WHERE reset_token = $1 AND reset_expires > NOW()
RETURNING *;

-- name: UpdatePassword :one
UPDATE users
SET password_hash = $2, updated_at = NOW()
WHERE id = $1
RETURNING *;

-- name: ListUsers :many
SELECT id, email, role, is_active, created_at FROM users
ORDER BY created_at DESC
LIMIT $1 OFFSET $2;

-- name: CountUsers :one
SELECT COUNT(*) FROM users;

-- name: UpdateUserRole :one
UPDATE users SET role = $2, updated_at = NOW() WHERE id = $1 RETURNING *;

-- name: DeactivateUser :one
UPDATE users SET is_active = FALSE, updated_at = NOW() WHERE id = $1 RETURNING *;
