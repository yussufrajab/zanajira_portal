package handler

import (
	"database/sql"
	"net/http"
	"time"

	"github.com/egaz/zanajira-server/internal/service"
	"github.com/labstack/echo/v4"
)

type ApplicantHandler struct {
	db             *sql.DB
	uploadSvc      *service.UploadService
	profileChecker *service.ProfileChecker
	zanidSvc       service.ZanIDService
}

func NewApplicantHandler(db *sql.DB, upload *service.UploadService, profile *service.ProfileChecker, zanid service.ZanIDService) *ApplicantHandler {
	return &ApplicantHandler{db: db, uploadSvc: upload, profileChecker: profile, zanidSvc: zanid}
}

// GET /api/applicants/me
func (h *ApplicantHandler) GetProfile(c echo.Context) error {
	userID, _ := c.Get("user_id").(string)
	applicant, err := h.getApplicantByUserID(c, userID)
	if err != nil {
		return err
	}
	return c.JSON(http.StatusOK, applicant)
}

// GET /api/applicants/me/completion
func (h *ApplicantHandler) GetCompletion(c echo.Context) error {
	userID, _ := c.Get("user_id").(string)
	applicantID, err := h.resolveApplicantID(c, userID)
	if err != nil {
		return err
	}
	pct, err := h.profileChecker.RefreshCompletion(c.Request().Context(), applicantID)
	if err != nil {
		return serverError(c, err)
	}
	return c.JSON(http.StatusOK, map[string]int{"completion_pct": pct})
}

// GET /api/zanid/:id
func (h *ApplicantHandler) LookupZanID(c echo.Context) error {
	zanid := c.Param("id")
	profile, err := h.zanidSvc.Lookup(zanid)
	if err != nil {
		return badRequest(c, err.Error())
	}
	return c.JSON(http.StatusOK, profile)
}

// PUT /api/applicants/me/personal
func (h *ApplicantHandler) UpdatePersonal(c echo.Context) error {
	userID, _ := c.Get("user_id").(string)
	applicantID, err := h.resolveApplicantID(c, userID)
	if err != nil {
		return err
	}

	var req struct {
		ZanID                string `json:"zanid"`
		FirstName            string `json:"first_name"`
		LastName             string `json:"last_name"`
		Sex                  string `json:"sex"`
		DateOfBirth          string `json:"date_of_birth"`
		Nationality          string `json:"nationality"`
		Originality          string `json:"originality"`
		GovtEmploymentStatus string `json:"govt_employment_status"`
		MaritalStatus        string `json:"marital_status"`
		Impairment           string `json:"impairment"`
	}
	if err := c.Bind(&req); err != nil {
		return badRequest(c, "invalid request body")
	}

	var dob interface{}
	if req.DateOfBirth != "" {
		t, err := time.Parse("2006-01-02", req.DateOfBirth)
		if err != nil {
			return badRequest(c, "invalid date_of_birth format, use YYYY-MM-DD")
		}
		dob = t
	}

	_, err = h.db.ExecContext(c.Request().Context(),
		`UPDATE applicants SET zanid=$2, first_name=$3, last_name=$4, sex=$5,
		 date_of_birth=$6, nationality=$7, originality=$8,
		 govt_employment_status=$9, marital_status=$10, impairment=$11, updated_at=NOW()
		 WHERE id=$1`,
		applicantID, req.ZanID, req.FirstName, req.LastName, req.Sex,
		dob, req.Nationality, req.Originality,
		req.GovtEmploymentStatus, req.MaritalStatus, req.Impairment,
	)
	if err != nil {
		return serverError(c, err)
	}

	pct, _ := h.profileChecker.RefreshCompletion(c.Request().Context(), applicantID)
	return c.JSON(http.StatusOK, map[string]interface{}{"message": "Personal details updated.", "completion_pct": pct})
}

// POST /api/applicants/me/photo
func (h *ApplicantHandler) UploadPhoto(c echo.Context) error {
	userID, _ := c.Get("user_id").(string)
	applicantID, err := h.resolveApplicantID(c, userID)
	if err != nil {
		return err
	}

	file, err := c.FormFile("photo")
	if err != nil {
		return badRequest(c, "photo file is required")
	}

	path, err := h.uploadSvc.SaveFile(file, service.UploadTypePhoto)
	if err != nil {
		return badRequest(c, err.Error())
	}

	_, err = h.db.ExecContext(c.Request().Context(),
		`UPDATE applicants SET photo_path=$2, updated_at=NOW() WHERE id=$1`, applicantID, path)
	if err != nil {
		return serverError(c, err)
	}

	pct, _ := h.profileChecker.RefreshCompletion(c.Request().Context(), applicantID)
	return c.JSON(http.StatusOK, map[string]interface{}{"photo_path": path, "completion_pct": pct})
}

