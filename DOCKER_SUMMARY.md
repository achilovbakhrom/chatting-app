# Docker Setup Summary

## What Was Added

Complete Docker support for local development and production deployment.

## Files Created

### Docker Configuration

1. **`docker-compose.yml`** - Main Docker Compose configuration
   - MongoDB service (with health check)
   - Backend service (NestJS with hot reload)
   - Frontend service (Vite with HMR)
   - Persistent volumes for data
   - Bind mounts for live code sync

2. **`.env.docker`** - Environment template for Docker
   - JWT_SECRET placeholder
   - OPENAI_API_KEY placeholder
   - Instructions to copy to `.env`

### Backend Docker Files

3. **`backend/Dockerfile.dev`** - Development Dockerfile
   - Node.js 20 Alpine
   - Hot reload support
   - Source code mounted as volume

4. **`backend/Dockerfile`** - Production Dockerfile
   - Multi-stage build
   - Optimized image size
   - Non-root user for security
   - Only production dependencies

5. **`backend/.dockerignore`** - Files to exclude from Docker build
   - node_modules
   - dist
   - .env files
   - Development files

### Frontend Docker Files

6. **`frontend/Dockerfile.dev`** - Development Dockerfile
   - Node.js 20 Alpine
   - Vite dev server
   - HMR support

7. **`frontend/Dockerfile`** - Production Dockerfile
   - Multi-stage build
   - Nginx to serve static files
   - Optimized for production

8. **`frontend/nginx.conf`** - Nginx configuration
   - React Router support
   - Gzip compression
   - Static asset caching
   - Security headers

9. **`frontend/.dockerignore`** - Files to exclude from Docker build

### Convenience Files

10. **`Makefile`** - Convenient shortcuts
    - `make up` - Start services
    - `make down` - Stop services
    - `make logs` - View logs
    - `make clean` - Clean everything
    - 20+ commands for common tasks

### Documentation

11. **`DOCKER_GUIDE.md`** - Complete Docker guide
    - Quick start
    - All commands explained
    - Development workflow
    - Production deployment
    - Troubleshooting
    - Best practices

12. **`DOCKER_QUICK_REFERENCE.md`** - One-page cheat sheet
    - Essential commands
    - Quick troubleshooting
    - Common workflows

13. **`DOCKER_SUMMARY.md`** - This file

### Updated Files

14. **`README.md`** - Added Docker as recommended option
15. **`.gitignore`** - Added `.env` to ignore list

## Features

### Development Mode

✅ **Hot Reload**
- Backend: NestJS watch mode
- Frontend: Vite HMR
- Changes reflected immediately

✅ **Live Code Sync**
- Source code bind mounted
- Edit locally, run in Docker
- No rebuild needed for code changes

✅ **Persistent Data**
- MongoDB data in volumes
- Survives container restarts
- Uploaded files preserved

✅ **Health Checks**
- MongoDB health check
- Backend waits for healthy MongoDB
- No connection errors on startup

### Production Mode

✅ **Optimized Images**
- Multi-stage builds
- Smaller image sizes
- Only production dependencies

✅ **Security**
- Non-root user in containers
- Nginx security headers
- No sensitive data in images

✅ **Performance**
- Gzip compression
- Static asset caching
- Optimized Nginx config

## Architecture

```
┌─────────────────────────────────────────┐
│           Docker Compose                │
├─────────────────────────────────────────┤
│                                         │
│  ┌──────────┐  ┌──────────┐  ┌───────┐│
│  │ MongoDB  │  │ Backend  │  │ Front │││
│  │  :27017  │  │  :3000   │  │ :5173 │││
│  └────┬─────┘  └────┬─────┘  └───┬───┘│
│       │             │             │    │
│       └─────────────┴─────────────┘    │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │        Shared Network           │   │
│  │      (flexobo-network)          │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │       Persistent Volumes        │   │
│  │  • mongodb_data                 │   │
│  │  • backend_node_modules         │   │
│  │  • frontend_node_modules        │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │        Bind Mounts              │   │
│  │  • ./backend/src → /app/src     │   │
│  │  • ./frontend/src → /app/src    │   │
│  │  • ./backend/uploads → /uploads │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

## Usage Examples

### Development

```bash
# Quick start
cp .env.docker .env
docker-compose up

# With Makefile
make init  # Creates .env and starts services
```

### Logs

```bash
# All logs
docker-compose logs -f

# Specific service
docker-compose logs -f backend

# With Makefile
make logs
make logs-backend
```

### Restart Services

```bash
# Restart backend after env change
docker-compose restart backend

# With Makefile
make restart-backend
```

### Access Containers

```bash
# Backend shell
docker-compose exec backend sh

# MongoDB shell
docker-compose exec mongodb mongosh

# With Makefile
make shell-backend
make shell-mongodb
```

### Install Dependencies

```bash
# Edit package.json, then:
docker-compose exec backend npm install

# Or rebuild
docker-compose build backend
docker-compose up backend
```

### Clean Up

```bash
# Stop and remove volumes
docker-compose down -v

# Clean everything
docker system prune -a --volumes

