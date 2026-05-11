package middleware

import (
	"net/http"
	"strings"

	"github.com/golang-jwt/jwt/v5"
	"github.com/labstack/echo/v4"
)

type JWTClaims struct {
	UserID string `json:"user_id"`
	Role   string `json:"role"`
	Email  string `json:"email"`
	jwt.RegisteredClaims
}

// Auth validates the JWT from the Authorization header or cookie.
func Auth(secret string) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			tokenStr := extractToken(c)
			if tokenStr == "" {
				return c.JSON(http.StatusUnauthorized, map[string]string{"error": "missing or invalid token"})
			}

			claims := &JWTClaims{}
			token, err := jwt.ParseWithClaims(tokenStr, claims, func(t *jwt.Token) (interface{}, error) {
				if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
					return nil, echo.ErrUnauthorized
				}
				return []byte(secret), nil
			})
			if err != nil || !token.Valid {
				return c.JSON(http.StatusUnauthorized, map[string]string{"error": "invalid or expired token"})
			}

			c.Set("user_id", claims.UserID)
			c.Set("role", claims.Role)
			c.Set("email", claims.Email)
			return next(c)
		}
	}
}

// RequirePermission checks that the authenticated user's role has the given permission.
func RequirePermission(rolePerms map[string][]string, permission string) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			role, _ := c.Get("role").(string)
			perms := rolePerms[role]
			for _, p := range perms {
				if p == permission || p == "*" {
					return next(c)
				}
			}
			return c.JSON(http.StatusForbidden, map[string]string{"error": "forbidden"})
		}
	}
}

// RequireRole checks that the authenticated user has one of the given roles.
func RequireRole(roles ...string) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			userRole, _ := c.Get("role").(string)
			for _, r := range roles {
				if userRole == r {
					return next(c)
				}
			}
			return c.JSON(http.StatusForbidden, map[string]string{"error": "forbidden"})
		}
	}
}

func extractToken(c echo.Context) string {
	// 1. Authorization header
	header := c.Request().Header.Get("Authorization")
	if strings.HasPrefix(header, "Bearer ") {
		return strings.TrimPrefix(header, "Bearer ")
	}
	// 2. Cookie
	cookie, err := c.Cookie("access_token")
	if err == nil && cookie.Value != "" {
		return cookie.Value
	}
	return ""
}
