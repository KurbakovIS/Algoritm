.PHONY: help install install-dev test test-cov format lint clean start start-prod db-setup db-migrate db-init db-clear db-status

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install: ## Install production dependencies
	poetry install --only=main

install-dev: ## Install all dependencies including dev
	poetry install

test: ## Run tests
	poetry run pytest

test-cov: ## Run tests with coverage
	poetry run pytest --cov=app --cov-report=html --cov-report=term-missing

format: ## Format code with black and isort
	poetry run black app tests
	poetry run isort app tests

lint: ## Run linting with mypy and flake8
	poetry run mypy app
	poetry run flake8 app tests

clean: ## Clean up cache and temporary files
	find . -type f -name "*.pyc" -delete
	find . -type d -name "__pycache__" -delete
	find . -type d -name "*.egg-info" -exec rm -rf {} +
	rm -rf .pytest_cache
	rm -rf .coverage
	rm -rf htmlcov
	rm -rf dist
	rm -rf build

start: ## Start development server
	poetry run uvicorn app.main:app --reload

start-prod: ## Start production server
	poetry run uvicorn app.main:app --host 0.0.0.0 --port 8000

setup: install-dev ## Setup development environment
	poetry run pre-commit install

check: format lint test ## Run all checks (format, lint, test)

build: ## Build the package
	poetry build

publish: ## Publish to PyPI (requires authentication)
	poetry publish

# Database commands
db-setup: ## Setup PostgreSQL database with Docker
	docker-compose up -d db
	@echo "Waiting for database to be ready..."
	@sleep 10

db-migrate: ## Run database migrations
	poetry run alembic upgrade head

db-migrate-create: ## Create new migration (usage: make db-migrate-create MESSAGE="description")
	poetry run alembic revision --autogenerate -m "$(MESSAGE)"

db-init: ## Initialize database with data
	poetry run python -m app.cli init

db-clear: ## Clear all data from database
	poetry run python -m app.cli clear

db-status: ## Show database status
	poetry run python -m app.cli status

db-export: ## Export data to JSON files
	poetry run python -m app.cli export

# Development workflow
dev-setup: install-dev db-setup db-migrate db-init ## Complete development setup
	@echo "Development environment is ready!"

dev-reset: db-clear db-init ## Reset development database
	@echo "Development database reset complete!"
