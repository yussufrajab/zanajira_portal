package handler

import (
	"database/sql"
	"encoding/json"
	"net/http"

	"github.com/egaz/zanajira-server/internal/service"
	"github.com/labstack/echo/v4"
)

type AdminHandler struct {
	db       *sql.DB
	emailSvc *service.EmailService
}

func NewAdminHandler(db *sql.DB, email *service.EmailService) *AdminHandler {
	return &AdminHandler{db: db, emailSvc: email}
}

// GET /api/admin/dashboard
func (h *AdminHandler) Dashboard(c echo.Context) error {
	var total, newApplicants, inProgress, placements int
	_ = h.db.QueryRowContext(c.Request().Context(),
		`SELECT
		  (SELECT COUNT(*) FROM applicants),
		  (SELECT COUNT(*) FROM applicants WHERE created_at >= NOW() - INTERVAL '30 days'),
		  (SELECT COUNT(*) FROM applications WHERE status='in_progress'),
		  (SELECT COUNT(*) FROM applications WHERE status='placed')`,
	).Scan(&total, &newApplicants, &inProgress, &placements)

	// Employer distribution
	rows, _ := h.db.QueryContext(c.Request().Context(),
		`SELECT e.name, COUNT(a.id) AS cnt
		 FROM employers e
		 LEFT JOIN vacancies v ON v.employer_id=e.id
		 LEFT JOIN applications a ON a.vacancy_id=v.id
		 GROUP BY e.id, e.name ORDER BY cnt DESC LIMIT 20`)
	var employers []map[string]interface{}
	if rows != nil {
		defer rows.Close()
		for rows.Next() {
			var name string
			var cnt int
			_ = rows.Scan(&name, &cnt)
			employers = append(employers, map[string]interface{}{"employer": name, "count": cnt})
		}
	}
	if employers == nil {
		employers = []map[string]interface{}{}
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"total_applicants": total,
		"new_applicants":   newApplicants,
		"in_progress":      inProgress,
		"placements":       placements,
		"employers":        employers,
	})
}

// GET /api/admin/applicants
func (h *AdminHandler) ListApplicants(c echo.Context) error {
	limit, offset := paginationParams(c)
	q := c.QueryParam("q")

	var rows *sql.Rows
	var err error
	if q != "" {
		like := "%" + q + "%"
		rows, err = h.db.QueryContext(c.Request().Context(),
			`SELECT a.id, a.zanid, a.first_name, a.last_name, a.profile_completion_pct,
			        u.email, u.is_active, u.created_at
			 FROM applicants a JOIN users u ON u.id=a.user_id
			 WHERE a.first_name ILIKE $1 OR a.last_name ILIKE $1 OR u.email ILIKE $1 OR a.zanid ILIKE $1
			 ORDER BY u.created_at DESC LIMIT $2 OFFSET $3`, like, limit, offset)
	} else {
		rows, err = h.db.QueryContext(c.Request().Context(),
			`SELECT a.id, a.zanid, a.first_name, a.last_name, a.profile_completion_pct,
			        u.email, u.is_active, u.created_at
			 FROM applicants a JOIN users u ON u.id=a.user_id
			 ORDER BY u.created_at DESC LIMIT $1 OFFSET $2`, limit, offset)
	}
	if err != nil {
		return serverError(c, err)
	}
	defer rows.Close()

	var applicants []map[string]interface{}
	for rows.Next() {
		var id, firstName, lastName, email string
		var zanid sql.NullString
		var pct int
		var isActive bool
		var createdAt sql.NullTime
		_ = rows.Scan(&id, &zanid, &firstName, &lastName, &pct, &email, &isActive, &createdAt)
		applicants = append(applicants, map[string]interface{}{
			"id": id, "zanid": zanid, "first_name": firstName, "last_name": lastName,
			"completion_pct": pct, "email": email, "is_active": isActive, "created_at": createdAt,
		})
	}
	if applicants == nil {
		applicants = []map[string]interface{}{}
	}

	var total int
	_ = h.db.QueryRowContext(c.Request().Context(), `SELECT COUNT(*) FROM applicants`).Scan(&total)

	return c.JSON(http.StatusOK, map[string]interface{}{"data": applicants, "total": total})
}

