package main

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/egaz/zanajira-server/internal/config"
	"github.com/egaz/zanajira-server/internal/handler"
	appmiddleware "github.com/egaz/zanajira-server/internal/middleware"
	"github.com/egaz/zanajira-server/internal/service"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	_ "github.com/lib/pq"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("failed to load config: %v", err)
	}

	// ── Database ──────────────────────────────────────────────────────────────
	db, err := sql.Open("postgres", cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("failed to open database: %v", err)
	}
	defer db.Close()

	if err := db.Ping(); err != nil {
		log.Fatalf("failed to connect to database: %v", err)
	}
	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(5)
	log.Println("✓ Database connected")

	// ── Upload directory ──────────────────────────────────────────────────────
	if err := os.MkdirAll(cfg.UploadDir, 0750); err != nil {
		log.Fatalf("failed to create upload directory: %v", err)
	}

	// ── Services ──────────────────────────────────────────────────────────────
	emailSvc := service.NewEmailService(cfg.SMTPHost, cfg.SMTPPort, cfg.SMTPUser, cfg.SMTPPass, cfg.SMTPFrom, cfg.AppURL)
	uploadSvc := service.NewUploadService(cfg.UploadDir)
	zanidSvc := service.NewZanIDService(cfg.ZanIDAPIURL, cfg.ZanIDAPIKey, cfg.ZanIDMock)
	profileChecker := service.NewProfileChecker(db)

	// ── Handlers ──────────────────────────────────────────────────────────────
	authH := handler.NewAuthHandler(db, cfg.JWTSecret, cfg.JWTRefreshSecret, emailSvc, !cfg.IsDev())
	applicantH := handler.NewApplicantHandler(db, uploadSvc, profileChecker, zanidSvc)
	vacancyH := handler.NewVacancyHandler(db, uploadSvc, emailSvc, cfg.ProfileThreshold)
	adminH := handler.NewAdminHandler(db, emailSvc)

	// ── Echo ──────────────────────────────────────────────────────────────────
	e := echo.New()
	e.HideBanner = true

	// Global middleware
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.Use(middleware.RequestID())
	// In development, allow any localhost origin so Vite dev server works
	// regardless of which port it picks. In production, restrict to AppURL.
	allowedOrigins := []string{cfg.AppURL}
	if cfg.IsDev() {
		allowedOrigins = []string{
			"http://localhost:5173",
			"http://localhost:5174",
			"http://localhost:5175",
			"http://localhost:3000",
			"http://127.0.0.1:5173",
			"http://127.0.0.1:5174",
			"http://127.0.0.1:5175",
			"http://127.0.0.1:3000",
		}
	}
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins:     allowedOrigins,
		AllowMethods:     []string{http.MethodGet, http.MethodPost, http.MethodPut, http.MethodDelete, http.MethodOptions},
		AllowHeaders:     []string{echo.HeaderOrigin, echo.HeaderContentType, echo.HeaderAuthorization},
		AllowCredentials: true,
	}))
	e.Use(middleware.SecureWithConfig(middleware.SecureConfig{
		XSSProtection:         "1; mode=block",
		ContentTypeNosniff:    "nosniff",
		XFrameOptions:         "DENY",
		HSTSMaxAge:            63072000,
		ContentSecurityPolicy: "default-src 'self'",
	}))
	e.Use(appmiddleware.AuditLogger(db))

	// ── Routes ────────────────────────────────────────────────────────────────
	e.GET("/health", func(c echo.Context) error {
		return c.JSON(http.StatusOK, map[string]string{"status": "ok", "version": "1.0.0"})
	})

	// Serve uploaded files
	e.Static("/uploads", cfg.UploadDir)

	api := e.Group("/api")

	// Auth (public)
	auth := api.Group("/auth")
	auth.POST("/register", authH.Register)
	auth.GET("/activate/:token", authH.Activate)
	auth.POST("/login", authH.Login)
	auth.POST("/refresh", authH.Refresh)
	auth.POST("/forgot-password", authH.ForgotPassword)
	auth.POST("/reset-password", authH.ResetPassword)

	// Auth (authenticated)
	authProtected := api.Group("/auth", appmiddleware.Auth(cfg.JWTSecret))
	authProtected.POST("/change-password", authH.ChangePassword)
	authProtected.POST("/logout", authH.Logout)

	// Public vacancies
	api.GET("/vacancies", vacancyH.ListVacancies)
	api.GET("/vacancies/search", vacancyH.SearchVacancies)
	api.GET("/vacancies/:id", vacancyH.GetVacancy)

	// ZanID lookup (public for dev, could be restricted in prod)
	api.GET("/zanid/:id", applicantH.LookupZanID)

	// Applicant portal (authenticated)
	app := api.Group("", appmiddleware.Auth(cfg.JWTSecret), appmiddleware.RequireRole("applicant"))

	app.GET("/applicants/me", applicantH.GetProfile)
	app.GET("/applicants/me/completion", applicantH.GetCompletion)
	app.PUT("/applicants/me/personal", applicantH.UpdatePersonal)
	app.POST("/applicants/me/photo", applicantH.UploadPhoto)
	app.PUT("/applicants/me/contact", applicantH.UpdateContact)
	app.POST("/applicants/me/contact/birth-cert", applicantH.UploadBirthCert)

	app.POST("/applicants/me/academic", applicantH.AddAcademic)
	app.PUT("/applicants/me/academic/:id", applicantH.UpdateAcademic)
	app.DELETE("/applicants/me/academic/:id", applicantH.DeleteAcademic)
	app.POST("/applicants/me/academic/:id/cert", applicantH.UploadAcademicCert)

	app.POST("/applicants/me/language", applicantH.AddLanguage)
	app.DELETE("/applicants/me/language/:id", applicantH.DeleteLanguage)

	app.POST("/applicants/me/experience", applicantH.AddExperience)
	app.DELETE("/applicants/me/experience/:id", applicantH.DeleteExperience)

	app.POST("/applicants/me/training", applicantH.AddTraining)
	app.DELETE("/applicants/me/training/:id", applicantH.DeleteTraining)

	app.PUT("/applicants/me/computer-skills", applicantH.UpdateComputerSkills)

	app.POST("/applicants/me/referee", applicantH.AddReferee)
	app.DELETE("/applicants/me/referee/:id", applicantH.DeleteReferee)

	app.POST("/applicants/me/attachment", applicantH.AddAttachment)
	app.DELETE("/applicants/me/attachment/:id", applicantH.DeleteAttachment)

	app.POST("/applicants/me/declaration", applicantH.SubmitDeclaration)
	app.GET("/applicants/me/cv", applicantH.GetCV)

	app.POST("/applications", vacancyH.Apply)
	app.GET("/applications/me", vacancyH.MyApplications)
	app.PUT("/applications/:id/letter", vacancyH.ReplaceLetter)

	// Admin portal (authenticated + admin/staff role)
	adm := api.Group("/admin", appmiddleware.Auth(cfg.JWTSecret), appmiddleware.RequireRole("admin", "staff"))

	adm.GET("/dashboard", adminH.Dashboard)
	adm.GET("/applicants", adminH.ListApplicants)
	adm.GET("/audit-logs", adminH.AuditLogs)
	adm.GET("/config", adminH.GetConfig)
	adm.PUT("/config", adminH.UpdateConfig)

	// Staff management
	adm.GET("/staff", adminH.ListStaff)
	adm.POST("/staff", adminH.CreateStaff)
	adm.PUT("/staff/:id", adminH.UpdateStaff)
	adm.DELETE("/staff/:id", adminH.DeleteStaff)

	// Vacancy management
	adm.GET("/vacancies", adminH.ListVacancies)
	adm.POST("/vacancies", adminH.CreateVacancy)
	adm.PUT("/vacancies/:id", adminH.UpdateVacancy)
	adm.PUT("/vacancies/:id/status", adminH.UpdateVacancyStatus)
	adm.DELETE("/vacancies/:id", adminH.DeleteVacancy)
	adm.GET("/vacancies/:id/applicants", adminH.VacancyApplicants)
	adm.PUT("/applications/:id/status", adminH.UpdateApplicationStatus)

	// Employers
	adm.GET("/employers", adminH.ListEmployers)
	adm.POST("/employers", adminH.CreateEmployer)
	adm.PUT("/employers/:id", adminH.UpdateEmployer)
	adm.DELETE("/employers/:id", adminH.DeleteEmployer)

	// Secretariats
	adm.GET("/secretariats", adminH.ListSecretariats)
	adm.POST("/secretariats", adminH.CreateSecretariat)
	adm.DELETE("/secretariats/:id", adminH.DeleteSecretariat)

	// Permits
	adm.GET("/permits", adminH.ListPermits)
	adm.POST("/permits", adminH.CreatePermit)
	adm.PUT("/permits/:id/status", adminH.UpdatePermitStatus)

	// Academic reference data
	adm.GET("/academic-levels", adminH.ListAcademicLevels)
	adm.POST("/academic-levels", adminH.CreateAcademicLevel)
	adm.PUT("/academic-levels/:id", adminH.UpdateAcademicLevel)
	adm.DELETE("/academic-levels/:id", adminH.DeleteAcademicLevel)

	adm.GET("/academic-institutions", adminH.ListAcademicInstitutions)
	adm.POST("/academic-institutions", adminH.CreateAcademicInstitution)
	adm.PUT("/academic-institutions/:id", adminH.UpdateAcademicInstitution)
	adm.DELETE("/academic-institutions/:id", adminH.DeleteAcademicInstitution)

	adm.GET("/academic-programmes", adminH.ListAcademicProgrammes)
	adm.POST("/academic-programmes", adminH.CreateAcademicProgramme)
	adm.DELETE("/academic-programmes/:id", adminH.DeleteAcademicProgramme)

	adm.GET("/academic-subscriptions", adminH.ListAcademicSubscriptions)
	adm.POST("/academic-subscriptions", adminH.CreateAcademicSubscription)
	adm.DELETE("/academic-subscriptions/:id", adminH.DeleteAcademicSubscription)

	// Professional reference data
	adm.GET("/computer-skills", adminH.ListComputerSkillDefs)
	adm.POST("/computer-skills", adminH.CreateComputerSkillDef)
	adm.DELETE("/computer-skills/:id", adminH.DeleteComputerSkillDef)

	adm.GET("/professional-courses", adminH.ListProfessionalCourses)
	adm.POST("/professional-courses", adminH.CreateProfessionalCourse)
	adm.DELETE("/professional-courses/:id", adminH.DeleteProfessionalCourse)

	adm.GET("/professional-institutions", adminH.ListProfessionalInstitutions)
	adm.POST("/professional-institutions", adminH.CreateProfessionalInstitution)
	adm.PUT("/professional-institutions/:id", adminH.UpdateProfessionalInstitution)
	adm.DELETE("/professional-institutions/:id", adminH.DeleteProfessionalInstitution)

	// Key matrices & schemes of service
	adm.GET("/key-matrices", adminH.ListKeyMatrices)
	adm.POST("/key-matrices", adminH.CreateKeyMatrix)
	adm.PUT("/key-matrices/:id", adminH.UpdateKeyMatrix)
	adm.DELETE("/key-matrices/:id", adminH.DeleteKeyMatrix)

	adm.GET("/schemes-of-service", adminH.ListSchemesOfService)
	adm.POST("/schemes-of-service", adminH.CreateSchemeOfService)
	adm.PUT("/schemes-of-service/:id", adminH.UpdateSchemeOfService)
	adm.DELETE("/schemes-of-service/:id", adminH.DeleteSchemeOfService)

	// ── Start ─────────────────────────────────────────────────────────────────
	addr := fmt.Sprintf(":%s", cfg.Port)
	log.Printf("🚀 ZanAjira API starting on %s (env: %s)", addr, cfg.Env)
	if err := e.Start(addr); err != nil && err != http.ErrServerClosed {
		log.Fatalf("server error: %v", err)
	}
}
