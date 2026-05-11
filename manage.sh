#!/usr/bin/env bash
# =============================================================================
# ZanAjira — Government Civil Service Job Application Portal
# Service Manager for Development & Production
# =============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVER_DIR="$SCRIPT_DIR/zanajira-server"
WEB_DIR="$SCRIPT_DIR/zanajira-web"
LOG_DIR="$SCRIPT_DIR/logs"
UPLOAD_DIR="${UPLOAD_DIR:-/tmp/zanajira/uploads}"
BACKUP_DIR="$SCRIPT_DIR/backups"

# ── Load .env ──────────────────────────────────────────────────────────────────
if [[ -f "$SCRIPT_DIR/.env" ]]; then
    set -a
    # shellcheck disable=SC1091
    source "$SCRIPT_DIR/.env"
    set +a
fi

# ── Configuration (defaults, overridable via .env) ─────────────────────────────
DB_NAME="${DB_NAME:-zanajira}"
DB_USER="${DB_USER:-zanajira}"
DB_PASS="${DB_PASS:-zanajira_pass}"
API_PORT="${PORT:-8080}"
FRONTEND_PORT="${FRONTEND_PORT:-5174}"
MODE="${ZANAJIRA_MODE:-dev}"

# ── Derived ─────────────────────────────────────────────────────────────────────
mkdir -p "$LOG_DIR" "$UPLOAD_DIR" "$BACKUP_DIR"
API_LOG="$LOG_DIR/api.log"
FRONTEND_LOG="$LOG_DIR/frontend.log"
API_BIN="$SERVER_DIR/bin/server"

# ── NVM (if available) ─────────────────────────────────────────────────────────
export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# ── Colours ─────────────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
BLUE='\033[0;34m'; CYAN='\033[0;36m'; BOLD='\033[1m'; NC='\033[0m'

log_info()    { echo -e "${CYAN}[INFO]${NC}  $*"; }
log_success() { echo -e "${GREEN}[OK]${NC}    $*"; }
log_warn()    { echo -e "${YELLOW}[WARN]${NC}  $*"; }
log_error()   { echo -e "${RED}[FAIL]${NC} $*"; }

log_header() {
    echo ""
    echo -e "${CYAN}══════════════════════════════════════════════${NC}"
    echo -e "${CYAN}  $*${NC}"
    echo -e "${CYAN}══════════════════════════════════════════════${NC}"
    echo ""
}

is_dev()  { [[ "$MODE" == "dev" ]]; }
is_prod() { [[ "$MODE" == "prod" ]]; }
mode_tag() { if is_dev; then echo "DEV"; else echo "PROD"; fi; }

# ── Port & Process Helpers ─────────────────────────────────────────────────────

port_is_open() {
    local port=$1
    ss -tlnp 2>/dev/null | grep -qE ":${port}[[:space:]]" && return 0
    lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1 && return 0
    return 1
}

http_responds() {
    local port=$1
    local code
    code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 3 --connect-timeout 2 "http://localhost:$port/" 2>/dev/null)
    [[ "$code" != "000" && -n "$code" ]]
}

port_pid() {
    local pid
    pid=$(lsof -ti:$1 2>/dev/null | head -1)
    if [[ -z "$pid" ]]; then
        pid=$(ss -tlnp "sport = :$1" 2>/dev/null | grep -oP 'pid=\K[0-9]+' | head -1)
    fi
    echo "$pid"
}

kill_port() {
    local port=$1 label="${2:-port $port}"
    if ! port_is_open "$port"; then return 0; fi
    log_warn "$label: port $port is in use, freeing it..."
    local pid
    pid=$(port_pid "$port")
    [[ -n "$pid" ]] && kill "$pid" 2>/dev/null || true
    sleep 1
    if port_is_open "$port"; then
        fuser -k "$port/tcp" 2>/dev/null || true
        sleep 1
    fi
    if port_is_open "$port"; then
        pid=$(port_pid "$port")
        [[ -n "$pid" ]] && sudo kill -9 "$pid" 2>/dev/null || true
        sleep 1
    fi
    if port_is_open "$port"; then
        log_error "$label: could not free port $port"
        return 1
    fi
    log_success "$label: port $port freed"
}

