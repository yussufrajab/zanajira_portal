package config

import (
	"fmt"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

type Config struct {
	// Server
	Port string
	Env  string

	// Database
	DatabaseURL string

	// Redis
	RedisURL string

	// JWT
	JWTSecret        string
	JWTRefreshSecret string

	// ZanID
	ZanIDAPIURL string
	ZanIDAPIKey string
	ZanIDMock   bool

	// SMTP
	SMTPHost string
	SMTPPort int
	SMTPUser string
	SMTPPass string
	SMTPFrom string

	// Application
	UploadDir string
	AppURL    string

	// Session
	SessionTimeoutMinutes int
	ProfileThreshold      int // default 70
}

func Load() (*Config, error) {
	// Load .env if present (ignore error — env vars may already be set)
	_ = godotenv.Load()

	cfg := &Config{
		Port:                  getEnv("PORT", "8080"),
		Env:                   getEnv("ENV", "development"),
		DatabaseURL:           mustEnv("DATABASE_URL"),
		RedisURL:              getEnv("REDIS_URL", "redis://localhost:6379"),
		JWTSecret:             mustEnv("JWT_SECRET"),
		JWTRefreshSecret:      mustEnv("JWT_REFRESH_SECRET"),
		ZanIDAPIURL:           getEnv("ZANID_API_URL", "https://zanid.go.tz/api"),
		ZanIDAPIKey:           getEnv("ZANID_API_KEY", ""),
		ZanIDMock:             getEnvBool("ZANID_MOCK", true),
		SMTPHost:              getEnv("SMTP_HOST", "localhost"),
		SMTPPort:              getEnvInt("SMTP_PORT", 1025),
		SMTPUser:              getEnv("SMTP_USER", ""),
		SMTPPass:              getEnv("SMTP_PASS", ""),
		SMTPFrom:              getEnv("SMTP_FROM", "noreply@zanajira.go.tz"),
		UploadDir:             getEnv("UPLOAD_DIR", "/var/zanajira/uploads"),
		AppURL:                getEnv("APP_URL", "http://localhost:5173"),
		SessionTimeoutMinutes: getEnvInt("SESSION_TIMEOUT_MINUTES", 30),
		ProfileThreshold:      getEnvInt("PROFILE_THRESHOLD", 70),
	}

	return cfg, nil
}

func (c *Config) IsDev() bool {
	return c.Env == "development"
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func mustEnv(key string) string {
	v := os.Getenv(key)
	if v == "" {
		panic(fmt.Sprintf("required environment variable %q is not set", key))
	}
	return v
}

func getEnvInt(key string, fallback int) int {
	if v := os.Getenv(key); v != "" {
		if i, err := strconv.Atoi(v); err == nil {
			return i
		}
	}
	return fallback
}

func getEnvBool(key string, fallback bool) bool {
	if v := os.Getenv(key); v != "" {
		b, err := strconv.ParseBool(v)
		if err == nil {
			return b
		}
	}
	return fallback
}
