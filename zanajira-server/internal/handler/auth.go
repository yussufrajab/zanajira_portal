package handler

import (
	"database/sql"
	"errors"
	"net/http"

	"github.com/egaz/zanajira-server/internal/service"
	"github.com/labstack/echo/v4"
)

type AuthHandler struct {
	db           *sql.DB
	jwtSecret    string
	refreshSecret string
	email        *service.EmailService
	secure       bool // true in production (HTTPS)
}

func NewAuthHandler(db *sql.DB, jwtSecret, refreshSecret string, email *service.EmailService, secure bool) *AuthHandler {
	return &AuthHandler{db: db, jwtSecret: jwtSecret, refreshSecret: refreshSecret, email: email, secure: secure}
}

// POST /api/auth/register
func (h *AuthHandler) Register(c echo.Context) error {
	var req struct {
		Email    string `json:"email"`
		Password string `json:"password"`
		Confirm  string `json:"confirm_password"`
	}
	if err := c.Bind(&req); err != nil {
		return badRequest(c, "invalid request body")
	}
	if req.Email == "" || req.Password == "" {
		return badRequest(c, "email and password are required")
	}
	if req.Password != req.Confirm {
		return badRequest(c, "passwords do not match")
	}

	hash, err := service.HashPassword(req.Password)
	if err != nil {
		if errors.Is(err, service.ErrWeakPassword) {
			return badRequest(c, err.Error())
		}
		return serverError(c, err)
	}

	token, err := service.GenerateSecureToken()
	if err != nil {
		return serverError(c, err)
	}

	row := h.db.QueryRowContext(c.Request().Context(),
		`INSERT INTO users (email, password_hash, role, activation_token, activation_expires)
		 VALUES ($1, $2, 'applicant', $3, NOW() + INTERVAL '24 hours')
		 RETURNING id`,
		req.Email, hash, token,
	)
	var userID string
	if err := row.Scan(&userID); err != nil {
		if isUniqueViolation(err) {
			return c.JSON(http.StatusConflict, map[string]string{"error": service.ErrEmailTaken.Error()})
		}
		return serverError(c, err)
	}

	// Create empty applicant profile
	_, _ = h.db.ExecContext(c.Request().Context(),
		`INSERT INTO applicants (user_id) VALUES ($1)`, userID)

	// Send activation email (non-blocking)
	go func() { _ = h.email.SendActivation(req.Email, token) }()

	return c.JSON(http.StatusCreated, map[string]string{
		"message": "Registration successful. Please check your email to activate your account.",
	})
}

// GET /api/auth/activate/:token
func (h *AuthHandler) Activate(c echo.Context) error {
	token := c.Param("token")
	if token == "" {
		return badRequest(c, "activation token is required")
	}

	var userID string
	err := h.db.QueryRowContext(c.Request().Context(),
		`UPDATE users SET is_active=TRUE, activation_token=NULL, activation_expires=NULL, updated_at=NOW()
		 WHERE activation_token=$1 AND activation_expires > NOW()
		 RETURNING id`, token,
	).Scan(&userID)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "activation link is invalid or has expired"})
	}

	return c.JSON(http.StatusOK, map[string]string{"message": "Account activated successfully. You can now log in."})
}

// POST /api/auth/login
func (h *AuthHandler) Login(c echo.Context) error {
	var req struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	if err := c.Bind(&req); err != nil {
		return badRequest(c, "invalid request body")
	}

	var (
		userID       string
		passwordHash string
		role         string
		isActive     bool
	)
	err := h.db.QueryRowContext(c.Request().Context(),
		`SELECT id, password_hash, role, is_active FROM users WHERE email=$1`, req.Email,
	).Scan(&userID, &passwordHash, &role, &isActive)
	if err != nil {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": service.ErrInvalidCredentials.Error()})
	}

	if !service.CheckPassword(passwordHash, req.Password) {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": service.ErrInvalidCredentials.Error()})
	}
	if !isActive {
		return c.JSON(http.StatusForbidden, map[string]string{"error": service.ErrAccountInactive.Error()})
	}

	accessToken, err := service.GenerateToken(userID, role, req.Email, h.jwtSecret)
	if err != nil {
		return serverError(c, err)
	}
	refreshToken, err := service.GenerateRefreshToken(userID, h.refreshSecret)
	if err != nil {
		return serverError(c, err)
	}

	service.SetAuthCookies(c.Response().Writer, accessToken, refreshToken, h.secure)

	return c.JSON(http.StatusOK, map[string]interface{}{
		"user_id":      userID,
		"role":         role,
		"email":        req.Email,
		"access_token": accessToken,
	})
}

