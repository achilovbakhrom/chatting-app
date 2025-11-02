.PHONY: help up down build logs clean test

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

up: ## Start all services
	docker-compose up

up-d: ## Start all services in detached mode
	docker-compose up -d

down: ## Stop all services
	docker-compose down

down-v: ## Stop all services and remove volumes
	docker-compose down -v

build: ## Build all services
	docker-compose build

build-nc: ## Build all services without cache
	docker-compose build --no-cache

logs: ## View logs from all services
	docker-compose logs -f

logs-backend: ## View backend logs
	docker-compose logs -f backend

logs-frontend: ## View frontend logs
	docker-compose logs -f frontend

logs-mongodb: ## View MongoDB logs
	docker-compose logs -f mongodb

restart: ## Restart all services
	docker-compose restart

restart-backend: ## Restart backend service
	docker-compose restart backend

restart-frontend: ## Restart frontend service
	docker-compose restart frontend

shell-backend: ## Open shell in backend container
	docker-compose exec backend sh

shell-frontend: ## Open shell in frontend container
	docker-compose exec frontend sh

shell-mongodb: ## Open MongoDB shell
	docker-compose exec mongodb mongosh

ps: ## Show running containers
	docker-compose ps

stats: ## Show container resource usage
	docker stats

clean: ## Remove all containers, networks, and volumes
	docker-compose down -v
	docker system prune -f

install-backend: ## Install backend dependencies
	docker-compose exec backend npm install

install-frontend: ## Install frontend dependencies
	docker-compose exec frontend npm install

test-backend: ## Run backend tests
	docker-compose exec backend npm test

lint-backend: ## Lint backend code
	docker-compose exec backend npm run lint

lint-frontend: ## Lint frontend code
	docker-compose exec frontend npm run lint

dev: ## Start services in development mode (default)
	docker-compose up

prod: ## Build and start services in production mode
	docker-compose -f docker-compose.prod.yml up -d

prod-build: ## Build production images
	docker build -t flexobo-backend:latest -f backend/Dockerfile ./backend
	docker build -t flexobo-frontend:latest -f frontend/Dockerfile ./frontend

init: ## Initialize project (create .env and start services)
	@if [ ! -f .env ]; then \
		cp .env.docker .env; \
		echo "Created .env file. Please edit it and add your credentials."; \
	fi
	docker-compose up
