package main

import (
	"bufio"
	"database/sql"
	"fmt"
	"log"
	"os"
	"strings"
	"syscall"

	"github.com/egaz/zanajira-server/internal/config"
	"github.com/egaz/zanajira-server/internal/service"
	_ "github.com/lib/pq"
	"golang.org/x/term"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("config error: %v", err)
	}

	db, err := sql.Open("postgres", cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("db error: %v", err)
	}
	defer db.Close()

	if err := db.Ping(); err != nil {
		log.Fatalf("db ping error: %v", err)
	}

	reader := bufio.NewReader(os.Stdin)

	fmt.Println("=== ZanAjira — Create Admin User ===")
	fmt.Print("Email: ")
	email, _ := reader.ReadString('\n')
	email = strings.TrimSpace(email)

	fmt.Print("Password: ")
	passBytes, err := term.ReadPassword(int(syscall.Stdin))
	fmt.Println()
	if err != nil {
		log.Fatalf("failed to read password: %v", err)
	}
	password := string(passBytes)

	hash, err := service.HashPassword(password)
	if err != nil {
		log.Fatalf("password error: %v", err)
	}

	var id string
	err = db.QueryRow(
		`INSERT INTO users (email, password_hash, role, is_active)
		 VALUES ($1, $2, 'admin', TRUE)
		 ON CONFLICT (email) DO UPDATE SET role='admin', is_active=TRUE, updated_at=NOW()
		 RETURNING id`,
		email, hash,
	).Scan(&id)
	if err != nil {
		log.Fatalf("failed to create admin: %v", err)
	}

	fmt.Printf("\n✓ Admin user created: %s (id: %s)\n", email, id)
}