# With Makefile
make clean
```

## Advantages

### vs Local Installation

| Aspect | Docker | Local |
|--------|--------|-------|
| Setup | 2 commands | 10+ steps |
| Prerequisites | Docker only | Node.js, MongoDB, etc. |
| Consistency | Same everywhere | Varies by OS |
| Isolation | Complete | Shared with system |
| Cleanup | 1 command | Manual uninstall |

### Key Benefits

1. **No Installation Required**
   - Don't need Node.js
   - Don't need MongoDB
   - Just Docker Desktop

2. **Consistent Environment**
   - Same on Mac, Windows, Linux
   - Same for all developers
   - Matches production

3. **Easy Cleanup**
   - `docker-compose down -v`
   - Everything removed
   - No leftovers

4. **Isolated**
   - Doesn't affect system
   - Multiple versions possible
   - Safe to experiment

5. **Production Ready**
   - Same containers in production
   - Test deployment locally
   - No surprises

## Volumes Explained

### Persistent Volumes

**Purpose:** Store data that survives container restarts

```yaml
volumes:
  mongodb_data:        # Database files
  backend_node_modules:   # Backend dependencies
  frontend_node_modules:  # Frontend dependencies
```

**Why separate node_modules?**
- Faster builds
- Avoid OS-specific issues
- Keeps dependencies in Docker

### Bind Mounts

**Purpose:** Live sync code changes

```yaml
volumes:
  - ./backend/src:/app/src      # Live backend code
  - ./frontend/src:/app/src     # Live frontend code
  - ./backend/uploads:/uploads  # Persistent uploads
```

**Why bind mount source code?**
- Edit locally with your IDE
- Changes sync to container
- Hot reload works
- Best development experience

## Port Mapping

```yaml
ports:
  - "3000:3000"  # Backend: host:container
  - "5173:5173"  # Frontend
  - "27017:27017" # MongoDB
```

Access from host:
- http://localhost:3000 → Backend
- http://localhost:5173 → Frontend
- mongodb://localhost:27017 → MongoDB

## Network

All services in same network:
- Services can talk to each other
- Use service name as hostname
- Example: `mongodb://mongodb:27017`

## Health Checks

MongoDB health check:
```yaml
healthcheck:
  test: mongosh --eval "db.runCommand('ping')"
  interval: 10s
  timeout: 5s
  retries: 5
```

Backend waits for healthy MongoDB:
```yaml
depends_on:
  mongodb:
    condition: service_healthy
```

No more connection errors on startup!

## Environment Variables

### In docker-compose.yml
```yaml
environment:
  - MONGODB_URI=mongodb://mongodb:27017/flexobo-chat
  - PORT=3000
```

### From .env file
```yaml
environment:
  - JWT_SECRET=${JWT_SECRET}
  - OPENAI_API_KEY=${OPENAI_API_KEY}
```

### Best Practice
- Hardcode defaults in docker-compose.yml
- Override secrets via .env file
- Don't commit .env (in .gitignore)

## Production Deployment

### Build Production Images

```bash
docker build -t flexobo-backend:latest -f backend/Dockerfile ./backend
docker build -t flexobo-frontend:latest -f frontend/Dockerfile ./frontend
```

### Push to Registry

```bash
docker tag flexobo-backend:latest registry.example.com/flexobo-backend:latest
docker push registry.example.com/flexobo-backend:latest

docker tag flexobo-frontend:latest registry.example.com/flexobo-frontend:latest
docker push registry.example.com/flexobo-frontend:latest
```

### Deploy

```bash
# On production server
docker-compose -f docker-compose.prod.yml up -d
```

## Monitoring

```bash
# Resource usage
docker stats

# Container status
docker-compose ps

# Logs
docker-compose logs -f

# Processes
docker-compose top
```

## Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   lsof -ti:3000 | xargs kill -9
   # Or change port in docker-compose.yml
   ```

2. **Changes not reflected**
   ```bash
   docker-compose restart service-name
   # Or rebuild
   docker-compose up --build
   ```

3. **MongoDB won't start**
   ```bash
   docker-compose down -v
   docker-compose up mongodb
   ```

4. **Out of disk space**
   ```bash
   docker system prune -a --volumes
   ```

5. **Build fails**
   ```bash
   docker-compose build --no-cache
   ```

## Next Steps

1. ✅ Docker setup complete
2. ✅ Start services: `docker-compose up`
3. ✅ Access Swagger: http://localhost:3000/api
4. 🚧 Implement frontend (see IMPLEMENTATION_GUIDE.md)
5. 🚧 Deploy to production

## Resources

- **[DOCKER_GUIDE.md](./DOCKER_GUIDE.md)** - Complete guide
- **[DOCKER_QUICK_REFERENCE.md](./DOCKER_QUICK_REFERENCE.md)** - Cheat sheet
- **[Makefile](./Makefile)** - Command shortcuts
- **[docker-compose.yml](./docker-compose.yml)** - Main config

## Conclusion

Docker setup provides:
- ✅ Easiest way to get started
- ✅ Consistent development environment
- ✅ Production-ready containers
- ✅ Complete isolation
- ✅ Simple cleanup

**Recommended for all developers!**

---

**Quick Start:** `cp .env.docker .env && docker-compose up`