ensure_port_free() {
    local port=$1 label="${2:-service}"
    if port_is_open "$port"; then
        log_warn "$label is already running on port $port"
        kill_port "$port" "$label" || { log_error "Cannot start $label — port $port occupied"; return 1; }
    fi
}

wait_for_port() {
    local port=$1 label="${2:-service}" timeout="${3:-30}" elapsed=0
    log_info "Waiting for $label on port $port..."
    while [[ $elapsed -lt $timeout ]]; do
        if port_is_open "$port"; then
            local pid; pid=$(port_pid "$port")
            log_success "$label is ready on port $port${pid:+ (PID: $pid)}"
            return 0
        fi
        sleep 2; elapsed=$((elapsed + 2))
    done
    log_error "$label failed to start within ${timeout}s"
    return 1
}

# =============================================================================
# POSTGRESQL
# =============================================================================

is_postgres_running() {
    PGPASSWORD="$DB_PASS" psql -U "$DB_USER" -h localhost -p 5432 -d "$DB_NAME" -c "SELECT 1" >/dev/null 2>&1
}

start_postgres() {
    if is_postgres_running; then
        log_success "postgresql: already running"
        return 0
    fi
    log_info "Starting PostgreSQL..."
    if command -v systemctl &>/dev/null; then
        sudo systemctl start postgresql 2>/dev/null || true
    fi
    if ! is_postgres_running && command -v pg_ctlcluster &>/dev/null; then
        sudo pg_ctlcluster 16 main start 2>/dev/null || sudo pg_ctlcluster 15 main start 2>/dev/null || sudo pg_ctlcluster 14 main start 2>/dev/null || true
    fi
    if ! is_postgres_running && command -v service &>/dev/null; then
        sudo service postgresql start 2>/dev/null || true
    fi
    for i in $(seq 1 10); do
        if is_postgres_running; then log_success "postgresql: started"; return 0; fi
        sleep 1
    done
    log_error "postgresql: failed to start"
    return 1
}

stop_postgres() {
    if ! is_postgres_running; then log_info "postgresql: not running"; return 0; fi
    log_info "Stopping PostgreSQL..."
    if command -v systemctl &>/dev/null; then
        sudo systemctl stop postgresql 2>/dev/null || true
    fi
    for i in $(seq 1 5); do
        if ! is_postgres_running; then log_success "postgresql: stopped"; return 0; fi
        sleep 1
    done
    log_success "postgresql: stopped"
}

# =============================================================================
# REDIS
# =============================================================================

is_redis_running() { port_is_open 6379; }

start_redis() {
    if is_redis_running; then
        log_success "redis: already running"
        return 0
    fi
    log_info "Starting Redis..."
    if command -v systemctl &>/dev/null && systemctl is-active --quiet redis-server 2>/dev/null; then
        log_success "redis: already running (systemd)"
        return 0
    fi
    redis-server --daemonize yes 2>/dev/null
    for i in $(seq 1 5); do
        if is_redis_running; then log_success "redis: started"; return 0; fi
        sleep 1
    done
    log_error "redis: failed to start"
    return 1
}

stop_redis() {
    if command -v redis-cli &>/dev/null; then
        redis-cli shutdown 2>/dev/null || true
    fi
    log_success "redis: stopped"
}

# =============================================================================
# GO API SERVER
# =============================================================================

is_api_running() { port_is_open "$API_PORT"; }

start_api() {
    log_info "Starting API server on port $API_PORT [$(mode_tag)]..."
    ensure_port_free "$API_PORT" "API server" || return 1

    if ! is_postgres_running; then
        log_error "PostgreSQL is not running. Run: ./manage.sh start postgres"
        return 1
    fi

    mkdir -p "$LOG_DIR" "$UPLOAD_DIR"

    # Build first if binary is missing or in dev with air
    if is_dev; then
        if command -v air &>/dev/null; then
            log_info "Starting with air (hot-reload)..."
            cd "$SERVER_DIR"
            AIR_BIN=$(command -v air)
            nohup "$AIR_BIN" > "$API_LOG" 2>&1 < /dev/null &
            disown
        else
            log_info "Building Go binary..."
            cd "$SERVER_DIR"
            mkdir -p bin
            go build -o bin/server ./cmd/server/main.go
            nohup ./bin/server > "$API_LOG" 2>&1 < /dev/null &
            disown
        fi
    else
        # Production
        if [[ ! -x "$API_BIN" ]]; then
            log_warn "Production binary not found. Building..."
            cmd_build_backend
        fi
        if command -v pm2 &>/dev/null; then
            pm2 delete zanajira-api 2>/dev/null || true
            cd "$SERVER_DIR"
            pm2 start --name zanajira-api --interpreter none -- ./bin/server
        else
            cd "$SERVER_DIR"
            nohup ./bin/server > "$API_LOG" 2>&1 < /dev/null &
            disown
        fi
    fi

    wait_for_port "$API_PORT" "API server" 20
}

