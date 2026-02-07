# LDPv2 - Makefile for Container Management
# Quick commands for building, running, and managing the unified container

.PHONY: help build up down restart logs clean test backup

# Default target
.DEFAULT_GOAL := help

# Colors for output
GREEN  := \033[0;32m
YELLOW := \033[0;33m
RED    := \033[0;31m
NC     := \033[0m # No Color

##@ General

help: ## Display this help message
	@echo "$(GREEN)LDPv2 - Docker Management Commands$(NC)"
	@echo ""
	@awk 'BEGIN {FS = ":.*##"; printf "Usage: make $(YELLOW)<target>$(NC)\n"} /^[a-zA-Z_-]+:.*?##/ { printf "  $(YELLOW)%-15s$(NC) %s\n", $$1, $$2 } /^##@/ { printf "\n$(GREEN)%s$(NC)\n", substr($$0, 5) } ' $(MAKEFILE_LIST)

##@ Development

build: ## Build all containers
	@echo "$(GREEN)Building containers...$(NC)"
	docker compose build

build-no-cache: ## Build all containers without cache
	@echo "$(GREEN)Building containers (no cache)...$(NC)"
	docker compose build --no-cache

up: ## Start all containers
	@echo "$(GREEN)Starting containers...$(NC)"
	docker compose up

up-build: ## Build and start all containers
	@echo "$(GREEN)Building and starting containers...$(NC)"
	docker compose up --build

up-d: ## Start all containers in background
	@echo "$(GREEN)Starting containers in background...$(NC)"
	docker compose up -d

down: ## Stop and remove all containers
	@echo "$(YELLOW)Stopping containers...$(NC)"
	docker compose down

down-v: ## Stop containers and remove volumes (WARNING: deletes database!)
	@echo "$(RED)Stopping containers and removing volumes...$(NC)"
	@read -p "This will delete the database. Are you sure? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		docker compose down -v; \
	fi

restart: ## Restart all containers
	@echo "$(YELLOW)Restarting containers...$(NC)"
	docker compose restart

restart-app: ## Restart only the app container
	@echo "$(YELLOW)Restarting app container...$(NC)"
	docker compose restart app

##@ Logs and Monitoring

logs: ## Show logs from all containers
	docker compose logs -f

logs-app: ## Show logs from app container only
	docker compose logs -f app

logs-postgres: ## Show logs from postgres container only
	docker compose logs -f postgres

logs-backend: ## Show backend application logs
	@echo "$(GREEN)Showing backend logs (Ctrl+C to exit)...$(NC)"
	docker exec ldpv2-app tail -f /var/log/supervisor/backend.log

logs-nginx: ## Show nginx logs
	@echo "$(GREEN)Showing nginx logs (Ctrl+C to exit)...$(NC)"
	docker exec ldpv2-app tail -f /var/log/supervisor/nginx.log

status: ## Show status of all services
	@echo "$(GREEN)Container Status:$(NC)"
	@docker ps --filter "name=ldpv2" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
	@echo ""
	@echo "$(GREEN)Process Status (in app container):$(NC)"
	@docker exec ldpv2-app supervisorctl status || echo "$(RED)App container not running$(NC)"

health: ## Check health of all containers
	@echo "$(GREEN)Health Check:$(NC)"
	@docker inspect ldpv2-app --format='App Container: {{.State.Health.Status}}' 2>/dev/null || echo "$(RED)App container not running$(NC)"
	@docker inspect ldpv2-postgres --format='Database: {{.State.Health.Status}}' 2>/dev/null || echo "$(RED)Database container not running$(NC)"

##@ Database

db-shell: ## Connect to PostgreSQL shell
	@echo "$(GREEN)Connecting to database (use \q to exit)...$(NC)"
	docker exec -it ldpv2-postgres psql -U ldpv2_user -d ldpv2

db-backup: ## Backup database to backup.sql
	@echo "$(GREEN)Backing up database...$(NC)"
	docker exec ldpv2-postgres pg_dump -U ldpv2_user ldpv2 > backup_$(shell date +%Y%m%d_%H%M%S).sql
	@echo "$(GREEN)Backup complete!$(NC)"

db-restore: ## Restore database from backup.sql
	@if [ ! -f backup.sql ]; then \
		echo "$(RED)Error: backup.sql not found$(NC)"; \
		exit 1; \
	fi
	@echo "$(YELLOW)Restoring database...$(NC)"
	docker exec -i ldpv2-postgres psql -U ldpv2_user ldpv2 < backup.sql
	@echo "$(GREEN)Restore complete!$(NC)"

##@ Testing and Debugging

shell-app: ## Open shell in app container
	@echo "$(GREEN)Opening shell in app container...$(NC)"
	docker exec -it ldpv2-app /bin/sh

shell-db: ## Open shell in database container
	@echo "$(GREEN)Opening shell in database container...$(NC)"
	docker exec -it ldpv2-postgres /bin/sh

test-backend: ## Test backend health endpoint
	@echo "$(GREEN)Testing backend health...$(NC)"
	@curl -s http://localhost/api/actuator/health | jq . || echo "$(RED)Backend not responding$(NC)"

test-api: ## Test API with sample request
	@echo "$(GREEN)Testing API (login)...$(NC)"
	@curl -s -X POST http://localhost/api/auth/login \
		-H "Content-Type: application/json" \
		-d '{"username":"admin","password":"admin123"}' | jq . || echo "$(RED)API test failed$(NC)"

test-nginx: ## Test nginx configuration
	@echo "$(GREEN)Testing nginx configuration...$(NC)"
	docker exec ldpv2-app nginx -t

##@ Maintenance

clean: ## Remove all stopped containers and unused images
	@echo "$(YELLOW)Cleaning up...$(NC)"
	docker compose down
	docker system prune -f
	@echo "$(GREEN)Cleanup complete!$(NC)"

clean-all: ## Remove everything including volumes (WARNING: deletes database!)
	@echo "$(RED)This will remove all containers, images, and volumes$(NC)"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		docker compose down -v; \
		docker system prune -af; \
		echo "$(GREEN)Full cleanup complete!$(NC)"; \
	fi

reset: ## Complete reset (rebuild everything)
	@echo "$(YELLOW)Resetting everything...$(NC)"
	$(MAKE) down
	$(MAKE) build-no-cache
	$(MAKE) up-d
	@echo "$(GREEN)Reset complete!$(NC)"

##@ Production

prod-deploy: ## Deploy for production (builds and starts in background)
	@echo "$(GREEN)Deploying for production...$(NC)"
	docker compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d
	@echo "$(GREEN)Production deployment complete!$(NC)"

prod-logs: ## Show production logs
	docker compose -f docker-compose.yml -f docker-compose.prod.yml logs -f

prod-down: ## Stop production deployment
	docker compose -f docker-compose.yml -f docker-compose.prod.yml down

##@ Quick Actions

quick-start: up-build ## Quick start (build and run in foreground)

quick-restart: ## Quick restart (useful after code changes)
	$(MAKE) down
	$(MAKE) up-build

reload-backend: ## Reload backend without full restart
	@echo "$(YELLOW)Reloading backend...$(NC)"
	docker exec ldpv2-app supervisorctl restart backend
	@echo "$(GREEN)Backend reloaded!$(NC)"

reload-nginx: ## Reload nginx configuration
	@echo "$(YELLOW)Reloading nginx...$(NC)"
	docker exec ldpv2-app nginx -s reload
	@echo "$(GREEN)Nginx reloaded!$(NC)"

##@ Information

info: ## Show container information
	@echo "$(GREEN)=== LDPv2 Container Information ===$(NC)"
	@echo ""
	@echo "$(YELLOW)Access Points:$(NC)"
	@echo "  Frontend:  http://localhost"
	@echo "  API Docs:  http://localhost/api/swagger-ui/index.html"
	@echo "  Health:    http://localhost/api/actuator/health"
	@echo ""
	@echo "$(YELLOW)Default Credentials:$(NC)"
	@echo "  Username: admin"
	@echo "  Password: admin123"
	@echo ""
	@echo "$(YELLOW)Container Status:$(NC)"
	@$(MAKE) status

version: ## Show version information
	@echo "$(GREEN)LDPv2 Version Information$(NC)"
	@echo "Docker:         $$(docker --version)"
	@echo "Docker Compose: $$(docker compose version)"
	@echo "Java (in container): $$(docker exec ldpv2-app java -version 2>&1 | head -n 1 || echo 'Not running')"
	@echo "Node (build):   $$(node --version 2>/dev/null || echo 'Not available')"
