package handler

import (
	"database/sql"
	"errors"
	"fmt"
	"net/http"
	"strings"

	"github.com/labstack/echo/v4"
)

func badRequest(c echo.Context, msg string) error {
	return c.JSON(http.StatusBadRequest, map[string]string{"error": msg})
}

func serverError(c echo.Context, err error) error {
	return c.JSON(http.StatusInternalServerError, map[string]string{"error": "internal server error"})
}

func notFound(c echo.Context, msg string) error {
	return c.JSON(http.StatusNotFound, map[string]string{"error": msg})
}

func isUniqueViolation(err error) bool {
	if err == nil {
		return false
	}
	return strings.Contains(err.Error(), "unique") || strings.Contains(err.Error(), "duplicate")
}

func isNotFound(err error) bool {
	return errors.Is(err, sql.ErrNoRows)
}

func paginationParams(c echo.Context) (limit, offset int) {
	limit = 20
	offset = 0
	if l := c.QueryParam("limit"); l != "" {
		if _, err := parseInt(l); err == nil {
			limit, _ = parseInt(l)
		}
	}
	if p := c.QueryParam("page"); p != "" {
		if page, err := parseInt(p); err == nil && page > 1 {
			offset = (page - 1) * limit
		}
	}
	if limit > 100 {
		limit = 100
	}
	return
}

func parseInt(s string) (int, error) {
	var n int
	_, err := fmt.Sscanf(s, "%d", &n)
	return n, err
}