stop_api() {
    log_info "Stopping API server..."
    if command -v pm2 &>/dev/null && pm2 describe zanajira-api >/dev/null 2>&1; then
        pm2 stop zanajira-api 2>/dev/null; pm2 delete zanajira-api 2>/dev/null || true
    fi
    pkill -f "zanajira-server/bin/server" 2>/dev/null || true
    pkill -f "air" 2>/dev/null || true
    kill_port "$API_PORT" "API server"
    log_success "API server stopped"
}

restart_api() {
    log_info "Restarting API server..."
    stop_api; sleep 1; start_api
}

# =============================================================================
# VITE FRONTEND
# =============================================================================

is_frontend_running() { port_is_open "$FRONTEND_PORT"; }

start_frontend() {
    log_info "Starting frontend on port $FRONTEND_PORT [$(mode_tag)]..."
    ensure_port_free "$FRONTEND_PORT" "Frontend" || return 1
    mkdir -p "$LOG_DIR"

    if is_dev; then
        cd "$WEB_DIR"
        nohup npx vite --port "$FRONTEND_PORT" > "$FRONTEND_LOG" 2>&1 < /dev/null &
        disown
    else
        # Production: serve built files
        if [[ ! -d "$WEB_DIR/dist" ]]; then
            log_warn "Production build not found. Building frontend..."
            cmd_build_frontend
        fi
        if command -v pm2 &>/dev/null; then
            pm2 delete zanajira-web 2>/dev/null || true
            cd "$WEB_DIR"
            pm2 start "npx serve dist -l $FRONTEND_PORT -s" --name zanajira-web
        else
            cd "$WEB_DIR"
            nohup npx serve dist -l "$FRONTEND_PORT" -s > "$FRONTEND_LOG" 2>&1 < /dev/null &
            disown
        fi
    fi

    wait_for_port "$FRONTEND_PORT" "Frontend" 30
}

stop_frontend() {
    log_info "Stopping frontend..."
    if command -v pm2 &>/dev/null && pm2 describe zanajira-web >/dev/null 2>&1; then
        pm2 stop zanajira-web 2>/dev/null; pm2 delete zanajira-web 2>/dev/null || true
    fi
    pkill -f "vite" 2>/dev/null || true
    pkill -f "serve dist" 2>/dev/null || true
    kill_port "$FRONTEND_PORT" "Frontend"
    log_success "Frontend stopped"
}

restart_frontend() {
    log_info "Restarting frontend..."
    stop_frontend; sleep 1; start_frontend
}

# =============================================================================
# MAILPIT (dev SMTP server)
# =============================================================================

is_mailpit_running() { port_is_open 1025; }

start_mailpit() {
    if is_mailpit_running; then
        log_success "mailpit: already running"
        return 0
    fi
    if ! command -v mailpit &>/dev/null; then
        log_warn "mailpit: not installed (https://github.com/axllent/mailpit)"
        return 1
    fi
    log_info "Starting Mailpit SMTP server..."
    nohup mailpit --smtp-listen 0.0.0.0:1025 --listen 0.0.0.0:8025 > "$LOG_DIR/mailpit.log" 2>&1 < /dev/null &
    disown
    sleep 2
    if is_mailpit_running; then
        log_success "mailpit: started (SMTP :1025, UI http://localhost:8025)"
    else
        log_error "mailpit: failed to start"
        return 1
    fi
}

stop_mailpit() {
    pkill -f "mailpit" 2>/dev/null || true
    log_success "mailpit: stopped"
}

