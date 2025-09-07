# Gamified Roadmap Platform - Docker Management

.PHONY: help build up down logs clean dev prod test

# Default target
help: ## Show this help message
	@echo "Gamified Roadmap Platform - Docker Commands"
	@echo "=========================================="
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# Development commands
dev: ## Start development environment
	@echo "🚀 Starting development environment..."
	docker-compose -f docker-compose.dev.yml up -d --build
	@echo "✅ Development environment started!"
	@echo "📱 Frontend: http://localhost:5173"
	@echo "🔧 Backend: http://localhost:8000"
	@echo "🗄️  Database: localhost:5432"

dev-logs: ## Show development logs
	docker-compose -f docker-compose.dev.yml logs -f

dev-down: ## Stop development environment
	docker-compose -f docker-compose.dev.yml down

# Production commands
prod: ## Start production environment
	@echo "🚀 Starting production environment..."
	docker-compose up -d --build
	@echo "✅ Production environment started!"
	@echo "🌐 Application: http://localhost"
	@echo "🔧 Backend API: http://localhost:8000"

prod-logs: ## Show production logs
	docker-compose logs -f

prod-down: ## Stop production environment
	docker-compose down

# Build commands
build: ## Build all images
	@echo "🔨 Building all images..."
	docker-compose build

build-backend: ## Build backend image only
	@echo "🔨 Building backend image..."
	docker-compose build backend

build-frontend: ## Build frontend image only
	@echo "🔨 Building frontend image..."
	docker-compose build frontend

# Database commands
db-reset: ## Reset database (WARNING: This will delete all data!)
	@echo "⚠️  Resetting database..."
	docker-compose down -v
	docker-compose up -d db
	@echo "✅ Database reset complete!"

db-backup: ## Backup database
	@echo "💾 Creating database backup..."
	docker-compose exec db pg_dump -U postgres roadmap > backup_$(shell date +%Y%m%d_%H%M%S).sql
	@echo "✅ Database backup created!"

# Utility commands
logs: ## Show all logs
	docker-compose logs -f

logs-backend: ## Show backend logs
	docker-compose logs -f backend

logs-frontend: ## Show frontend logs
	docker-compose logs -f frontend

logs-db: ## Show database logs
	docker-compose logs -f db

# Cleanup commands
clean: ## Clean up containers, networks, and volumes
	@echo "🧹 Cleaning up Docker resources..."
	docker-compose down -v --remove-orphans
	docker system prune -f
	@echo "✅ Cleanup complete!"

clean-images: ## Remove all project images
	@echo "🧹 Removing project images..."
	docker-compose down --rmi all
	@echo "✅ Images removed!"

# Health checks
health: ## Check health of all services
	@echo "🏥 Checking service health..."
	@docker-compose ps
	@echo ""
	@echo "🔍 Health check results:"
	@curl -s http://localhost/health || echo "❌ Frontend not responding"
	@curl -s http://localhost:8000/ | jq . || echo "❌ Backend not responding"

# Testing
test: ## Run tests
	@echo "🧪 Running tests..."
	docker-compose exec backend poetry run pytest
	@echo "✅ Tests completed!"

# Quick start
start: dev ## Quick start (alias for dev)

stop: dev-down ## Quick stop (alias for dev-down)

restart: dev-down dev ## Restart development environment

# Status
status: ## Show status of all services
	@echo "📊 Service Status:"
	@docker-compose ps
	@echo ""
	@echo "💾 Volume Usage:"
	@docker system df
