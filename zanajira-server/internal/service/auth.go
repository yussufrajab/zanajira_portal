package service

import (
	"crypto/rand"
	"database/sql"
	"encoding/hex"
	"errors"
	"fmt"
	"net/http"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

var (
	ErrInvalidCredentials = errors.New("invalid email or password")
	ErrAccountInactive    = errors.New("account not activated — check your email")
	ErrEmailTaken         = errors.New("email address already registered")
	ErrTokenExpired       = errors.New("token has expired or is invalid")
	ErrWeakPassword       = errors.New("password must be at least 8 characters and contain letters, numbers, and symbols")
)

// JWTClaims mirrors the middleware claims struct.
type JWTClaims struct {
	UserID string `json:"user_id"`
	Role   string `json:"role"`
	Email  string `json:"email"`
	jwt.RegisteredClaims
}

// HashPassword hashes a plaintext password using bcrypt (cost 12).
func HashPassword(password string) (string, error) {
	if err := validatePasswordStrength(password); err != nil {
		return "", err
	}
	hash, err := bcrypt.GenerateFromPassword([]byte(password), 12)
	return string(hash), err
}

// CheckPassword compares a plaintext password against a bcrypt hash.
func CheckPassword(hash, password string) bool {
	return bcrypt.CompareHashAndPassword([]byte(hash), []byte(password)) == nil
}

// GenerateToken creates a signed JWT access token (15-min expiry).
func GenerateToken(userID, role, email, secret string) (string, error) {
	claims := JWTClaims{
		UserID: userID,
		Role:   role,
		Email:  email,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(15 * time.Minute)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}
	return jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString([]byte(secret))
}

// GenerateRefreshToken creates a signed JWT refresh token (7-day expiry).
func GenerateRefreshToken(userID, secret string) (string, error) {
	claims := jwt.RegisteredClaims{
		Subject:   userID,
		ExpiresAt: jwt.NewNumericDate(time.Now().Add(7 * 24 * time.Hour)),
		IssuedAt:  jwt.NewNumericDate(time.Now()),
	}
	return jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString([]byte(secret))
}

// ParseRefreshToken validates a refresh token and returns the subject (userID).
func ParseRefreshToken(tokenStr, secret string) (string, error) {
	token, err := jwt.ParseWithClaims(tokenStr, &jwt.RegisteredClaims{}, func(t *jwt.Token) (interface{}, error) {
		return []byte(secret), nil
	})
	if err != nil || !token.Valid {
		return "", ErrTokenExpired
	}
	claims, ok := token.Claims.(*jwt.RegisteredClaims)
	if !ok {
		return "", ErrTokenExpired
	}
	return claims.Subject, nil
}

// GenerateSecureToken creates a cryptographically random hex token.
func GenerateSecureToken() (string, error) {
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return hex.EncodeToString(b), nil
}

// SetAuthCookies writes access and refresh tokens as HTTP-only cookies.
func SetAuthCookies(w http.ResponseWriter, accessToken, refreshToken string, secure bool) {
	http.SetCookie(w, &http.Cookie{
		Name:     "access_token",
		Value:    accessToken,
		Path:     "/",
		HttpOnly: true,
		Secure:   secure,
		SameSite: http.SameSiteStrictMode,
		MaxAge:   15 * 60, // 15 minutes
	})
	http.SetCookie(w, &http.Cookie{
		Name:     "refresh_token",
		Value:    refreshToken,
		Path:     "/api/auth/refresh",
		HttpOnly: true,
		Secure:   secure,
		SameSite: http.SameSiteStrictMode,
		MaxAge:   7 * 24 * 60 * 60, // 7 days
	})
}

// ClearAuthCookies removes auth cookies on logout.
func ClearAuthCookies(w http.ResponseWriter) {
	for _, name := range []string{"access_token", "refresh_token"} {
		http.SetCookie(w, &http.Cookie{
			Name:     name,
			Value:    "",
			Path:     "/",
			HttpOnly: true,
			MaxAge:   -1,
		})
	}
}

// NullString converts a string to sql.NullString.
func NullString(s string) sql.NullString {
	if s == "" {
		return sql.NullString{}
	}
	return sql.NullString{String: s, Valid: true}
}

func validatePasswordStrength(password string) error {
	if len(password) < 8 {
		return ErrWeakPassword
	}
	var hasLetter, hasDigit, hasSymbol bool
	for _, c := range password {
		switch {
		case c >= 'a' && c <= 'z' || c >= 'A' && c <= 'Z':
			hasLetter = true
		case c >= '0' && c <= '9':
			hasDigit = true
		default:
			hasSymbol = true
		}
	}
	if !hasLetter || !hasDigit || !hasSymbol {
		return fmt.Errorf("%w", ErrWeakPassword)
	}
	return nil
}