# =============================================================================
# INFRASTRUCTURE (postgres + redis)
# =============================================================================

start_infra() {
    log_info "Starting infrastructure..."
    local failures=0
    start_postgres || failures=$((failures + 1))
    start_redis || failures=$((failures + 1))
    return $failures
}

stop_infra() {
    log_info "Stopping infrastructure..."
    stop_redis; stop_postgres
}

# =============================================================================
# START / STOP / RESTART ALL
# =============================================================================

start_all() {
    log_header "Starting ZanAjira [$(mode_tag)]"
    local result=0

    start_infra
    local infra_fail=$?
    [[ $infra_fail -gt 0 ]] && log_warn "Some infrastructure services failed"

    start_api
    [[ $? -ne 0 ]] && result=1

    start_frontend
    [[ $? -ne 0 ]] && result=1

    echo ""
    echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BOLD}  ZanAjira Service Status${NC}"
    echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

    if is_postgres_running; then echo -e "  ${GREEN}● PostgreSQL${NC}  port 5432  db: $DB_NAME"
    else echo -e "  ${RED}● PostgreSQL${NC}  NOT RUNNING"; result=1; fi

    if is_redis_running; then echo -e "  ${GREEN}● Redis${NC}       port 6379"
    else echo -e "  ${RED}● Redis${NC}       NOT RUNNING"; result=1; fi

    if is_api_running; then echo -e "  ${GREEN}● API${NC}         port $API_PORT  http://localhost:$API_PORT/health"
    else echo -e "  ${RED}● API${NC}         FAILED"; result=1; fi

    if is_frontend_running; then echo -e "  ${GREEN}● Frontend${NC}   port $FRONTEND_PORT  http://localhost:$FRONTEND_PORT"
    else echo -e "  ${RED}● Frontend${NC}   FAILED"; result=1; fi

    echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""

    [[ $result -eq 0 ]] && log_success "ZanAjira is running → http://localhost:$FRONTEND_PORT" || log_error "Some services failed"
    return $result
}

stop_all() {
    log_header "Stopping ZanAjira"
    stop_frontend; stop_api; stop_mailpit; stop_infra
    log_success "All services stopped"
}

restart_all() {
    stop_all; sleep 2; start_all
}

start_dev() {
    log_header "Starting dev servers (frontend + backend)"
    ensure_port_free "$API_PORT" "API server" || return 1
    ensure_port_free "$FRONTEND_PORT" "Frontend" || return 1
    start_infra
    start_api; start_frontend
}

# =============================================================================
# STATUS & HEALTH
# =============================================================================

svc_line() {
    local label=$1 port=$2 extra=$3
    if port_is_open "$port"; then
        local pid; pid=$(port_pid "$port")
        echo -e "  ${GREEN}● ${label}${NC}  port ${port}${pid:+ (PID: $pid)}  ${extra}"
    else
        echo -e "  ${RED}● ${label}${NC}  port ${port}  ${RED}Stopped${NC}"
    fi
}

cmd_status() {
    log_header "ZanAjira Service Status [$(mode_tag)]"
    echo -e "  ${BOLD}Infrastructure${NC}"
    echo -e "  ${CYAN}─────────────────────────────────────────${NC}"
    svc_line "PostgreSQL " 5432 "db: $DB_NAME"
    svc_line "Redis      " 6379 ""
    echo ""
    echo -e "  ${BOLD}Application${NC}"
    echo -e "  ${CYAN}─────────────────────────────────────────${NC}"
    svc_line "API Server " "$API_PORT" "http://localhost:$API_PORT/health"
    svc_line "Frontend   " "$FRONTEND_PORT" "http://localhost:$FRONTEND_PORT"
    echo ""
    echo -e "  ${BOLD}Dev Tools${NC}"
    echo -e "  ${CYAN}─────────────────────────────────────────${NC}"
    svc_line "Mailpit SMTP" 1025 "http://localhost:8025"
    echo ""
}

