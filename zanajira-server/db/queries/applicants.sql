-- name: CreateApplicant :one
INSERT INTO applicants (user_id) VALUES ($1) RETURNING *;

-- name: GetApplicantByUserID :one
SELECT * FROM applicants WHERE user_id = $1 LIMIT 1;

-- name: GetApplicantByID :one
SELECT * FROM applicants WHERE id = $1 LIMIT 1;

-- name: GetApplicantByZanID :one
SELECT * FROM applicants WHERE zanid = $1 LIMIT 1;

-- name: UpdatePersonalDetails :one
UPDATE applicants SET
    zanid = $2, first_name = $3, last_name = $4, sex = $5,
    date_of_birth = $6, nationality = $7, originality = $8,
    govt_employment_status = $9, marital_status = $10, impairment = $11,
    updated_at = NOW()
WHERE id = $1 RETURNING *;

-- name: UpdatePhoto :one
UPDATE applicants SET photo_path = $2, updated_at = NOW() WHERE id = $1 RETURNING *;

-- name: UpdateProfileCompletion :one
UPDATE applicants SET profile_completion_pct = $2, updated_at = NOW() WHERE id = $1 RETURNING *;

-- name: SetDeclaration :one
UPDATE applicants
SET declaration_accepted = TRUE, declaration_at = NOW(), updated_at = NOW()
WHERE id = $1 RETURNING *;

-- name: ListApplicants :many
SELECT a.id, a.zanid, a.first_name, a.last_name, a.profile_completion_pct,
       u.email, u.is_active, u.created_at
FROM applicants a
JOIN users u ON u.id = a.user_id
ORDER BY u.created_at DESC
LIMIT $1 OFFSET $2;

-- name: CountApplicants :one
SELECT COUNT(*) FROM applicants;

-- name: SearchApplicants :many
SELECT a.id, a.zanid, a.first_name, a.last_name, a.profile_completion_pct,
       u.email, u.is_active, u.created_at
FROM applicants a
JOIN users u ON u.id = a.user_id
WHERE a.first_name ILIKE $1 OR a.last_name ILIKE $1 OR u.email ILIKE $1 OR a.zanid ILIKE $1
ORDER BY u.created_at DESC
LIMIT $2 OFFSET $3;

-- Contact Details
-- name: UpsertContactDetails :one
INSERT INTO contact_details (applicant_id, country, state_city, province_county,
    mobile_number, alt_email, present_address, birth_cert_path)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
ON CONFLICT (applicant_id) DO UPDATE SET
    country = EXCLUDED.country, state_city = EXCLUDED.state_city,
    province_county = EXCLUDED.province_county, mobile_number = EXCLUDED.mobile_number,
    alt_email = EXCLUDED.alt_email, present_address = EXCLUDED.present_address,
    birth_cert_path = COALESCE(EXCLUDED.birth_cert_path, contact_details.birth_cert_path),
    updated_at = NOW()
RETURNING *;

-- name: GetContactDetails :one
SELECT * FROM contact_details WHERE applicant_id = $1 LIMIT 1;

-- Academic Qualifications
-- name: CreateAcademicQualification :one
INSERT INTO academic_qualifications (applicant_id, education_level, country, institution_id,
    programme_id, programme_category, year_from, year_to, gpa_result, cert_path,
    tcu_cert_path, nacte_cert_path, necta_cert_path, lost_cert_index, lost_cert_year)
VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
RETURNING *;

-- name: UpdateAcademicQualification :one
UPDATE academic_qualifications SET
    education_level = $3, country = $4, institution_id = $5, programme_id = $6,
    programme_category = $7, year_from = $8, year_to = $9, gpa_result = $10,
    updated_at = NOW()
WHERE id = $1 AND applicant_id = $2 RETURNING *;

-- name: DeleteAcademicQualification :exec
DELETE FROM academic_qualifications WHERE id = $1 AND applicant_id = $2;

-- name: ListAcademicQualifications :many
SELECT * FROM academic_qualifications WHERE applicant_id = $1 ORDER BY year_from;

-- Professional Qualifications
-- name: CreateProfessionalQualification :one
INSERT INTO professional_qualifications (applicant_id, country, institution, course_name, start_date, end_date, cert_path)
VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *;

