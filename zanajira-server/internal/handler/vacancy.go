package handler

import (
	"database/sql"
	"net/http"

	"github.com/egaz/zanajira-server/internal/service"
	"github.com/labstack/echo/v4"
)

type VacancyHandler struct {
	db        *sql.DB
	uploadSvc *service.UploadService
	emailSvc  *service.EmailService
	threshold int
}

func NewVacancyHandler(db *sql.DB, upload *service.UploadService, email *service.EmailService, threshold int) *VacancyHandler {
	return &VacancyHandler{db: db, uploadSvc: upload, emailSvc: email, threshold: threshold}
}

// GET /api/vacancies
func (h *VacancyHandler) ListVacancies(c echo.Context) error {
	limit, offset := paginationParams(c)

	rows, err := h.db.QueryContext(c.Request().Context(),
		`SELECT v.id, v.post_title, v.num_posts, v.location, v.salary_scale, v.closing_date,
		        v.status, v.created_at, e.name AS employer_name
		 FROM vacancies v
		 JOIN employers e ON e.id = v.employer_id
		 WHERE v.status = 'published' AND v.closing_date >= CURRENT_DATE
		 ORDER BY v.created_at DESC
		 LIMIT $1 OFFSET $2`, limit, offset)
	if err != nil {
		return serverError(c, err)
	}
	defer rows.Close()

	var vacancies []map[string]interface{}
	for rows.Next() {
		var id, title, location, salary, status, employer string
		var numPosts int
		var closingDate, createdAt sql.NullTime
		if err := rows.Scan(&id, &title, &numPosts, &location, &salary, &closingDate, &status, &createdAt, &employer); err != nil {
			continue
		}
		vacancies = append(vacancies, map[string]interface{}{
			"id": id, "post_title": title, "num_posts": numPosts,
			"location": location, "salary_scale": salary,
			"closing_date": closingDate, "status": status,
			"created_at": createdAt, "employer_name": employer,
		})
	}
	if vacancies == nil {
		vacancies = []map[string]interface{}{}
	}

	var total int
	_ = h.db.QueryRowContext(c.Request().Context(),
		`SELECT COUNT(*) FROM vacancies WHERE status='published' AND closing_date >= CURRENT_DATE`,
	).Scan(&total)

	return c.JSON(http.StatusOK, map[string]interface{}{"data": vacancies, "total": total})
}

// GET /api/vacancies/search
func (h *VacancyHandler) SearchVacancies(c echo.Context) error {
	q := "%" + c.QueryParam("q") + "%"
	limit, offset := paginationParams(c)

	rows, err := h.db.QueryContext(c.Request().Context(),
		`SELECT v.id, v.post_title, v.num_posts, v.location, v.salary_scale, v.closing_date,
		        v.status, v.created_at, e.name AS employer_name
		 FROM vacancies v
		 JOIN employers e ON e.id = v.employer_id
		 WHERE v.status='published' AND v.closing_date >= CURRENT_DATE
		   AND (v.post_title ILIKE $1 OR e.name ILIKE $1 OR v.qualifications ILIKE $1)
		 ORDER BY v.created_at DESC
		 LIMIT $2 OFFSET $3`, q, limit, offset)
	if err != nil {
		return serverError(c, err)
	}
	defer rows.Close()

	var vacancies []map[string]interface{}
	for rows.Next() {
		var id, title, location, salary, status, employer string
		var numPosts int
		var closingDate, createdAt sql.NullTime
		if err := rows.Scan(&id, &title, &numPosts, &location, &salary, &closingDate, &status, &createdAt, &employer); err != nil {
			continue
		}
		vacancies = append(vacancies, map[string]interface{}{
			"id": id, "post_title": title, "num_posts": numPosts,
			"location": location, "salary_scale": salary,
			"closing_date": closingDate, "employer_name": employer,
		})
	}
	if vacancies == nil {
		vacancies = []map[string]interface{}{}
	}
	return c.JSON(http.StatusOK, map[string]interface{}{"data": vacancies})
}

// GET /api/vacancies/:id
func (h *VacancyHandler) GetVacancy(c echo.Context) error {
	var v struct {
		ID            string
		PostTitle     string
		NumPosts      int
		Location      sql.NullString
		Qualifications sql.NullString
		Duties        sql.NullString
		SalaryScale   sql.NullString
		ClosingDate   sql.NullTime
		Status        string
		CreatedAt     sql.NullTime
		EmployerName  string
	}
	err := h.db.QueryRowContext(c.Request().Context(),
		`SELECT v.id, v.post_title, v.num_posts, v.location, v.qualifications, v.duties,
		        v.salary_scale, v.closing_date, v.status, v.created_at, e.name
		 FROM vacancies v JOIN employers e ON e.id=v.employer_id
		 WHERE v.id=$1`, c.Param("id"),
	).Scan(&v.ID, &v.PostTitle, &v.NumPosts, &v.Location, &v.Qualifications, &v.Duties,
		&v.SalaryScale, &v.ClosingDate, &v.Status, &v.CreatedAt, &v.EmployerName)
	if err != nil {
		return notFound(c, "vacancy not found")
	}
	return c.JSON(http.StatusOK, v)
}