// GET /api/admin/audit-logs
func (h *AdminHandler) AuditLogs(c echo.Context) error {
	limit, offset := paginationParams(c)
	rows, err := h.db.QueryContext(c.Request().Context(),
		`SELECT al.id, al.action, al.resource, al.resource_id, al.ip_address, al.timestamp, u.email
		 FROM audit_logs al LEFT JOIN users u ON u.id=al.user_id
		 ORDER BY al.timestamp DESC LIMIT $1 OFFSET $2`, limit, offset)
	if err != nil {
		return serverError(c, err)
	}
	defer rows.Close()

	var logs []map[string]interface{}
	for rows.Next() {
		var id, action, resource string
		var resourceID, ipAddr, email sql.NullString
		var ts sql.NullTime
		_ = rows.Scan(&id, &action, &resource, &resourceID, &ipAddr, &ts, &email)
		logs = append(logs, map[string]interface{}{
			"id": id, "action": action, "resource": resource,
			"resource_id": resourceID, "ip_address": ipAddr,
			"timestamp": ts, "user_email": email,
		})
	}
	if logs == nil {
		logs = []map[string]interface{}{}
	}
	return c.JSON(http.StatusOK, map[string]interface{}{"data": logs})
}

// GET /api/admin/config
func (h *AdminHandler) GetConfig(c echo.Context) error {
	rows, err := h.db.QueryContext(c.Request().Context(), `SELECT key, value FROM system_config ORDER BY key`)
	if err != nil {
		return serverError(c, err)
	}
	defer rows.Close()

	config := map[string]string{}
	for rows.Next() {
		var k, v string
		_ = rows.Scan(&k, &v)
		config[k] = v
	}
	return c.JSON(http.StatusOK, config)
}

// PUT /api/admin/config
func (h *AdminHandler) UpdateConfig(c echo.Context) error {
	var updates map[string]string
	if err := c.Bind(&updates); err != nil {
		return badRequest(c, "invalid request body")
	}
	for k, v := range updates {
		_, err := h.db.ExecContext(c.Request().Context(),
			`INSERT INTO system_config (key, value, updated_at) VALUES ($1,$2,NOW())
			 ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value, updated_at=NOW()`, k, v)
		if err != nil {
			return serverError(c, err)
		}
	}
	return c.JSON(http.StatusOK, map[string]string{"message": "Configuration updated."})
}

// ─── Vacancy Management ───────────────────────────────────────────────────────

