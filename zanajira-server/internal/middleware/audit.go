package middleware

import (
	"database/sql"
	"encoding/json"
	"net"
	"net/http"

	"github.com/labstack/echo/v4"
)

// AuditLogger writes significant actions to the audit_logs table.
// db is passed as *sql.DB; the actual INSERT is done via a raw query
// to avoid circular imports with the repository package.
func AuditLogger(db *sql.DB) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			err := next(c)

			// Only log mutating requests that succeeded
			method := c.Request().Method
			status := c.Response().Status
			if method == http.MethodGet || status >= 500 {
				return err
			}

			userID, _ := c.Get("user_id").(string)
			action := method + " " + c.Path()
			resource := c.Path()
			resourceID := c.Param("id")
			ip, _, _ := net.SplitHostPort(c.Request().RemoteAddr)

			meta, _ := json.Marshal(map[string]interface{}{
				"status": status,
				"query":  c.QueryString(),
			})

			var uid interface{}
			if userID != "" {
				uid = userID
			}

			_, _ = db.Exec(
				`INSERT INTO audit_logs (user_id, action, resource, resource_id, ip_address, metadata_json)
				 VALUES ($1, $2, $3, $4, $5, $6)`,
				uid, action, resource, resourceID, ip, meta,
			)

			return err
		}
	}
}