// POST /api/applications
func (h *VacancyHandler) Apply(c echo.Context) error {
	userID, _ := c.Get("user_id").(string)

	// Resolve applicant
	var applicantID string
	var completionPct int
	err := h.db.QueryRowContext(c.Request().Context(),
		`SELECT id, profile_completion_pct FROM applicants WHERE user_id=$1`, userID,
	).Scan(&applicantID, &completionPct)
	if err != nil {
		return badRequest(c, "applicant profile not found")
	}

	if completionPct < h.threshold {
		return c.JSON(http.StatusUnprocessableEntity, map[string]interface{}{
			"error":          "profile must be at least 70% complete before applying",
			"completion_pct": completionPct,
			"required_pct":   h.threshold,
		})
	}

	vacancyID := c.FormValue("vacancy_id")
	if vacancyID == "" {
		return badRequest(c, "vacancy_id is required")
	}

	// Check vacancy is open
	var closingDate sql.NullTime
	var status string
	err = h.db.QueryRowContext(c.Request().Context(),
		`SELECT closing_date, status FROM vacancies WHERE id=$1`, vacancyID,
	).Scan(&closingDate, &status)
	if err != nil {
		return notFound(c, "vacancy not found")
	}
	if status != "published" {
		return badRequest(c, "this vacancy is not open for applications")
	}

	// Upload application letter
	file, err := c.FormFile("letter")
	if err != nil {
		return badRequest(c, "application letter (PDF) is required")
	}
	letterPath, err := h.uploadSvc.SaveFile(file, service.UploadTypeLetter)
	if err != nil {
		return badRequest(c, err.Error())
	}

	// Insert application
	var appID string
	err = h.db.QueryRowContext(c.Request().Context(),
		`INSERT INTO applications (applicant_id, vacancy_id, application_letter_path)
		 VALUES ($1,$2,$3) RETURNING id`,
		applicantID, vacancyID, letterPath,
	).Scan(&appID)
	if err != nil {
		if isUniqueViolation(err) {
			return c.JSON(http.StatusConflict, map[string]string{"error": "you have already applied for this vacancy"})
		}
		return serverError(c, err)
	}

	// Send confirmation email (non-blocking)
	var email, postTitle, employerName string
	_ = h.db.QueryRowContext(c.Request().Context(),
		`SELECT u.email, v.post_title, e.name
		 FROM users u
		 JOIN applicants a ON a.user_id=u.id
		 JOIN vacancies v ON v.id=$2
		 JOIN employers e ON e.id=v.employer_id
		 WHERE a.id=$1`, applicantID, vacancyID,
	).Scan(&email, &postTitle, &employerName)
	go func() { _ = h.emailSvc.SendApplicationConfirmation(email, postTitle, employerName) }()

	return c.JSON(http.StatusCreated, map[string]string{
		"id":      appID,
		"message": "Application submitted successfully.",
	})
}

// GET /api/applications/me
func (h *VacancyHandler) MyApplications(c echo.Context) error {
	userID, _ := c.Get("user_id").(string)

	var applicantID string
	err := h.db.QueryRowContext(c.Request().Context(),
		`SELECT id FROM applicants WHERE user_id=$1`, userID,
	).Scan(&applicantID)
	if err != nil {
		return c.JSON(http.StatusOK, map[string]interface{}{"data": []interface{}{}})
	}

	rows, err := h.db.QueryContext(c.Request().Context(),
		`SELECT a.id, a.status, a.applied_at, v.post_title, v.closing_date, v.salary_scale, e.name
		 FROM applications a
		 JOIN vacancies v ON v.id=a.vacancy_id
		 JOIN employers e ON e.id=v.employer_id
		 WHERE a.applicant_id=$1
		 ORDER BY a.applied_at DESC`, applicantID)
	if err != nil {
		return serverError(c, err)
	}
	defer rows.Close()

	var apps []map[string]interface{}
	for rows.Next() {
		var id, status, postTitle, salary, employer string
		var appliedAt, closingDate sql.NullTime
		if err := rows.Scan(&id, &status, &appliedAt, &postTitle, &closingDate, &salary, &employer); err != nil {
			continue
		}
		apps = append(apps, map[string]interface{}{
			"id": id, "status": status, "applied_at": appliedAt,
			"post_title": postTitle, "closing_date": closingDate,
			"salary_scale": salary, "employer_name": employer,
		})
	}
	if apps == nil {
		apps = []map[string]interface{}{}
	}
	return c.JSON(http.StatusOK, map[string]interface{}{"data": apps})
}

// PUT /api/applications/:id/letter
func (h *VacancyHandler) ReplaceLetter(c echo.Context) error {
	userID, _ := c.Get("user_id").(string)
	appID := c.Param("id")

	var applicantID string
	err := h.db.QueryRowContext(c.Request().Context(),
		`SELECT id FROM applicants WHERE user_id=$1`, userID,
	).Scan(&applicantID)
	if err != nil {
		return badRequest(c, "applicant not found")
	}

	// Verify ownership and closing date
	var closingDate sql.NullTime
	err = h.db.QueryRowContext(c.Request().Context(),
		`SELECT v.closing_date FROM applications a
		 JOIN vacancies v ON v.id=a.vacancy_id
		 WHERE a.id=$1 AND a.applicant_id=$2`, appID, applicantID,
	).Scan(&closingDate)
	if err != nil {
		return notFound(c, "application not found")
	}

	file, err := c.FormFile("letter")
	if err != nil {
		return badRequest(c, "letter file is required")
	}
	letterPath, err := h.uploadSvc.SaveFile(file, service.UploadTypeLetter)
	if err != nil {
		return badRequest(c, err.Error())
	}

	_, err = h.db.ExecContext(c.Request().Context(),
		`UPDATE applications SET application_letter_path=$2, updated_at=NOW() WHERE id=$1`,
		appID, letterPath)
	if err != nil {
		return serverError(c, err)
	}

	return c.JSON(http.StatusOK, map[string]string{"message": "Application letter replaced.", "path": letterPath})
}