// GET /api/admin/vacancies
func (h *AdminHandler) ListVacancies(c echo.Context) error {
	limit, offset := paginationParams(c)
	rows, err := h.db.QueryContext(c.Request().Context(),
		`SELECT v.id, v.post_title, v.num_posts, v.location, v.salary_scale,
		        v.closing_date, v.status, v.created_at, e.name
		 FROM vacancies v JOIN employers e ON e.id=v.employer_id
		 ORDER BY v.created_at DESC LIMIT $1 OFFSET $2`, limit, offset)
	if err != nil {
		return serverError(c, err)
	}
	defer rows.Close()

	var vacancies []map[string]interface{}
	for rows.Next() {
		var id, title, location, salary, status, employer string
		var numPosts int
		var closingDate, createdAt sql.NullTime
		_ = rows.Scan(&id, &title, &numPosts, &location, &salary, &closingDate, &status, &createdAt, &employer)
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
	_ = h.db.QueryRowContext(c.Request().Context(), `SELECT COUNT(*) FROM vacancies`).Scan(&total)
	return c.JSON(http.StatusOK, map[string]interface{}{"data": vacancies, "total": total})
}

// POST /api/admin/vacancies
func (h *AdminHandler) CreateVacancy(c echo.Context) error {
	userID, _ := c.Get("user_id").(string)
	var req struct {
		EmployerID     int    `json:"employer_id"`
		PostTitle      string `json:"post_title"`
		NumPosts       int    `json:"num_posts"`
		Location       string `json:"location"`
		Qualifications string `json:"qualifications"`
		Duties         string `json:"duties"`
		SalaryScale    string `json:"salary_scale"`
		ClosingDate    string `json:"closing_date"`
	}
	if err := c.Bind(&req); err != nil {
		return badRequest(c, "invalid request body")
	}
	if req.PostTitle == "" || req.ClosingDate == "" {
		return badRequest(c, "post_title and closing_date are required")
	}

	var id string
	err := h.db.QueryRowContext(c.Request().Context(),
		`INSERT INTO vacancies (employer_id, post_title, num_posts, location, qualifications,
		 duties, salary_scale, closing_date, status, created_by)
		 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'draft',$9) RETURNING id`,
		req.EmployerID, req.PostTitle, req.NumPosts, req.Location, req.Qualifications,
		req.Duties, req.SalaryScale, req.ClosingDate, userID,
	).Scan(&id)
	if err != nil {
		return serverError(c, err)
	}
	return c.JSON(http.StatusCreated, map[string]string{"id": id, "message": "Vacancy created."})
}

// PUT /api/admin/vacancies/:id
func (h *AdminHandler) UpdateVacancy(c echo.Context) error {
	var req struct {
		PostTitle      string `json:"post_title"`
		NumPosts       int    `json:"num_posts"`
		Location       string `json:"location"`
		Qualifications string `json:"qualifications"`
		Duties         string `json:"duties"`
		SalaryScale    string `json:"salary_scale"`
		ClosingDate    string `json:"closing_date"`
	}
	if err := c.Bind(&req); err != nil {
		return badRequest(c, "invalid request body")
	}
	_, err := h.db.ExecContext(c.Request().Context(),
		`UPDATE vacancies SET post_title=$2, num_posts=$3, location=$4, qualifications=$5,
		 duties=$6, salary_scale=$7, closing_date=$8, updated_at=NOW() WHERE id=$1`,
		c.Param("id"), req.PostTitle, req.NumPosts, req.Location, req.Qualifications,
		req.Duties, req.SalaryScale, req.ClosingDate)
	if err != nil {
		return serverError(c, err)
	}
	return c.JSON(http.StatusOK, map[string]string{"message": "Vacancy updated."})
}

// PUT /api/admin/vacancies/:id/status
func (h *AdminHandler) UpdateVacancyStatus(c echo.Context) error {
	var req struct {
		Status string `json:"status"`
	}
	if err := c.Bind(&req); err != nil {
		return badRequest(c, "invalid request body")
	}
	_, err := h.db.ExecContext(c.Request().Context(),
		`UPDATE vacancies SET status=$2, updated_at=NOW() WHERE id=$1`, c.Param("id"), req.Status)
	if err != nil {
		return serverError(c, err)
	}
	return c.JSON(http.StatusOK, map[string]string{"message": "Status updated."})
}

// DELETE /api/admin/vacancies/:id
func (h *AdminHandler) DeleteVacancy(c echo.Context) error {
	_, err := h.db.ExecContext(c.Request().Context(), `DELETE FROM vacancies WHERE id=$1`, c.Param("id"))
	if err != nil {
		return serverError(c, err)
	}
	return c.JSON(http.StatusOK, map[string]string{"message": "Vacancy deleted."})
}

// GET /api/admin/vacancies/:id/applicants
func (h *AdminHandler) VacancyApplicants(c echo.Context) error {
	limit, offset := paginationParams(c)
	rows, err := h.db.QueryContext(c.Request().Context(),
		`SELECT a.id, a.status, a.applied_at,
		        ap.first_name, ap.last_name, ap.zanid, ap.profile_completion_pct, u.email
		 FROM applications a
		 JOIN applicants ap ON ap.id=a.applicant_id
		 JOIN users u ON u.id=ap.user_id
		 WHERE a.vacancy_id=$1
		 ORDER BY a.applied_at DESC LIMIT $2 OFFSET $3`,
		c.Param("id"), limit, offset)
	if err != nil {
		return serverError(c, err)
	}
	defer rows.Close()

	var applicants []map[string]interface{}
	for rows.Next() {
		var id, status, firstName, lastName, email string
		var zanid sql.NullString
		var pct int
		var appliedAt sql.NullTime
		_ = rows.Scan(&id, &status, &appliedAt, &firstName, &lastName, &zanid, &pct, &email)
		applicants = append(applicants, map[string]interface{}{
			"application_id": id, "status": status, "applied_at": appliedAt,
			"first_name": firstName, "last_name": lastName, "zanid": zanid,
			"completion_pct": pct, "email": email,
		})
	}
	if applicants == nil {
		applicants = []map[string]interface{}{}
	}
	return c.JSON(http.StatusOK, map[string]interface{}{"data": applicants})
}

// PUT /api/admin/applications/:id/status
func (h *AdminHandler) UpdateApplicationStatus(c echo.Context) error {
	var req struct {
		Status string `json:"status"`
	}
	if err := c.Bind(&req); err != nil {
		return badRequest(c, "invalid request body")
	}

	var email, postTitle string
	err := h.db.QueryRowContext(c.Request().Context(),
		`UPDATE applications SET status=$2, updated_at=NOW() WHERE id=$1
		 RETURNING (SELECT u.email FROM users u JOIN applicants a ON a.user_id=u.id WHERE a.id=applications.applicant_id),
		           (SELECT v.post_title FROM vacancies v WHERE v.id=applications.vacancy_id)`,
		c.Param("id"), req.Status,
	).Scan(&email, &postTitle)
	if err != nil {
		return serverError(c, err)
	}

	go func() { _ = h.emailSvc.SendStatusUpdate(email, postTitle, req.Status) }()
	return c.JSON(http.StatusOK, map[string]string{"message": "Application status updated."})
}

// ─── Staff Management ─────────────────────────────────────────────────────────

// GET /api/admin/staff
func (h *AdminHandler) ListStaff(c echo.Context) error {
	rows, err := h.db.QueryContext(c.Request().Context(),
		`SELECT id, email, role, is_active, created_at FROM users
		 WHERE role IN ('admin','staff','employer') ORDER BY created_at DESC`)
	if err != nil {
		return serverError(c, err)
	}
	defer rows.Close()

	var staff []map[string]interface{}
	for rows.Next() {
		var id, email, role string
		var isActive bool
		var createdAt sql.NullTime
		_ = rows.Scan(&id, &email, &role, &isActive, &createdAt)
		staff = append(staff, map[string]interface{}{
			"id": id, "email": email, "role": role, "is_active": isActive, "created_at": createdAt,
		})
	}
	if staff == nil {
		staff = []map[string]interface{}{}
	}
	return c.JSON(http.StatusOK, map[string]interface{}{"data": staff})
}

// POST /api/admin/staff
func (h *AdminHandler) CreateStaff(c echo.Context) error {
	var req struct {
		Email    string `json:"email"`
		Password string `json:"password"`
		Role     string `json:"role"`
	}
	if err := c.Bind(&req); err != nil {
		return badRequest(c, "invalid request body")
	}

	hash, err := service.HashPassword(req.Password)
	if err != nil {
		return badRequest(c, err.Error())
	}

	var id string
	err = h.db.QueryRowContext(c.Request().Context(),
		`INSERT INTO users (email, password_hash, role, is_active)
		 VALUES ($1,$2,$3,TRUE) RETURNING id`,
		req.Email, hash, req.Role,
	).Scan(&id)
	if err != nil {
		if isUniqueViolation(err) {
			return c.JSON(http.StatusConflict, map[string]string{"error": "email already registered"})
		}
		return serverError(c, err)
	}
	return c.JSON(http.StatusCreated, map[string]string{"id": id, "message": "Staff account created."})
}

// PUT /api/admin/staff/:id
func (h *AdminHandler) UpdateStaff(c echo.Context) error {
	var req struct {
		Role     string `json:"role"`
		IsActive *bool  `json:"is_active"`
	}
	if err := c.Bind(&req); err != nil {
		return badRequest(c, "invalid request body")
	}
	_, err := h.db.ExecContext(c.Request().Context(),
		`UPDATE users SET role=$2, is_active=$3, updated_at=NOW() WHERE id=$1`,
		c.Param("id"), req.Role, req.IsActive)
	if err != nil {
		return serverError(c, err)
	}
	return c.JSON(http.StatusOK, map[string]string{"message": "Staff updated."})
}

// DELETE /api/admin/staff/:id
func (h *AdminHandler) DeleteStaff(c echo.Context) error {
	_, err := h.db.ExecContext(c.Request().Context(),
		`UPDATE users SET is_active=FALSE, updated_at=NOW() WHERE id=$1`, c.Param("id"))
	if err != nil {
		return serverError(c, err)
	}
	return c.JSON(http.StatusOK, map[string]string{"message": "Staff account deactivated."})
}

// ─── Reference Data CRUD helpers ─────────────────────────────────────────────

// GET /api/admin/academic-levels
func (h *AdminHandler) ListAcademicLevels(c echo.Context) error {
	return h.listSimple(c, `SELECT id, name, sort_order FROM academic_levels ORDER BY sort_order`)
}

func (h *AdminHandler) CreateAcademicLevel(c echo.Context) error {
	var req struct {
		Name      string `json:"name"`
		SortOrder int    `json:"sort_order"`
	}
	if err := c.Bind(&req); err != nil {
		return badRequest(c, "invalid request body")
	}
	var id int
	err := h.db.QueryRowContext(c.Request().Context(),
		`INSERT INTO academic_levels (name, sort_order) VALUES ($1,$2) RETURNING id`, req.Name, req.SortOrder,
	).Scan(&id)
	if err != nil {
		return serverError(c, err)
	}
	return c.JSON(http.StatusCreated, map[string]interface{}{"id": id})
}

func (h *AdminHandler) UpdateAcademicLevel(c echo.Context) error {
	var req struct {
		Name      string `json:"name"`
		SortOrder int    `json:"sort_order"`
	}
	if err := c.Bind(&req); err != nil {
		return badRequest(c, "invalid request body")
	}
	_, err := h.db.ExecContext(c.Request().Context(),
		`UPDATE academic_levels SET name=$2, sort_order=$3 WHERE id=$1`, c.Param("id"), req.Name, req.SortOrder)
	if err != nil {
		return serverError(c, err)
	}
	return c.JSON(http.StatusOK, map[string]string{"message": "Updated."})
}

func (h *AdminHandler) DeleteAcademicLevel(c echo.Context) error {
	return h.deleteByID(c, "academic_levels")
}

// Academic Institutions
func (h *AdminHandler) ListAcademicInstitutions(c echo.Context) error {
	return h.listSimple(c, `SELECT id, name, country, type FROM academic_institutions ORDER BY name`)
}

func (h *AdminHandler) CreateAcademicInstitution(c echo.Context) error {
	var req struct {
		Name    string `json:"name"`
		Country string `json:"country"`
		Type    string `json:"type"`
	}
	if err := c.Bind(&req); err != nil {
		return badRequest(c, "invalid request body")
	}
	var id int
	err := h.db.QueryRowContext(c.Request().Context(),
		`INSERT INTO academic_institutions (name, country, type) VALUES ($1,$2,$3) RETURNING id`,
		req.Name, req.Country, req.Type,
	).Scan(&id)
	if err != nil {
		return serverError(c, err)
	}
	return c.JSON(http.StatusCreated, map[string]interface{}{"id": id})
}

func (h *AdminHandler) UpdateAcademicInstitution(c echo.Context) error {
	var req struct {
		Name    string `json:"name"`
		Country string `json:"country"`
		Type    string `json:"type"`
	}
	if err := c.Bind(&req); err != nil {
		return badRequest(c, "invalid request body")
	}
	_, err := h.db.ExecContext(c.Request().Context(),
		`UPDATE academic_institutions SET name=$2, country=$3, type=$4 WHERE id=$1`,
		c.Param("id"), req.Name, req.Country, req.Type)
	if err != nil {
		return serverError(c, err)
	}
	return c.JSON(http.StatusOK, map[string]string{"message": "Updated."})
}

func (h *AdminHandler) DeleteAcademicInstitution(c echo.Context) error {
	return h.deleteByID(c, "academic_institutions")
}

// Academic Programmes
func (h *AdminHandler) ListAcademicProgrammes(c echo.Context) error {
	return h.listSimple(c, `SELECT p.id, p.name, p.category, l.name AS level_name FROM academic_programmes p JOIN academic_levels l ON l.id=p.level_id ORDER BY p.name`)
}

func (h *AdminHandler) CreateAcademicProgramme(c echo.Context) error {
	var req struct {
		LevelID       int    `json:"level_id"`
		InstitutionID *int   `json:"institution_id"`
		Name          string `json:"name"`
		Category      string `json:"category"`
	}
	if err := c.Bind(&req); err != nil {
		return badRequest(c, "invalid request body")
	}
	var id int
	err := h.db.QueryRowContext(c.Request().Context(),
		`INSERT INTO academic_programmes (level_id, institution_id, name, category) VALUES ($1,$2,$3,$4) RETURNING id`,
		req.LevelID, req.InstitutionID, req.Name, req.Category,
	).Scan(&id)
	if err != nil {
		return serverError(c, err)
	}
	return c.JSON(http.StatusCreated, map[string]interface{}{"id": id})
}

func (h *AdminHandler) DeleteAcademicProgramme(c echo.Context) error {
	return h.deleteByID(c, "academic_programmes")
}

// Academic Subscriptions
func (h *AdminHandler) ListAcademicSubscriptions(c echo.Context) error {
	return h.listSimple(c, `SELECT s.id, i.name AS institution, p.name AS programme FROM academic_subscriptions s JOIN academic_institutions i ON i.id=s.institution_id JOIN academic_programmes p ON p.id=s.programme_id`)
}

func (h *AdminHandler) CreateAcademicSubscription(c echo.Context) error {
	var req struct {
		InstitutionID int `json:"institution_id"`
		ProgrammeID   int `json:"programme_id"`
	}
	if err := c.Bind(&req); err != nil {
		return badRequest(c, "invalid request body")
	}
	var id int
	err := h.db.QueryRowContext(c.Request().Context(),
		`INSERT INTO academic_subscriptions (institution_id, programme_id) VALUES ($1,$2) RETURNING id`,
		req.InstitutionID, req.ProgrammeID,
	).Scan(&id)
	if err != nil {
		return serverError(c, err)
	}
	return c.JSON(http.StatusCreated, map[string]interface{}{"id": id})
}

func (h *AdminHandler) DeleteAcademicSubscription(c echo.Context) error {
	return h.deleteByID(c, "academic_subscriptions")
}

// Computer Skills
func (h *AdminHandler) ListComputerSkillDefs(c echo.Context) error {
	return h.listSimple(c, `SELECT id, name FROM computer_skill_definitions ORDER BY name`)
}

func (h *AdminHandler) CreateComputerSkillDef(c echo.Context) error {
	var req struct{ Name string `json:"name"` }
	if err := c.Bind(&req); err != nil {
		return badRequest(c, "invalid request body")
	}
	var id int
	err := h.db.QueryRowContext(c.Request().Context(),
		`INSERT INTO computer_skill_definitions (name) VALUES ($1) RETURNING id`, req.Name,
	).Scan(&id)
	if err != nil {
		return serverError(c, err)
	}
	return c.JSON(http.StatusCreated, map[string]interface{}{"id": id})
}

func (h *AdminHandler) DeleteComputerSkillDef(c echo.Context) error {
	return h.deleteByID(c, "computer_skill_definitions")
}

// Professional Courses
func (h *AdminHandler) ListProfessionalCourses(c echo.Context) error {
	return h.listSimple(c, `SELECT id, name FROM professional_courses ORDER BY name`)
}

func (h *AdminHandler) CreateProfessionalCourse(c echo.Context) error {
	var req struct{ Name string `json:"name"` }
	if err := c.Bind(&req); err != nil {
		return badRequest(c, "invalid request body")
	}
	var id int
	err := h.db.QueryRowContext(c.Request().Context(),
		`INSERT INTO professional_courses (name) VALUES ($1) RETURNING id`, req.Name,
	).Scan(&id)
	if err != nil {
		return serverError(c, err)
	}
	return c.JSON(http.StatusCreated, map[string]interface{}{"id": id})
}

func (h *AdminHandler) DeleteProfessionalCourse(c echo.Context) error {
	return h.deleteByID(c, "professional_courses")
}

// Professional Institutions
func (h *AdminHandler) ListProfessionalInstitutions(c echo.Context) error {
	return h.listSimple(c, `SELECT id, name, country FROM professional_institutions ORDER BY name`)
}

func (h *AdminHandler) CreateProfessionalInstitution(c echo.Context) error {
	var req struct {
		Name    string `json:"name"`
		Country string `json:"country"`
	}
	if err := c.Bind(&req); err != nil {
		return badRequest(c, "invalid request body")
	}
	var id int
	err := h.db.QueryRowContext(c.Request().Context(),
		`INSERT INTO professional_institutions (name, country) VALUES ($1,$2) RETURNING id`,
		req.Name, req.Country,
	).Scan(&id)
	if err != nil {
		return serverError(c, err)
	}
	return c.JSON(http.StatusCreated, map[string]interface{}{"id": id})
}

func (h *AdminHandler) UpdateProfessionalInstitution(c echo.Context) error {
	var req struct {
		Name    string `json:"name"`
		Country string `json:"country"`
	}
	if err := c.Bind(&req); err != nil {
		return badRequest(c, "invalid request body")
	}
	_, err := h.db.ExecContext(c.Request().Context(),
		`UPDATE professional_institutions SET name=$2, country=$3 WHERE id=$1`,
		c.Param("id"), req.Name, req.Country)
	if err != nil {
		return serverError(c, err)
	}
	return c.JSON(http.StatusOK, map[string]string{"message": "Updated."})
}

func (h *AdminHandler) DeleteProfessionalInstitution(c echo.Context) error {
	return h.deleteByID(c, "professional_institutions")
}

// Secretariats
func (h *AdminHandler) ListSecretariats(c echo.Context) error {
	return h.listSimple(c, `SELECT s.id, s.officer_name, s.officer_contact, e.name AS employer FROM secretariats s JOIN employers e ON e.id=s.employer_id ORDER BY s.created_at DESC`)
}

func (h *AdminHandler) CreateSecretariat(c echo.Context) error {
	var req struct {
		EmployerID     int    `json:"employer_id"`
		OfficerName    string `json:"officer_name"`
		OfficerContact string `json:"officer_contact"`
	}
	if err := c.Bind(&req); err != nil {
		return badRequest(c, "invalid request body")
	}
	var id int
	err := h.db.QueryRowContext(c.Request().Context(),
		`INSERT INTO secretariats (employer_id, officer_name, officer_contact) VALUES ($1,$2,$3) RETURNING id`,
		req.EmployerID, req.OfficerName, req.OfficerContact,
	).Scan(&id)
	if err != nil {
		return serverError(c, err)
	}
	return c.JSON(http.StatusCreated, map[string]interface{}{"id": id})
}

func (h *AdminHandler) DeleteSecretariat(c echo.Context) error {
	return h.deleteByID(c, "secretariats")
}

// Permits
func (h *AdminHandler) ListPermits(c echo.Context) error {
	return h.listSimple(c, `SELECT p.id, p.status, p.issued_at, e.name AS employer FROM permits p JOIN employers e ON e.id=p.employer_id ORDER BY p.issued_at DESC`)
}

func (h *AdminHandler) CreatePermit(c echo.Context) error {
	userID, _ := c.Get("user_id").(string)
	var req struct {
		EmployerID int    `json:"employer_id"`
		VacancyID  string `json:"vacancy_id"`
	}
	if err := c.Bind(&req); err != nil {
		return badRequest(c, "invalid request body")
	}
	var id int
	err := h.db.QueryRowContext(c.Request().Context(),
		`INSERT INTO permits (employer_id, vacancy_id, issued_by) VALUES ($1,$2,$3) RETURNING id`,
		req.EmployerID, req.VacancyID, userID,
	).Scan(&id)
	if err != nil {
		return serverError(c, err)
	}
	return c.JSON(http.StatusCreated, map[string]interface{}{"id": id})
}

func (h *AdminHandler) UpdatePermitStatus(c echo.Context) error {
	var req struct{ Status string `json:"status"` }
	if err := c.Bind(&req); err != nil {
		return badRequest(c, "invalid request body")
	}
	_, err := h.db.ExecContext(c.Request().Context(),
		`UPDATE permits SET status=$2 WHERE id=$1`, c.Param("id"), req.Status)
	if err != nil {
		return serverError(c, err)
	}
	return c.JSON(http.StatusOK, map[string]string{"message": "Permit status updated."})
}

// Key Matrices
func (h *AdminHandler) ListKeyMatrices(c echo.Context) error {
	return h.listSimple(c, `SELECT id, name, criteria_json FROM key_matrices ORDER BY name`)
}

func (h *AdminHandler) CreateKeyMatrix(c echo.Context) error {
	var req struct {
		Name         string          `json:"name"`
		CriteriaJSON json.RawMessage `json:"criteria_json"`
	}
	if err := c.Bind(&req); err != nil {
		return badRequest(c, "invalid request body")
	}
	var id int
	err := h.db.QueryRowContext(c.Request().Context(),
		`INSERT INTO key_matrices (name, criteria_json) VALUES ($1,$2) RETURNING id`,
		req.Name, req.CriteriaJSON,
	).Scan(&id)
	if err != nil {
		return serverError(c, err)
	}
	return c.JSON(http.StatusCreated, map[string]interface{}{"id": id})
}

func (h *AdminHandler) UpdateKeyMatrix(c echo.Context) error {
	var req struct {
		Name         string          `json:"name"`
		CriteriaJSON json.RawMessage `json:"criteria_json"`
	}
	if err := c.Bind(&req); err != nil {
		return badRequest(c, "invalid request body")
	}
	_, err := h.db.ExecContext(c.Request().Context(),
		`UPDATE key_matrices SET name=$2, criteria_json=$3, updated_at=NOW() WHERE id=$1`,
		c.Param("id"), req.Name, req.CriteriaJSON)
	if err != nil {
		return serverError(c, err)
	}
	return c.JSON(http.StatusOK, map[string]string{"message": "Updated."})
}

func (h *AdminHandler) DeleteKeyMatrix(c echo.Context) error {
	return h.deleteByID(c, "key_matrices")
}

// Schemes of Service
func (h *AdminHandler) ListSchemesOfService(c echo.Context) error {
	return h.listSimple(c, `SELECT id, grade, title, qualification_requirements, career_path FROM schemes_of_service ORDER BY grade`)
}

func (h *AdminHandler) CreateSchemeOfService(c echo.Context) error {
	var req struct {
		Grade                    string `json:"grade"`
		Title                    string `json:"title"`
		QualificationRequirements string `json:"qualification_requirements"`
		CareerPath               string `json:"career_path"`
	}
	if err := c.Bind(&req); err != nil {
		return badRequest(c, "invalid request body")
	}
	var id int
	err := h.db.QueryRowContext(c.Request().Context(),
		`INSERT INTO schemes_of_service (grade, title, qualification_requirements, career_path) VALUES ($1,$2,$3,$4) RETURNING id`,
		req.Grade, req.Title, req.QualificationRequirements, req.CareerPath,
	).Scan(&id)
	if err != nil {
		return serverError(c, err)
	}
	return c.JSON(http.StatusCreated, map[string]interface{}{"id": id})
}

func (h *AdminHandler) UpdateSchemeOfService(c echo.Context) error {
	var req struct {
		Grade                    string `json:"grade"`
		Title                    string `json:"title"`
		QualificationRequirements string `json:"qualification_requirements"`
		CareerPath               string `json:"career_path"`
	}
	if err := c.Bind(&req); err != nil {
		return badRequest(c, "invalid request body")
	}
	_, err := h.db.ExecContext(c.Request().Context(),
		`UPDATE schemes_of_service SET grade=$2, title=$3, qualification_requirements=$4, career_path=$5, updated_at=NOW() WHERE id=$1`,
		c.Param("id"), req.Grade, req.Title, req.QualificationRequirements, req.CareerPath)
	if err != nil {
		return serverError(c, err)
	}
	return c.JSON(http.StatusOK, map[string]string{"message": "Updated."})
}

func (h *AdminHandler) DeleteSchemeOfService(c echo.Context) error {
	return h.deleteByID(c, "schemes_of_service")
}

// Employers
func (h *AdminHandler) ListEmployers(c echo.Context) error {
	return h.listSimple(c, `SELECT id, name, contact_email, contact_phone FROM employers ORDER BY name`)
}

func (h *AdminHandler) CreateEmployer(c echo.Context) error {
	var req struct {
		Name         string `json:"name"`
		ContactEmail string `json:"contact_email"`
		ContactPhone string `json:"contact_phone"`
		Address      string `json:"address"`
	}
	if err := c.Bind(&req); err != nil {
		return badRequest(c, "invalid request body")
	}
	var id int
	err := h.db.QueryRowContext(c.Request().Context(),
		`INSERT INTO employers (name, contact_email, contact_phone, address) VALUES ($1,$2,$3,$4) RETURNING id`,
		req.Name, req.ContactEmail, req.ContactPhone, req.Address,
	).Scan(&id)
	if err != nil {
		return serverError(c, err)
	}
	return c.JSON(http.StatusCreated, map[string]interface{}{"id": id})
}

func (h *AdminHandler) UpdateEmployer(c echo.Context) error {
	var req struct {
		Name         string `json:"name"`
		ContactEmail string `json:"contact_email"`
		ContactPhone string `json:"contact_phone"`
		Address      string `json:"address"`
	}
	if err := c.Bind(&req); err != nil {
		return badRequest(c, "invalid request body")
	}
	_, err := h.db.ExecContext(c.Request().Context(),
		`UPDATE employers SET name=$2, contact_email=$3, contact_phone=$4, address=$5, updated_at=NOW() WHERE id=$1`,
		c.Param("id"), req.Name, req.ContactEmail, req.ContactPhone, req.Address)
	if err != nil {
		return serverError(c, err)
	}
	return c.JSON(http.StatusOK, map[string]string{"message": "Updated."})
}

func (h *AdminHandler) DeleteEmployer(c echo.Context) error {
	return h.deleteByID(c, "employers")
}

// ─── Generic helpers ──────────────────────────────────────────────────────────

func (h *AdminHandler) listSimple(c echo.Context, query string) error {
	rows, err := h.db.QueryContext(c.Request().Context(), query)
	if err != nil {
		return serverError(c, err)
	}
	defer rows.Close()

	cols, _ := rows.Columns()
	var result []map[string]interface{}
	for rows.Next() {
		vals := make([]interface{}, len(cols))
		ptrs := make([]interface{}, len(cols))
		for i := range vals {
			ptrs[i] = &vals[i]
		}
		_ = rows.Scan(ptrs...)
		row := map[string]interface{}{}
		for i, col := range cols {
			row[col] = vals[i]
		}
		result = append(result, row)
	}
	if result == nil {
		result = []map[string]interface{}{}
	}
	return c.JSON(http.StatusOK, map[string]interface{}{"data": result})
}

func (h *AdminHandler) deleteByID(c echo.Context, table string) error {
	_, err := h.db.ExecContext(c.Request().Context(),
		`DELETE FROM `+table+` WHERE id=$1`, c.Param("id"))
	if err != nil {
		return serverError(c, err)
	}
	return c.JSON(http.StatusOK, map[string]string{"message": "Deleted."})
}