// POST /api/auth/refresh
func (h *AuthHandler) Refresh(c echo.Context) error {
	cookie, err := c.Cookie("refresh_token")
	if err != nil || cookie.Value == "" {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "missing refresh token"})
	}

	userID, err := service.ParseRefreshToken(cookie.Value, h.refreshSecret)
	if err != nil {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "invalid or expired refresh token"})
	}

	var email, role string
	err = h.db.QueryRowContext(c.Request().Context(),
		`SELECT email, role FROM users WHERE id=$1 AND is_active=TRUE`, userID,
	).Scan(&email, &role)
	if err != nil {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "user not found"})
	}

	accessToken, err := service.GenerateToken(userID, role, email, h.jwtSecret)
	if err != nil {
		return serverError(c, err)
	}
	newRefresh, err := service.GenerateRefreshToken(userID, h.refreshSecret)
	if err != nil {
		return serverError(c, err)
	}

	service.SetAuthCookies(c.Response().Writer, accessToken, newRefresh, h.secure)
	return c.JSON(http.StatusOK, map[string]string{"access_token": accessToken})
}

// POST /api/auth/forgot-password
func (h *AuthHandler) ForgotPassword(c echo.Context) error {
	var req struct {
		Email string `json:"email"`
	}
	if err := c.Bind(&req); err != nil {
		return badRequest(c, "invalid request body")
	}

	token, err := service.GenerateSecureToken()
	if err != nil {
		return serverError(c, err)
	}

	var userEmail string
	err = h.db.QueryRowContext(c.Request().Context(),
		`UPDATE users SET reset_token=$2, reset_expires=NOW()+INTERVAL '2 hours', updated_at=NOW()
		 WHERE email=$1 RETURNING email`, req.Email, token,
	).Scan(&userEmail)

	// Always return success to prevent email enumeration
	if err == nil {
		go func() { _ = h.email.SendPasswordReset(userEmail, token) }()
	}

	return c.JSON(http.StatusOK, map[string]string{
		"message": "If that email is registered, a password reset link has been sent.",
	})
}

// POST /api/auth/reset-password
func (h *AuthHandler) ResetPassword(c echo.Context) error {
	var req struct {
		Token    string `json:"token"`
		Password string `json:"password"`
		Confirm  string `json:"confirm_password"`
	}
	if err := c.Bind(&req); err != nil {
		return badRequest(c, "invalid request body")
	}
	if req.Password != req.Confirm {
		return badRequest(c, "passwords do not match")
	}

	hash, err := service.HashPassword(req.Password)
	if err != nil {
		return badRequest(c, err.Error())
	}

	var userID string
	err = h.db.QueryRowContext(c.Request().Context(),
		`UPDATE users SET password_hash=$2, reset_token=NULL, reset_expires=NULL, updated_at=NOW()
		 WHERE reset_token=$1 AND reset_expires > NOW() RETURNING id`, req.Token, hash,
	).Scan(&userID)
	if err != nil {
		return badRequest(c, "reset link is invalid or has expired")
	}

	return c.JSON(http.StatusOK, map[string]string{"message": "Password reset successfully. You can now log in."})
}

// POST /api/auth/change-password  (authenticated)
func (h *AuthHandler) ChangePassword(c echo.Context) error {
	userID, _ := c.Get("user_id").(string)
	var req struct {
		OldPassword string `json:"old_password"`
		NewPassword string `json:"new_password"`
		Confirm     string `json:"confirm_password"`
	}
	if err := c.Bind(&req); err != nil {
		return badRequest(c, "invalid request body")
	}
	if req.NewPassword != req.Confirm {
		return badRequest(c, "passwords do not match")
	}

	var currentHash string
	err := h.db.QueryRowContext(c.Request().Context(),
		`SELECT password_hash FROM users WHERE id=$1`, userID,
	).Scan(&currentHash)
	if err != nil {
		return serverError(c, err)
	}

	if !service.CheckPassword(currentHash, req.OldPassword) {
		return badRequest(c, "current password is incorrect")
	}

	newHash, err := service.HashPassword(req.NewPassword)
	if err != nil {
		return badRequest(c, err.Error())
	}

	_, err = h.db.ExecContext(c.Request().Context(),
		`UPDATE users SET password_hash=$2, updated_at=NOW() WHERE id=$1`, userID, newHash)
	if err != nil {
		return serverError(c, err)
	}

	return c.JSON(http.StatusOK, map[string]string{"message": "Password changed successfully."})
}

// POST /api/auth/logout
func (h *AuthHandler) Logout(c echo.Context) error {
	service.ClearAuthCookies(c.Response().Writer)
	return c.JSON(http.StatusOK, map[string]string{"message": "Logged out successfully."})
}
