# Docker Quick Reference

One-page cheat sheet for Docker commands.

## 🚀 Quick Start

```bash
# 1. Setup
cp .env.docker .env        # Create environment file
# Edit .env and add your OPENAI_API_KEY

# 2. Start
docker-compose up          # Start all services
# or
make up                    # Using Makefile
```

**Access:**
- Frontend: http://localhost:5173
- Backend: http://localhost:3000
- Swagger: http://localhost:3000/api

## 📦 Essential Commands

### Start/Stop

```bash
docker-compose up              # Start (logs in foreground)
docker-compose up -d           # Start detached (background)
docker-compose down            # Stop all services
docker-compose down -v         # Stop and remove volumes
```

### Logs

```bash
docker-compose logs            # All logs
docker-compose logs -f         # Follow logs
docker-compose logs backend    # Backend logs only
docker-compose logs -f backend # Follow backend logs
```

### Build

```bash
docker-compose build           # Build all
docker-compose build backend   # Build backend only
docker-compose build --no-cache # Build without cache
docker-compose up --build      # Build and start
```

### Restart

```bash
docker-compose restart         # Restart all
docker-compose restart backend # Restart backend only
docker-compose stop backend    # Stop backend only
docker-compose start backend   # Start backend only
```

## 🔧 Development Commands

### Access Containers

```bash
docker-compose exec backend sh     # Backend shell
docker-compose exec frontend sh    # Frontend shell
docker-compose exec mongodb mongosh # MongoDB shell
```

### Install Dependencies

```bash
# Backend
docker-compose exec backend npm install package-name

# Frontend
docker-compose exec frontend npm install package-name
```

### Run Commands in Container

```bash
# Backend
docker-compose exec backend npm test
docker-compose exec backend npm run lint

# Frontend
docker-compose exec frontend npm run build
docker-compose exec frontend npm run lint
```

## 📊 Monitoring

```bash
docker-compose ps              # List containers
docker stats                   # Resource usage
docker-compose top             # Container processes
docker system df               # Disk usage
```

## 🧹 Cleanup

```bash
docker-compose down -v         # Stop and remove volumes
docker system prune            # Remove unused resources
docker system prune -a         # Remove ALL unused resources
docker volume prune            # Remove unused volumes
```

## 🛠️ Makefile Commands

If you prefer, use the Makefile for shorter commands:

```bash
make help          # Show all commands
make up            # Start all services
make down          # Stop all services
make logs          # View all logs
make logs-backend  # View backend logs
make clean         # Clean everything
make init          # Initialize project
```

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Kill process on port
lsof -ti:3000 | xargs kill -9

# Or change port in docker-compose.yml
ports:
  - "3001:3000"  # Use 3001 instead
```

### MongoDB Issues

```bash
# View MongoDB logs
docker-compose logs mongodb

# Restart MongoDB
docker-compose restart mongodb

# Reset MongoDB (deletes data!)
docker-compose down -v
docker-compose up mongodb
```

### Changes Not Reflected

```bash
# Backend
docker-compose restart backend

# Frontend (also clear browser cache)
docker-compose restart frontend

# Or rebuild
docker-compose up --build
```

### Container Won't Start

```bash
# View logs
docker-compose logs service-name

# Remove and recreate
docker-compose down
docker-compose up --build
```

### Out of Space

```bash
# Clean everything
docker system prune -a --volumes

# Check disk usage
docker system df
```

## 📁 File Locations

### Volumes (Persistent Data)

```bash
# List volumes
docker volume ls

# Inspect volume
docker volume inspect flexobo-chat-example_mongodb_data

# Remove volume (deletes data!)
docker volume rm flexobo-chat-example_mongodb_data
```

### Bind Mounts (Live Sync)

- `./backend/src` → Container `/app/src`
- `./frontend/src` → Container `/app/src`
- `./backend/uploads` → Container `/app/uploads`

## 🔄 Development Workflow

```bash
# 1. Start services
docker-compose up

# 2. Edit code locally
# Changes are automatically synced and reloaded

# 3. View logs
docker-compose logs -f backend

# 4. Test changes in browser
# http://localhost:5173

# 5. Stop when done
docker-compose down
```

## 🌐 Environment Variables

```bash
# .env file (root directory)
JWT_SECRET=your-secret-key
OPENAI_API_KEY=your-key

# View container environment
docker-compose exec backend env
```

## 📦 Production

```bash
# Build production images
docker build -t flexobo-backend:latest -f backend/Dockerfile ./backend
docker build -t flexobo-frontend:latest -f frontend/Dockerfile ./frontend

# Run production
docker-compose -f docker-compose.prod.yml up -d
```

## 🆘 Common Issues

| Issue | Solution |
|-------|----------|
| Port in use | Change port or kill process |
| MongoDB won't start | `docker-compose down -v && docker-compose up` |
| Changes not reflected | `docker-compose restart service-name` |
| Out of space | `docker system prune -a` |
| Permission denied | `sudo chown -R $USER:$USER .` |
| Build fails | `docker-compose build --no-cache` |

## 📚 Related Docs

- **[DOCKER_GUIDE.md](./DOCKER_GUIDE.md)** - Complete Docker guide
- **[README.md](./README.md)** - Project overview
- **[SETUP.md](./SETUP.md)** - Local setup without Docker

## 💡 Pro Tips

1. **Use `-d` for background:**
   ```bash
   docker-compose up -d  # Runs in background
   ```

2. **View specific service logs:**
   ```bash
   docker-compose logs -f backend  # Backend only
   ```

3. **Rebuild after dependency changes:**
   ```bash
   docker-compose up --build
   ```

4. **Clean slate:**
   ```bash
   docker-compose down -v  # Removes everything
   ```

5. **Check what's running:**
   ```bash
   docker-compose ps
   ```

---

**Quick Help:** `make help` or see [DOCKER_GUIDE.md](./DOCKER_GUIDE.md)