// PUT /api/applicants/me/contact
func (h *ApplicantHandler) UpdateContact(c echo.Context) error {
	userID, _ := c.Get("user_id").(string)
	applicantID, err := h.resolveApplicantID(c, userID)
	if err != nil {
		return err
	}

	var req struct {
		Country        string `json:"country"`
		StateCity      string `json:"state_city"`
		ProvinceCounty string `json:"province_county"`
		MobileNumber   string `json:"mobile_number"`
		AltEmail       string `json:"alt_email"`
		PresentAddress string `json:"present_address"`
	}
	if err := c.Bind(&req); err != nil {
		return badRequest(c, "invalid request body")
	}

	_, err = h.db.ExecContext(c.Request().Context(),
		`INSERT INTO contact_details (applicant_id, country, state_city, province_county,
		 mobile_number, alt_email, present_address)
		 VALUES ($1,$2,$3,$4,$5,$6,$7)
		 ON CONFLICT (applicant_id) DO UPDATE SET
		 country=EXCLUDED.country, state_city=EXCLUDED.state_city,
		 province_county=EXCLUDED.province_county, mobile_number=EXCLUDED.mobile_number,
		 alt_email=EXCLUDED.alt_email, present_address=EXCLUDED.present_address,
		 updated_at=NOW()`,
		applicantID, req.Country, req.StateCity, req.ProvinceCounty,
		req.MobileNumber, req.AltEmail, req.PresentAddress,
	)
	if err != nil {
		return serverError(c, err)
	}

	pct, _ := h.profileChecker.RefreshCompletion(c.Request().Context(), applicantID)
	return c.JSON(http.StatusOK, map[string]interface{}{"message": "Contact details updated.", "completion_pct": pct})
}

// POST /api/applicants/me/contact/birth-cert
func (h *ApplicantHandler) UploadBirthCert(c echo.Context) error {
	userID, _ := c.Get("user_id").(string)
	applicantID, err := h.resolveApplicantID(c, userID)
	if err != nil {
		return err
	}

	file, err := c.FormFile("file")
	if err != nil {
		return badRequest(c, "file is required")
	}

	path, err := h.uploadSvc.SaveFile(file, service.UploadTypeCert)
	if err != nil {
		return badRequest(c, err.Error())
	}

	_, err = h.db.ExecContext(c.Request().Context(),
		`UPDATE contact_details SET birth_cert_path=$2, updated_at=NOW() WHERE applicant_id=$1`,
		applicantID, path)
	if err != nil {
		return serverError(c, err)
	}

	return c.JSON(http.StatusOK, map[string]string{"birth_cert_path": path})
}

// POST /api/applicants/me/academic
func (h *ApplicantHandler) AddAcademic(c echo.Context) error {
	userID, _ := c.Get("user_id").(string)
	applicantID, err := h.resolveApplicantID(c, userID)
	if err != nil {
		return err
	}

	var req struct {
		EducationLevel    string `json:"education_level"`
		Country           string `json:"country"`
		InstitutionID     *int   `json:"institution_id"`
		ProgrammeID       *int   `json:"programme_id"`
		ProgrammeCategory string `json:"programme_category"`
		YearFrom          *int   `json:"year_from"`
		YearTo            *int   `json:"year_to"`
		GPAResult         string `json:"gpa_result"`
		LostCertIndex     string `json:"lost_cert_index"`
		LostCertYear      *int   `json:"lost_cert_year"`
	}
	if err := c.Bind(&req); err != nil {
		return badRequest(c, "invalid request body")
	}
	if req.EducationLevel == "" {
		return badRequest(c, "education_level is required")
	}

	var id string
	err = h.db.QueryRowContext(c.Request().Context(),
		`INSERT INTO academic_qualifications
		 (applicant_id, education_level, country, institution_id, programme_id,
		  programme_category, year_from, year_to, gpa_result, lost_cert_index, lost_cert_year)
		 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING id`,
		applicantID, req.EducationLevel, req.Country, req.InstitutionID, req.ProgrammeID,
		req.ProgrammeCategory, req.YearFrom, req.YearTo, req.GPAResult,
		req.LostCertIndex, req.LostCertYear,
	).Scan(&id)
	if err != nil {
		return serverError(c, err)
	}

	pct, _ := h.profileChecker.RefreshCompletion(c.Request().Context(), applicantID)
	return c.JSON(http.StatusCreated, map[string]interface{}{"id": id, "completion_pct": pct})
}