cmd_health() {
    log_info "Running health checks..."
    echo ""
    for svc in "PostgreSQL:5432" "Redis:6379" "API:$API_PORT" "Frontend:$FRONTEND_PORT"; do
        local name="${svc%%:*}" port="${svc##*:}"
        if port_is_open "$port"; then
            echo -e "  ${GREEN}● $name${NC} port $port — listening"
        else
            echo -e "  ${RED}● $name${NC} port $port — not listening"
        fi
    done
    echo ""
    if http_responds "$API_PORT"; then
        echo -e "  ${GREEN}● API /health${NC} — responding"
        curl -s "http://localhost:$API_PORT/health" 2>/dev/null | head -1
        echo ""
    else
        echo -e "  ${RED}● API /health${NC} — not responding"
    fi
    echo ""
}

# =============================================================================
# LOGS
# =============================================================================

cmd_logs() {
    local service="${1:-all}" lines="${2:-80}"
    case "$service" in
        api|server|backend)
            log_info "API server logs (last $lines lines):"
            tail -n "$lines" "$API_LOG" 2>/dev/null || log_error "No log at $API_LOG" ;;
        frontend|client|web)
            log_info "Frontend logs (last $lines lines):"
            tail -n "$lines" "$FRONTEND_LOG" 2>/dev/null || log_error "No log at $FRONTEND_LOG" ;;
        postgres|postgresql)
            log_info "PostgreSQL logs:"
            journalctl -u postgresql -n "$lines" --no-pager 2>/dev/null || log_error "Could not read PostgreSQL logs" ;;
        redis)
            log_info "Redis logs:"
            journalctl -u redis-server -n "$lines" --no-pager 2>/dev/null || log_error "Could not read Redis logs" ;;
        all|"")
            for entry in "API server:$API_LOG" "Frontend:$FRONTEND_LOG"; do
                local name="${entry%%:*}" file="${entry##*:}"
                echo ""; log_info "=== $name (last 30 lines) ==="
                tail -n 30 "$file" 2>/dev/null || log_error "No log at $file"
            done ;;
        *) log_error "Unknown: $service  (api|frontend|postgres|redis|all)" ;;
    esac
}

cmd_tail() {
    local service="${1:-all}"
    case "$service" in
        api|server|backend) log_info "Tailing API logs (Ctrl+C to stop)..."; tail -f "$API_LOG" 2>/dev/null || log_error "No log at $API_LOG" ;;
        frontend|client|web) log_info "Tailing frontend logs (Ctrl+C to stop)..."; tail -f "$FRONTEND_LOG" 2>/dev/null || log_error "No log at $FRONTEND_LOG" ;;
        all|"") log_info "Tailing all logs (Ctrl+C to stop)..."; tail -f "$API_LOG" "$FRONTEND_LOG" 2>/dev/null || log_error "No log files found" ;;
        *) log_error "Unknown: $service" ;;
    esac
}

# =============================================================================
# DATABASE COMMANDS
# =============================================================================

cmd_db_init() {
    log_info "Initialising PostgreSQL database..."
    sudo -u postgres psql <<SQL
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '$DB_USER') THEN
    CREATE ROLE $DB_USER WITH LOGIN PASSWORD '$DB_PASS';
  END IF;
END
\$\$;
SELECT 'Role ensured: $DB_USER';
SQL
    sudo -u postgres createdb -O "$DB_USER" "$DB_NAME" 2>/dev/null \
        && log_success "Database '$DB_NAME' created." \
        || log_warn "Database '$DB_NAME' may already exist."
}