-- name: UpdateProfessionalQualification :one
UPDATE professional_qualifications SET
    country=$3, institution=$4, course_name=$5, start_date=$6, end_date=$7, updated_at=NOW()
WHERE id=$1 AND applicant_id=$2 RETURNING *;

-- name: DeleteProfessionalQualification :exec
DELETE FROM professional_qualifications WHERE id=$1 AND applicant_id=$2;

-- name: ListProfessionalQualifications :many
SELECT * FROM professional_qualifications WHERE applicant_id=$1 ORDER BY start_date;

-- Language Proficiencies
-- name: CreateLanguageProficiency :one
INSERT INTO language_proficiencies (applicant_id, language, speaking, reading, writing)
VALUES ($1,$2,$3,$4,$5) RETURNING *;

-- name: DeleteLanguageProficiency :exec
DELETE FROM language_proficiencies WHERE id=$1 AND applicant_id=$2;

-- name: ListLanguageProficiencies :many
SELECT * FROM language_proficiencies WHERE applicant_id=$1 ORDER BY language;

-- Work Experiences
-- name: CreateWorkExperience :one
INSERT INTO work_experiences (applicant_id, organization, job_title, supervisor_name,
    supervisor_address, supervisor_mobile, duties, start_date, end_date, is_current)
VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *;

-- name: UpdateWorkExperience :one
UPDATE work_experiences SET
    organization=$3, job_title=$4, supervisor_name=$5, supervisor_address=$6,
    supervisor_mobile=$7, duties=$8, start_date=$9, end_date=$10, is_current=$11, updated_at=NOW()
WHERE id=$1 AND applicant_id=$2 RETURNING *;

-- name: DeleteWorkExperience :exec
DELETE FROM work_experiences WHERE id=$1 AND applicant_id=$2;

-- name: ListWorkExperiences :many
SELECT * FROM work_experiences WHERE applicant_id=$1 ORDER BY start_date DESC;

-- Trainings
-- name: CreateTraining :one
INSERT INTO trainings (applicant_id, name, institution, description, start_date, end_date, cert_path)
VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *;

-- name: DeleteTraining :exec
DELETE FROM trainings WHERE id=$1 AND applicant_id=$2;

-- name: ListTrainings :many
SELECT * FROM trainings WHERE applicant_id=$1 ORDER BY start_date DESC;

-- Computer Skills
-- name: UpsertComputerSkill :one
INSERT INTO computer_skills (applicant_id, skill, proficiency, cert_path)
VALUES ($1,$2,$3,$4)
ON CONFLICT (applicant_id, skill) DO UPDATE SET
    proficiency = EXCLUDED.proficiency,
    cert_path = COALESCE(EXCLUDED.cert_path, computer_skills.cert_path),
    updated_at = NOW()
RETURNING *;

-- name: ListComputerSkills :many
SELECT * FROM computer_skills WHERE applicant_id=$1 ORDER BY skill;

-- Referees
-- name: CreateReferee :one
INSERT INTO referees (applicant_id, title, full_name, organization, email, mobile, postal_address)
VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *;

-- name: UpdateReferee :one
UPDATE referees SET
    title=$3, full_name=$4, organization=$5, email=$6, mobile=$7, postal_address=$8, updated_at=NOW()
WHERE id=$1 AND applicant_id=$2 RETURNING *;

-- name: DeleteReferee :exec
DELETE FROM referees WHERE id=$1 AND applicant_id=$2;

-- name: ListReferees :many
SELECT * FROM referees WHERE applicant_id=$1 ORDER BY created_at;

-- name: CountReferees :one
SELECT COUNT(*) FROM referees WHERE applicant_id=$1;

-- Other Attachments
-- name: CreateAttachment :one
INSERT INTO other_attachments (applicant_id, type, file_path)
VALUES ($1,$2,$3) RETURNING *;

-- name: DeleteAttachment :exec
DELETE FROM other_attachments WHERE id=$1 AND applicant_id=$2;

-- name: ListAttachments :many
SELECT * FROM other_attachments WHERE applicant_id=$1 ORDER BY created_at;