// PUT /api/applicants/me/academic/:id
func (h *ApplicantHandler) UpdateAcademic(c echo.Context) error {
	userID, _ := c.Get("user_id").(string)
	applicantID, err := h.resolveApplicantID(c, userID)
	if err != nil {
		return err
	}
	qualID := c.Param("id")

	var req struct {
		EducationLevel    string `json:"education_level"`
		Country           string `json:"country"`
		InstitutionID     *int   `json:"institution_id"`
		ProgrammeID       *int   `json:"programme_id"`
		ProgrammeCategory string `json:"programme_category"`
		YearFrom          *int   `json:"year_from"`
		YearTo            *int   `json:"year_to"`
		GPAResult         string `json:"gpa_result"`
	}
	if err := c.Bind(&req); err != nil {
		return badRequest(c, "invalid request body")
	}

	res, err := h.db.ExecContext(c.Request().Context(),
		`UPDATE academic_qualifications SET
		 education_level=$3, country=$4, institution_id=$5, programme_id=$6,
		 programme_category=$7, year_from=$8, year_to=$9, gpa_result=$10, updated_at=NOW()
		 WHERE id=$1 AND applicant_id=$2`,
		qualID, applicantID, req.EducationLevel, req.Country, req.InstitutionID,
		req.ProgrammeID, req.ProgrammeCategory, req.YearFrom, req.YearTo, req.GPAResult,
	)
	if err != nil {
		return serverError(c, err)
	}
	if n, _ := res.RowsAffected(); n == 0 {
		return notFound(c, "qualification not found")
	}

	return c.JSON(http.StatusOK, map[string]string{"message": "Academic qualification updated."})
}

// DELETE /api/applicants/me/academic/:id
func (h *ApplicantHandler) DeleteAcademic(c echo.Context) error {
	userID, _ := c.Get("user_id").(string)
	applicantID, err := h.resolveApplicantID(c, userID)
	if err != nil {
		return err
	}
	qualID := c.Param("id")

	_, err = h.db.ExecContext(c.Request().Context(),
		`DELETE FROM academic_qualifications WHERE id=$1 AND applicant_id=$2`, qualID, applicantID)
	if err != nil {
		return serverError(c, err)
	}

	pct, _ := h.profileChecker.RefreshCompletion(c.Request().Context(), applicantID)
	return c.JSON(http.StatusOK, map[string]interface{}{"message": "Deleted.", "completion_pct": pct})
}

// POST /api/applicants/me/academic/:id/cert
func (h *ApplicantHandler) UploadAcademicCert(c echo.Context) error {
	userID, _ := c.Get("user_id").(string)
	applicantID, err := h.resolveApplicantID(c, userID)
	if err != nil {
		return err
	}
	qualID := c.Param("id")
	certType := c.QueryParam("type") // cert | tcu | nacte | necta

	file, err := c.FormFile("file")
	if err != nil {
		return badRequest(c, "file is required")
	}

	path, err := h.uploadSvc.SaveFile(file, service.UploadTypeCert)
	if err != nil {
		return badRequest(c, err.Error())
	}

	col := "cert_path"
	switch certType {
	case "tcu":
		col = "tcu_cert_path"
	case "nacte":
		col = "nacte_cert_path"
	case "necta":
		col = "necta_cert_path"
	}

	_, err = h.db.ExecContext(c.Request().Context(),
		`UPDATE academic_qualifications SET `+col+`=$3, updated_at=NOW() WHERE id=$1 AND applicant_id=$2`,
		qualID, applicantID, path)
	if err != nil {
		return serverError(c, err)
	}

	return c.JSON(http.StatusOK, map[string]string{"path": path})
}