cmd_db_migrate() {
    log_info "Running database migrations..."
    cd "$SERVER_DIR"
    if command -v migrate &>/dev/null; then
        migrate -path db/migrations -database "${DATABASE_URL}" up \
            && log_success "Migrations applied." \
            || log_error "Migration failed."
    else
        log_info "migrate tool not found, applying SQL files directly..."
        for f in db/migrations/*.up.sql; do
            [[ ! -f "$f" ]] && continue
            log_info "Applying $f..."
            PGPASSWORD="$DB_PASS" psql -U "$DB_USER" -h localhost -d "$DB_NAME" -f "$f" && log_success "Applied: $f"
        done
    fi
}

cmd_db_rollback() {
    log_info "Rolling back last migration..."
    cd "$SERVER_DIR"
    if command -v migrate &>/dev/null; then
        migrate -path db/migrations -database "${DATABASE_URL}" down 1 \
            && log_success "Rolled back 1 migration." \
            || log_error "Rollback failed."
    else
        log_error "migrate tool not installed. Install: https://github.com/golang-migrate/migrate"
    fi
}

cmd_db_seed() {
    log_info "Seeding reference data..."
    cd "$SCRIPT_DIR"
    for f in seeds/*.sql; do
        [[ ! -f "$f" ]] && continue
        log_info "Seeding $f..."
        PGPASSWORD="$DB_PASS" psql -U "$DB_USER" -h localhost -d "$DB_NAME" -f "$f" && log_success "Seeded: $f"
    done
}

cmd_db_backup() {
    local ts; ts=$(date +%Y%m%d_%H%M%S)
    local backup_file="$BACKUP_DIR/zanajira_${ts}.sql.gz"
    log_info "Backing up database '$DB_NAME'..."
    PGPASSWORD="$DB_PASS" pg_dump -U "$DB_USER" -h localhost -d "$DB_NAME" | gzip > "$backup_file"
    if [[ $? -eq 0 ]]; then
        log_success "Backup: $backup_file ($(du -h "$backup_file" | cut -f1))"
    else
        log_error "Backup failed"; return 1
    fi
}

cmd_db_restore() {
    local backup_file="${1:-}"
    if [[ -z "$backup_file" ]]; then
        backup_file=$(ls -t "$BACKUP_DIR"/zanajira_*.sql.gz 2>/dev/null | head -1)
        if [[ -z "$backup_file" ]]; then
            log_error "No backup files found in $BACKUP_DIR/"; return 1
        fi
        log_info "Using most recent: $backup_file"
    fi
    [[ ! -f "$backup_file" ]] && { log_error "File not found: $backup_file"; return 1; }

    log_warn "This will REPLACE database '$DB_NAME'!"
    read -p "Are you sure? (y/N): " confirm
    [[ "$confirm" != [yY] && "$confirm" != [yY][eE][sS] ]] && { log_info "Cancelled"; return 0; }

    log_info "Restoring from $backup_file..."
    gunzip -c "$backup_file" | PGPASSWORD="$DB_PASS" psql -U "$DB_USER" -h localhost -d "$DB_NAME"
    [[ $? -eq 0 ]] && log_success "Restored from $backup_file" || { log_error "Restore failed"; return 1; }
}

# =============================================================================
# BUILD COMMANDS
# =============================================================================

cmd_build_backend() {
    log_info "Building Go backend..."
    cd "$SERVER_DIR"
    mkdir -p bin
    go build -o bin/server ./cmd/server/main.go \
        && log_success "Backend built: zanajira-server/bin/server" \
        || { log_error "Backend build failed"; return 1; }
}

cmd_build_frontend() {
    log_info "Building React frontend..."
    cd "$WEB_DIR"
    npm run build \
        && log_success "Frontend built: zanajira-web/dist/" \
        || { log_error "Frontend build failed"; return 1; }
}

cmd_build() {
    log_info "Building all [$(mode_tag)]..."
    cmd_build_backend && cmd_build_frontend
    log_success "Build complete"
}

cmd_clean() {
    log_info "Cleaning build artifacts..."
    rm -rf "$WEB_DIR/dist"
    rm -rf "$SERVER_DIR/bin"
    rm -rf "$WEB_DIR/node_modules/.cache"
    log_success "Cleaned"
}

# =============================================================================
# CREATE ADMIN
# =============================================================================

cmd_create_admin() {
    log_info "Creating admin user..."
    cd "$SERVER_DIR"
    go run ./cmd/create-admin/main.go
}

# =============================================================================
# HELP
# =============================================================================

show_help() {
    echo ""
    echo -e "${CYAN}╔══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║   ZanAjira — Service Manager                            ║${NC}"
    echo -e "${CYAN}║   Civil Service Commission, Revolutionary Govt Zanzibar ║${NC}"
    echo -e "${CYAN}╚══════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "  Mode: ${BOLD}dev${NC} (default) or ${BOLD}prod${NC} (set ZANAJIRA_MODE=prod)"
    echo ""
    echo -e "  ${BOLD}Usage:${NC} ./manage.sh <command> [service]"
    echo ""
    echo -e "  ${BOLD}Quick Start:${NC}"
    echo "    dev                   Start frontend + backend in dev mode"
    echo "    start [service]       Start service or all (dev mode)"
    echo "    stop [service]        Stop service or all"
    echo "    restart [service]     Restart service or all"
    echo "    status                Show status of all services"
    echo "    health                HTTP health checks"
    echo ""
    echo -e "  ${BOLD}Services:${NC}"
    echo "    all          All services (default)"
    echo "    infra        Infrastructure only (postgres + redis)"
    echo "    postgres     PostgreSQL database"
    echo "    redis        Redis server"
    echo "    api          Go API server"
    echo "    frontend     Vite/React frontend"
    echo "    mailpit      Mailpit SMTP test server"
    echo ""
    echo -e "  ${BOLD}Database:${NC}"
    echo "    db:init               Create database and user"
    echo "    db:migrate            Run migrations up"
    echo "    db:rollback           Roll back last migration"
    echo "    db:seed               Seed reference data"
    echo "    db:backup             Backup database (gzip)"
    echo "    db:restore [file]     Restore from backup"
    echo ""
    echo -e "  ${BOLD}Build & Tools:${NC}"
    echo "    build                 Build backend + frontend"
    echo "    build:backend         Build Go binary"
    echo "    build:frontend        Build React production bundle"
    echo "    create-admin          Create initial admin user"
    echo "    clean                 Remove build artifacts"
    echo ""
    echo -e "  ${BOLD}Logs:${NC}"
    echo "    logs [service]        View recent logs (api, frontend, postgres, redis, all)"
    echo "    tail [service]        Tail logs in real-time"
    echo ""
    echo -e "  ${BOLD}Examples:${NC}"
    echo "    ./manage.sh dev                 # Start dev servers"
    echo "    ./manage.sh start              # Start everything"
    echo "    ./manage.sh start api          # Start only the API"
    echo "    ./manage.sh stop                # Stop everything"
    echo "    ./manage.sh logs api           # View API logs"
    echo "    ./manage.sh db:migrate         # Run migrations"
    echo "    ./manage.sh build               # Build all"
    echo "    ./manage.sh create-admin        # Create admin user"
    echo ""
    echo -e "  ${BOLD}Environment:${NC}"
    echo "    .env file is auto-loaded from project root"
    echo "    ZANAJIRA_MODE=prod  ./manage.sh start   # Production mode"
    echo "    PORT=8080           # API port (default: 8080)"
    echo "    FRONTEND_PORT=5174  # Frontend dev port (default: 5174)"
    echo ""
}

# =============================================================================
# COMMAND ROUTER
# =============================================================================

resolve_service() {
    local action=$1 service="${2:-all}"
    case "$service" in
        all|"")        ${action}_all ;;
        infra)         ${action}_infra ;;
        postgres|postgresql) ${action}_postgres ;;
        redis)         ${action}_redis ;;
        api|server|backend) ${action}_api ;;
        frontend|client|web) ${action}_frontend ;;
        mailpit)       ${action}_mailpit ;;
        *)             log_error "Unknown service: $service"; log_info "Valid: all, infra, postgres, redis, api, frontend, mailpit"; exit 1 ;;
    esac
}

case "${1:-}" in
    start)          resolve_service start "${2:-all}" ;;
    stop)           resolve_service stop "${2:-all}" ;;
    restart)        resolve_service restart "${2:-all}" ;;
    dev)            start_dev ;;
    status)         cmd_status ;;
    health)         cmd_health ;;
    logs)           cmd_logs "${2:-all}" "${3:-80}" ;;
    tail|tail-logs) cmd_tail "${2:-all}" ;;
    db:init)        cmd_db_init ;;
    db:migrate)     cmd_db_migrate ;;
    db:rollback)    cmd_db_rollback ;;
    db:seed)        cmd_db_seed ;;
    db:backup)      cmd_db_backup ;;
    db:restore)     cmd_db_restore "${2:-}" ;;
    build:backend)  cmd_build_backend ;;
    build:frontend) cmd_build_frontend ;;
    build)          cmd_build ;;
    create-admin)   cmd_create_admin ;;
    clean)          cmd_clean ;;
    help|--help|-h) show_help ;;
    "")             show_help ;;
    *)              log_error "Unknown command: $1"; show_help; exit 1 ;;
esac

exit 0