# Docker Setup - Quick Guide

Get the Flexobo Chat application running in Docker in just 2 commands!

## Prerequisites

- **Docker Desktop** installed ([Download here](https://www.docker.com/products/docker-desktop))
- That's it! No Node.js or MongoDB needed.

## Quick Start (2 Commands)

```bash
# 1. Create environment file
cp .env.docker .env

# 2. Start everything
docker-compose up
```

**Done!** The application is now running:

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3000
- **API Docs (Swagger):** http://localhost:3000/api
- **MongoDB:** localhost:27017

## What Just Happened?

Docker Compose started 3 services:

1. **MongoDB** - Database (port 27017)
2. **Backend** - NestJS API (port 3000)
3. **Frontend** - React app (port 5173)

All services are connected and ready to use!

## First Time Setup

### 1. Configure Environment

Edit the `.env` file you just created:

```env
# Required: Change this to a secure random string
JWT_SECRET=PUT-YOUR-SECRET-HERE-MAKE-IT-LONG-AND-RANDOM

# Optional: Add for AI translation feature
OPENAI_API_KEY=sk-your-openai-key-here
```

### 2. Restart Services

```bash
# Stop with Ctrl+C, then restart:
docker-compose up
```

## Using the Application

### Test the Backend

Visit **http://localhost:3000/api** for Swagger UI where you can:

1. **Register a user** → `POST /auth/register`
2. **Login** → `POST /auth/login`
3. **Copy the access_token**
4. **Click "Authorize"** → Enter `Bearer YOUR_TOKEN`
5. **Try any endpoint!**

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb
```

### Stop Services

```bash
# Stop (Ctrl+C) or:
docker-compose down

# Stop and remove all data:
docker-compose down -v
```

## Common Commands

### Start/Stop

```bash
docker-compose up              # Start (foreground)
docker-compose up -d           # Start (background)
docker-compose down            # Stop
docker-compose restart         # Restart all
docker-compose restart backend # Restart backend only
```

### Logs

```bash
docker-compose logs            # View logs
docker-compose logs -f         # Follow logs (real-time)
docker-compose logs backend    # Backend logs only
```

### Development

```bash
# Access backend shell
docker-compose exec backend sh

# Access MongoDB shell
docker-compose exec mongodb mongosh

# Install npm package in backend
docker-compose exec backend npm install package-name

# Run backend tests
docker-compose exec backend npm test
```

### Cleanup

```bash
docker-compose down            # Stop containers
docker-compose down -v         # Stop and remove volumes (deletes data!)
docker system prune            # Clean unused Docker resources
```

## Using Make Commands

For convenience, you can use the Makefile:

```bash
make help          # Show all commands
make up            # Start services
make down          # Stop services
make logs          # View all logs
make logs-backend  # View backend logs
make clean         # Clean everything
```

See all available commands:
```bash
make help
```

## Development Workflow

### 1. Start Services

```bash
docker-compose up
```

### 2. Edit Code

Edit files in your IDE:
- `backend/src/` - Backend code
- `frontend/src/` - Frontend code

Changes are automatically synced and reloaded!

### 3. View Changes

- Backend: Check terminal logs
- Frontend: Browser auto-refreshes

### 4. Stop Services

```bash
# Ctrl+C or:
docker-compose down
```

## Hot Reload

Both backend and frontend support hot reload:

- **Backend:** NestJS watch mode - saves trigger rebuild
- **Frontend:** Vite HMR - instant updates in browser

Edit code locally → Changes appear immediately in Docker!

## Troubleshooting

### Port Already in Use

```
Error: port is already allocated
```

**Solution:** Change port in `docker-compose.yml`:
```yaml
backend:
  ports:
    - "3001:3000"  # Use 3001 instead of 3000
```

### MongoDB Won't Start

```bash
# View MongoDB logs
docker-compose logs mongodb

# Reset MongoDB (WARNING: deletes data)
docker-compose down -v
docker-compose up mongodb
```

### Changes Not Reflected

```bash
# Restart service
docker-compose restart backend

# Or rebuild
docker-compose up --build
```

### Out of Disk Space

```bash
# Clean unused Docker resources
docker system prune -a --volumes
```

## What's Inside?

### Services

- **MongoDB 7.0** - Database
- **Backend** - NestJS (Node.js 20 Alpine)
- **Frontend** - React + Vite (Node.js 20 Alpine)

### Volumes (Persistent Data)

- `mongodb_data` - Database files
- `backend_node_modules` - Backend dependencies
- `frontend_node_modules` - Frontend dependencies
- `./backend/uploads` - Uploaded files

### Network

All services connected via `flexobo-network`:
- Services can talk to each other
- Use service name as hostname
- Example: `mongodb://mongodb:27017`

## Production

For production deployment, see:
- **[DOCKER_GUIDE.md](./DOCKER_GUIDE.md)** - Complete guide
- Production Dockerfiles are included
- Multi-stage builds for optimization

Build production images:
```bash
docker build -t flexobo-backend:latest -f backend/Dockerfile ./backend
docker build -t flexobo-frontend:latest -f frontend/Dockerfile ./frontend
```

## More Documentation

- **[DOCKER_GUIDE.md](./DOCKER_GUIDE.md)** - Complete Docker guide
- **[DOCKER_QUICK_REFERENCE.md](./DOCKER_QUICK_REFERENCE.md)** - Cheat sheet
- **[SETUP.md](./SETUP.md)** - Local setup (without Docker)
- **[README.md](./README.md)** - Project overview

## Need Help?

1. Check logs: `docker-compose logs`
2. Restart services: `docker-compose restart`
3. See full guide: [DOCKER_GUIDE.md](./DOCKER_GUIDE.md)
4. Clean slate: `docker-compose down -v && docker-compose up`

## Advantages of Docker

✅ No Node.js installation needed
✅ No MongoDB installation needed
✅ Consistent environment everywhere
✅ Easy cleanup (`docker-compose down`)
✅ Isolated from system
✅ Production-ready containers
✅ Same on Mac, Windows, Linux

---

**Ready to start!**

```bash
cp .env.docker .env
docker-compose up
```

Then visit **http://localhost:3000/api** 🚀