// POST /api/applicants/me/language
func (h *ApplicantHandler) AddLanguage(c echo.Context) error {
	userID, _ := c.Get("user_id").(string)
	applicantID, err := h.resolveApplicantID(c, userID)
	if err != nil {
		return err
	}

	var req struct {
		Language string `json:"language"`
		Speaking string `json:"speaking"`
		Reading  string `json:"reading"`
		Writing  string `json:"writing"`
	}
	if err := c.Bind(&req); err != nil {
		return badRequest(c, "invalid request body")
	}

	var id string
	err = h.db.QueryRowContext(c.Request().Context(),
		`INSERT INTO language_proficiencies (applicant_id, language, speaking, reading, writing)
		 VALUES ($1,$2,$3,$4,$5) RETURNING id`,
		applicantID, req.Language, req.Speaking, req.Reading, req.Writing,
	).Scan(&id)
	if err != nil {
		return serverError(c, err)
	}

	pct, _ := h.profileChecker.RefreshCompletion(c.Request().Context(), applicantID)
	return c.JSON(http.StatusCreated, map[string]interface{}{"id": id, "completion_pct": pct})
}

// DELETE /api/applicants/me/language/:id
func (h *ApplicantHandler) DeleteLanguage(c echo.Context) error {
	userID, _ := c.Get("user_id").(string)
	applicantID, err := h.resolveApplicantID(c, userID)
	if err != nil {
		return err
	}
	_, err = h.db.ExecContext(c.Request().Context(),
		`DELETE FROM language_proficiencies WHERE id=$1 AND applicant_id=$2`,
		c.Param("id"), applicantID)
	if err != nil {
		return serverError(c, err)
	}
	pct, _ := h.profileChecker.RefreshCompletion(c.Request().Context(), applicantID)
	return c.JSON(http.StatusOK, map[string]interface{}{"message": "Deleted.", "completion_pct": pct})
}

// POST /api/applicants/me/experience
func (h *ApplicantHandler) AddExperience(c echo.Context) error {
	userID, _ := c.Get("user_id").(string)
	applicantID, err := h.resolveApplicantID(c, userID)
	if err != nil {
		return err
	}

	var req struct {
		Organization      string `json:"organization"`
		JobTitle          string `json:"job_title"`
		SupervisorName    string `json:"supervisor_name"`
		SupervisorAddress string `json:"supervisor_address"`
		SupervisorMobile  string `json:"supervisor_mobile"`
		Duties            string `json:"duties"`
		StartDate         string `json:"start_date"`
		EndDate           string `json:"end_date"`
		IsCurrent         bool   `json:"is_current"`
	}
	if err := c.Bind(&req); err != nil {
		return badRequest(c, "invalid request body")
	}

	var endDate interface{}
	if !req.IsCurrent && req.EndDate != "" {
		endDate = req.EndDate
	}

	var id string
	err = h.db.QueryRowContext(c.Request().Context(),
		`INSERT INTO work_experiences (applicant_id, organization, job_title, supervisor_name,
		 supervisor_address, supervisor_mobile, duties, start_date, end_date, is_current)
		 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id`,
		applicantID, req.Organization, req.JobTitle, req.SupervisorName,
		req.SupervisorAddress, req.SupervisorMobile, req.Duties,
		req.StartDate, endDate, req.IsCurrent,
	).Scan(&id)
	if err != nil {
		return serverError(c, err)
	}

	pct, _ := h.profileChecker.RefreshCompletion(c.Request().Context(), applicantID)
	return c.JSON(http.StatusCreated, map[string]interface{}{"id": id, "completion_pct": pct})
}

// DELETE /api/applicants/me/experience/:id
func (h *ApplicantHandler) DeleteExperience(c echo.Context) error {
	userID, _ := c.Get("user_id").(string)
	applicantID, err := h.resolveApplicantID(c, userID)
	if err != nil {
		return err
	}
	_, err = h.db.ExecContext(c.Request().Context(),
		`DELETE FROM work_experiences WHERE id=$1 AND applicant_id=$2`,
		c.Param("id"), applicantID)
	if err != nil {
		return serverError(c, err)
	}
	pct, _ := h.profileChecker.RefreshCompletion(c.Request().Context(), applicantID)
	return c.JSON(http.StatusOK, map[string]interface{}{"message": "Deleted.", "completion_pct": pct})
}

// POST /api/applicants/me/training
func (h *ApplicantHandler) AddTraining(c echo.Context) error {
	userID, _ := c.Get("user_id").(string)
	applicantID, err := h.resolveApplicantID(c, userID)
	if err != nil {
		return err
	}

	var req struct {
		Name        string `json:"name"`
		Institution string `json:"institution"`
		Description string `json:"description"`
		StartDate   string `json:"start_date"`
		EndDate     string `json:"end_date"`
	}
	if err := c.Bind(&req); err != nil {
		return badRequest(c, "invalid request body")
	}

	var id string
	err = h.db.QueryRowContext(c.Request().Context(),
		`INSERT INTO trainings (applicant_id, name, institution, description, start_date, end_date)
		 VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
		applicantID, req.Name, req.Institution, req.Description, req.StartDate, req.EndDate,
	).Scan(&id)
	if err != nil {
		return serverError(c, err)
	}

	pct, _ := h.profileChecker.RefreshCompletion(c.Request().Context(), applicantID)
	return c.JSON(http.StatusCreated, map[string]interface{}{"id": id, "completion_pct": pct})
}

// DELETE /api/applicants/me/training/:id
func (h *ApplicantHandler) DeleteTraining(c echo.Context) error {
	userID, _ := c.Get("user_id").(string)
	applicantID, err := h.resolveApplicantID(c, userID)
	if err != nil {
		return err
	}
	_, err = h.db.ExecContext(c.Request().Context(),
		`DELETE FROM trainings WHERE id=$1 AND applicant_id=$2`, c.Param("id"), applicantID)
	if err != nil {
		return serverError(c, err)
	}
	pct, _ := h.profileChecker.RefreshCompletion(c.Request().Context(), applicantID)
	return c.JSON(http.StatusOK, map[string]interface{}{"message": "Deleted.", "completion_pct": pct})
}

// PUT /api/applicants/me/computer-skills
func (h *ApplicantHandler) UpdateComputerSkills(c echo.Context) error {
	userID, _ := c.Get("user_id").(string)
	applicantID, err := h.resolveApplicantID(c, userID)
	if err != nil {
		return err
	}

	var skills []struct {
		Skill       string `json:"skill"`
		Proficiency string `json:"proficiency"`
	}
	if err := c.Bind(&skills); err != nil {
		return badRequest(c, "invalid request body")
	}

	for _, s := range skills {
		_, err = h.db.ExecContext(c.Request().Context(),
			`INSERT INTO computer_skills (applicant_id, skill, proficiency)
			 VALUES ($1,$2,$3)
			 ON CONFLICT (applicant_id, skill) DO UPDATE SET proficiency=EXCLUDED.proficiency, updated_at=NOW()`,
			applicantID, s.Skill, s.Proficiency,
		)
		if err != nil {
			return serverError(c, err)
		}
	}

	pct, _ := h.profileChecker.RefreshCompletion(c.Request().Context(), applicantID)
	return c.JSON(http.StatusOK, map[string]interface{}{"message": "Computer skills updated.", "completion_pct": pct})
}

// POST /api/applicants/me/referee
func (h *ApplicantHandler) AddReferee(c echo.Context) error {
	userID, _ := c.Get("user_id").(string)
	applicantID, err := h.resolveApplicantID(c, userID)
	if err != nil {
		return err
	}

	var req struct {
		Title         string `json:"title"`
		FullName      string `json:"full_name"`
		Organization  string `json:"organization"`
		Email         string `json:"email"`
		Mobile        string `json:"mobile"`
		PostalAddress string `json:"postal_address"`
	}
	if err := c.Bind(&req); err != nil {
		return badRequest(c, "invalid request body")
	}
	if req.FullName == "" {
		return badRequest(c, "full_name is required")
	}

	var id string
	err = h.db.QueryRowContext(c.Request().Context(),
		`INSERT INTO referees (applicant_id, title, full_name, organization, email, mobile, postal_address)
		 VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
		applicantID, req.Title, req.FullName, req.Organization, req.Email, req.Mobile, req.PostalAddress,
	).Scan(&id)
	if err != nil {
		return serverError(c, err)
	}

	pct, _ := h.profileChecker.RefreshCompletion(c.Request().Context(), applicantID)
	return c.JSON(http.StatusCreated, map[string]interface{}{"id": id, "completion_pct": pct})
}

// DELETE /api/applicants/me/referee/:id
func (h *ApplicantHandler) DeleteReferee(c echo.Context) error {
	userID, _ := c.Get("user_id").(string)
	applicantID, err := h.resolveApplicantID(c, userID)
	if err != nil {
		return err
	}
	_, err = h.db.ExecContext(c.Request().Context(),
		`DELETE FROM referees WHERE id=$1 AND applicant_id=$2`, c.Param("id"), applicantID)
	if err != nil {
		return serverError(c, err)
	}
	pct, _ := h.profileChecker.RefreshCompletion(c.Request().Context(), applicantID)
	return c.JSON(http.StatusOK, map[string]interface{}{"message": "Deleted.", "completion_pct": pct})
}

// POST /api/applicants/me/attachment
func (h *ApplicantHandler) AddAttachment(c echo.Context) error {
	userID, _ := c.Get("user_id").(string)
	applicantID, err := h.resolveApplicantID(c, userID)
	if err != nil {
		return err
	}

	attachType := c.FormValue("type")
	if attachType == "" {
		return badRequest(c, "attachment type is required")
	}

	file, err := c.FormFile("file")
	if err != nil {
		return badRequest(c, "file is required")
	}

	path, err := h.uploadSvc.SaveFile(file, service.UploadTypeCert)
	if err != nil {
		return badRequest(c, err.Error())
	}

	var id string
	err = h.db.QueryRowContext(c.Request().Context(),
		`INSERT INTO other_attachments (applicant_id, type, file_path) VALUES ($1,$2,$3) RETURNING id`,
		applicantID, attachType, path,
	).Scan(&id)
	if err != nil {
		return serverError(c, err)
	}

	pct, _ := h.profileChecker.RefreshCompletion(c.Request().Context(), applicantID)
	return c.JSON(http.StatusCreated, map[string]interface{}{"id": id, "path": path, "completion_pct": pct})
}

// DELETE /api/applicants/me/attachment/:id
func (h *ApplicantHandler) DeleteAttachment(c echo.Context) error {
	userID, _ := c.Get("user_id").(string)
	applicantID, err := h.resolveApplicantID(c, userID)
	if err != nil {
		return err
	}
	_, err = h.db.ExecContext(c.Request().Context(),
		`DELETE FROM other_attachments WHERE id=$1 AND applicant_id=$2`, c.Param("id"), applicantID)
	if err != nil {
		return serverError(c, err)
	}
	return c.JSON(http.StatusOK, map[string]string{"message": "Deleted."})
}

// POST /api/applicants/me/declaration
func (h *ApplicantHandler) SubmitDeclaration(c echo.Context) error {
	userID, _ := c.Get("user_id").(string)
	applicantID, err := h.resolveApplicantID(c, userID)
	if err != nil {
		return err
	}

	var req struct {
		Accepted bool `json:"accepted"`
	}
	if err := c.Bind(&req); err != nil {
		return badRequest(c, "invalid request body")
	}
	if !req.Accepted {
		return badRequest(c, "you must accept the declaration to proceed")
	}

	_, err = h.db.ExecContext(c.Request().Context(),
		`UPDATE applicants SET declaration_accepted=TRUE, declaration_at=NOW(), updated_at=NOW() WHERE id=$1`,
		applicantID)
	if err != nil {
		return serverError(c, err)
	}

	pct, _ := h.profileChecker.RefreshCompletion(c.Request().Context(), applicantID)
	return c.JSON(http.StatusOK, map[string]interface{}{"message": "Declaration submitted.", "completion_pct": pct})
}

// GET /api/applicants/me/cv
func (h *ApplicantHandler) GetCV(c echo.Context) error {
	userID, _ := c.Get("user_id").(string)
	applicantID, err := h.resolveApplicantID(c, userID)
	if err != nil {
		return err
	}

	cv := map[string]interface{}{}

	// Personal
	var personal struct {
		FirstName   string
		LastName    string
		Sex         string
		DOB         sql.NullTime
		Nationality string
		ZanID       sql.NullString
		PhotoPath   sql.NullString
	}
	_ = h.db.QueryRowContext(c.Request().Context(),
		`SELECT first_name, last_name, sex, date_of_birth, nationality, zanid, photo_path
		 FROM applicants WHERE id=$1`, applicantID,
	).Scan(&personal.FirstName, &personal.LastName, &personal.Sex, &personal.DOB,
		&personal.Nationality, &personal.ZanID, &personal.PhotoPath)
	cv["personal"] = personal

	// Languages
	rows, _ := h.db.QueryContext(c.Request().Context(),
		`SELECT language, speaking, reading, writing FROM language_proficiencies WHERE applicant_id=$1`, applicantID)
	var langs []map[string]string
	for rows.Next() {
		var l, s, r, w string
		_ = rows.Scan(&l, &s, &r, &w)
		langs = append(langs, map[string]string{"language": l, "speaking": s, "reading": r, "writing": w})
	}
	rows.Close()
	cv["languages"] = langs

	// Academic
	aRows, _ := h.db.QueryContext(c.Request().Context(),
		`SELECT education_level, country, year_from, year_to, gpa_result FROM academic_qualifications WHERE applicant_id=$1 ORDER BY year_from`, applicantID)
	var academics []map[string]interface{}
	for aRows.Next() {
		var level, country, gpa string
		var yf, yt sql.NullInt32
		_ = aRows.Scan(&level, &country, &yf, &yt, &gpa)
		academics = append(academics, map[string]interface{}{"level": level, "country": country, "year_from": yf, "year_to": yt, "gpa": gpa})
	}
	aRows.Close()
	cv["academic"] = academics

	// Work Experience
	wRows, _ := h.db.QueryContext(c.Request().Context(),
		`SELECT organization, job_title, start_date, end_date, is_current, duties FROM work_experiences WHERE applicant_id=$1 ORDER BY start_date DESC`, applicantID)
	var experiences []map[string]interface{}
	for wRows.Next() {
		var org, title, duties string
		var start sql.NullTime
		var end sql.NullTime
		var isCurrent bool
		_ = wRows.Scan(&org, &title, &start, &end, &isCurrent, &duties)
		experiences = append(experiences, map[string]interface{}{"organization": org, "job_title": title, "start_date": start, "end_date": end, "is_current": isCurrent, "duties": duties})
	}
	wRows.Close()
	cv["experience"] = experiences

	// Computer Skills
	csRows, _ := h.db.QueryContext(c.Request().Context(),
		`SELECT skill, proficiency FROM computer_skills WHERE applicant_id=$1`, applicantID)
	var skills []map[string]string
	for csRows.Next() {
		var skill, prof string
		_ = csRows.Scan(&skill, &prof)
		skills = append(skills, map[string]string{"skill": skill, "proficiency": prof})
	}
	csRows.Close()
	cv["computer_skills"] = skills

	return c.JSON(http.StatusOK, cv)
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

func (h *ApplicantHandler) resolveApplicantID(c echo.Context, userID string) (string, error) {
	var id string
	err := h.db.QueryRowContext(c.Request().Context(),
		`SELECT id FROM applicants WHERE user_id=$1`, userID,
	).Scan(&id)
	if err != nil {
		return "", notFound(c, "applicant profile not found")
	}
	return id, nil
}

func (h *ApplicantHandler) getApplicantByUserID(c echo.Context, userID string) (map[string]interface{}, error) {
	row := h.db.QueryRowContext(c.Request().Context(),
		`SELECT id, zanid, first_name, last_name, sex, date_of_birth, nationality,
		 originality, govt_employment_status, marital_status, impairment,
		 photo_path, profile_completion_pct, declaration_accepted, declaration_at
		 FROM applicants WHERE user_id=$1`, userID)

	var (
		id, firstName, lastName, sex, nationality, originality, govtStatus, maritalStatus, impairment string
		zanid, photoPath                                                                                sql.NullString
		dob, declarationAt                                                                             sql.NullTime
		completionPct                                                                                  int
		declarationAccepted                                                                            bool
	)
	err := row.Scan(&id, &zanid, &firstName, &lastName, &sex, &dob, &nationality,
		&originality, &govtStatus, &maritalStatus, &impairment,
		&photoPath, &completionPct, &declarationAccepted, &declarationAt)
	if err != nil {
		return nil, notFound(c, "applicant profile not found")
	}

	return map[string]interface{}{
		"id":                     id,
		"zanid":                  zanid,
		"first_name":             firstName,
		"last_name":              lastName,
		"sex":                    sex,
		"date_of_birth":          dob,
		"nationality":            nationality,
		"originality":            originality,
		"govt_employment_status": govtStatus,
		"marital_status":         maritalStatus,
		"impairment":             impairment,
		"photo_path":             photoPath,
		"profile_completion_pct": completionPct,
		"declaration_accepted":   declarationAccepted,
		"declaration_at":         declarationAt,
	}, nil
}
