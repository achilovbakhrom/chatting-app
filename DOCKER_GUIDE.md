# Docker Guide

Complete guide for running the Flexobo Chat application with Docker.

## Quick Start with Docker

### Prerequisites
- Docker Desktop installed (includes Docker and Docker Compose)
- That's it! No Node.js or MongoDB installation needed.

### Start Everything (3 commands)

```bash
# 1. Clone/navigate to project
cd /Users/bakhromachilov/flexobo/flexobo-chat-example

# 2. Create .env file for Docker
cp .env.docker .env
# Edit .env and add your OPENAI_API_KEY (optional)

# 3. Start all services
docker-compose up
```

**Access the application:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- Swagger Docs: http://localhost:3000/api
- MongoDB: localhost:27017

That's it! All services are running.

## Docker Compose Services

The `docker-compose.yml` defines three services:

### 1. MongoDB
- **Image:** mongo:7.0
- **Port:** 27017
- **Persistent storage:** Yes (Docker volumes)
- **Health check:** Automatic ping check

### 2. Backend (NestJS)
- **Build:** From `backend/Dockerfile.dev`
- **Port:** 3000
- **Hot reload:** Yes (source code mounted as volume)
- **Dependencies:** Waits for MongoDB to be healthy

### 3. Frontend (React)
- **Build:** From `frontend/Dockerfile.dev`
- **Port:** 5173
- **Hot reload:** Yes (source code mounted as volume)
- **Dependencies:** Waits for backend to start

## Environment Variables

Docker Compose uses `.env` file in the root directory.

Create it from the template:
```bash
cp .env.docker .env
```

Edit `.env`:
```env
# Required: Change this to a secure random string
JWT_SECRET=your-super-secret-jwt-key-change-this

# Optional: Add for translation feature
OPENAI_API_KEY=sk-your-openai-key-here
```

All other variables are configured in `docker-compose.yml`.

## Common Commands

### Development

```bash
# Start all services (logs in foreground)
docker-compose up

# Start all services (detached/background mode)
docker-compose up -d

# View logs
docker-compose logs

# Follow logs in real-time
docker-compose logs -f

# View logs for specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb

# Stop all services
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v
```

### Building

```bash
# Build all services
docker-compose build

# Build specific service
docker-compose build backend
docker-compose build frontend

# Force rebuild (no cache)
docker-compose build --no-cache

# Build and start
docker-compose up --build
```

### Service Management

```bash
# Start specific service
docker-compose up backend

# Restart specific service
docker-compose restart backend

# Stop specific service
docker-compose stop frontend

# Remove stopped containers
docker-compose rm
```

### Accessing Containers

```bash
# Execute command in backend container
docker-compose exec backend sh

# Execute command in frontend container
docker-compose exec frontend sh

# Access MongoDB shell
docker-compose exec mongodb mongosh

# Install npm package in backend
docker-compose exec backend npm install package-name

# Run backend tests
docker-compose exec backend npm test
```

### Cleanup

```bash
# Stop and remove containers
docker-compose down

# Stop, remove containers and volumes
docker-compose down -v

# Remove all unused Docker resources
docker system prune -a

# Remove specific volumes
docker volume rm flexobo-chat-example_mongodb_data
```

## Development Workflow

### 1. Initial Setup

```bash
# Create .env file
cp .env.docker .env

# Edit .env and add your credentials
nano .env

# Start services
docker-compose up
```

### 2. Making Code Changes

**Backend changes:**
- Edit files in `backend/src/`
- NestJS automatically reloads
- See changes immediately in logs

**Frontend changes:**
- Edit files in `frontend/src/`
- Vite HMR (Hot Module Replacement)
- Browser auto-refreshes

### 3. Installing Dependencies

**Backend:**
```bash
# Add to backend/package.json
docker-compose exec backend npm install package-name

# Or rebuild
docker-compose build backend
docker-compose up backend
```

**Frontend:**
```bash
# Add to frontend/package.json
docker-compose exec frontend npm install package-name

# Or rebuild
docker-compose build frontend
docker-compose up frontend
```

### 4. Debugging

**View all logs:**
```bash
docker-compose logs -f
```

**Debug backend:**
```bash
docker-compose logs -f backend
```

**Debug frontend:**
```bash
docker-compose logs -f frontend
```

**Access backend shell:**
```bash
docker-compose exec backend sh
# Now you can run commands inside container
npm run lint
npm test
```

## File Structure

```
.
├── docker-compose.yml          # Main Docker Compose config
├── .env.docker                 # Environment template
├── .env                        # Your environment (git-ignored)
│
├── backend/
│   ├── Dockerfile              # Production Dockerfile
│   ├── Dockerfile.dev          # Development Dockerfile
│   └── .dockerignore          # Files to ignore in Docker build
│
└── frontend/
    ├── Dockerfile              # Production Dockerfile
    ├── Dockerfile.dev          # Development Dockerfile
    ├── nginx.conf              # Nginx config for production
    └── .dockerignore          # Files to ignore in Docker build
```

## Docker Volumes

### Persistent Volumes (Data survives container restarts)

- `mongodb_data` - MongoDB database files
- `mongodb_config` - MongoDB configuration
- `backend_node_modules` - Backend dependencies
- `frontend_node_modules` - Frontend dependencies

### Bind Mounts (Live sync with local files)

- `./backend/src` → `/app/src` - Backend source code
- `./backend/uploads` → `/app/uploads` - Uploaded files
- `./frontend/src` → `/app/src` - Frontend source code
- `./frontend/public` → `/app/public` - Public assets

## Production Deployment

### Build Production Images

```bash
# Build production backend
docker build -t flexobo-backend:latest -f backend/Dockerfile ./backend

# Build production frontend
docker build -t flexobo-frontend:latest -f frontend/Dockerfile ./frontend
```

### Production Docker Compose

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:7.0
    restart: always
    volumes:
      - mongodb_data:/data/db
    networks:
      - flexobo-network

  backend:
    image: flexobo-backend:latest
    restart: always
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongodb:27017/flexobo-chat
      - JWT_SECRET=${JWT_SECRET}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    depends_on:
      - mongodb
    networks:
      - flexobo-network

  frontend:
    image: flexobo-frontend:latest
    restart: always
    ports:
      - "80:80"
    networks:
      - flexobo-network

volumes:
  mongodb_data:

networks:
  flexobo-network:
```

Run production:
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## Troubleshooting

### Port Already in Use

```
ERROR: for backend  Cannot start service backend: driver failed programming external connectivity on endpoint
```

**Solution:** Change port in `docker-compose.yml`:
```yaml
backend:
  ports:
    - "3001:3000"  # Use port 3001 instead
```

### MongoDB Not Starting

```bash
# Check MongoDB logs
docker-compose logs mongodb

# Remove MongoDB volume and restart
docker-compose down -v
docker-compose up mongodb
```

### Backend Can't Connect to MongoDB

**Check:**
1. MongoDB container is running: `docker-compose ps`
2. MongoDB is healthy: `docker-compose ps` (should show "healthy")
3. Connection string in docker-compose.yml uses `mongodb://mongodb:27017`

### Changes Not Reflected

**Backend:**
```bash
# Restart backend
docker-compose restart backend

# Or rebuild
docker-compose up --build backend
```

**Frontend:**
```bash
# Clear browser cache
# Or hard refresh (Cmd+Shift+R or Ctrl+Shift+R)

# Restart frontend
docker-compose restart frontend
```

### Out of Disk Space

```bash
# Remove unused containers, networks, images
docker system prune

# Remove volumes too (WARNING: deletes data)
docker system prune -a --volumes
```

### Build Fails

```bash
# Clean build
docker-compose down
docker-compose build --no-cache
docker-compose up
```

### Permission Errors

```bash
# Fix file permissions
sudo chown -R $USER:$USER .

# Or run with sudo (not recommended)
sudo docker-compose up
```

## Comparison: Docker vs Local

| Aspect | Docker | Local |
|--------|--------|-------|
| Setup Time | 5 minutes | 15-30 minutes |
| Prerequisites | Docker only | Node.js, MongoDB, etc. |
| Isolation | Complete | Shared with system |
| Consistency | Same everywhere | May vary by OS |
| Performance | Slight overhead | Native speed |
| Cleanup | `docker-compose down` | Manual uninstall |

## Best Practices

### Development

1. **Use volumes for node_modules:**
   - Keeps dependencies in Docker
   - Faster builds
   - Avoids OS-specific issues

2. **Bind mount source code:**
   - Live reload works
   - Edit locally, run in Docker
   - Best of both worlds

3. **Use health checks:**
   - Ensures services are ready
   - Prevents connection errors
   - Auto-restart on failure

### Production

1. **Multi-stage builds:**
   - Smaller images
   - Faster deployment
   - Better security

2. **Don't bind mount in production:**
   - Use COPY instead
   - Immutable containers
   - Predictable behavior

3. **Use secrets for sensitive data:**
   - Don't hardcode credentials
   - Use Docker secrets
   - Or external secret managers

## Monitoring

### View Resource Usage

```bash
# All containers
docker stats

# Specific container
docker stats flexobo-backend

# Once (no stream)
docker stats --no-stream
```

### View Container Details

```bash
# Inspect container
docker inspect flexobo-backend

# View container processes
docker-compose top

# View container ports
docker-compose port backend 3000
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Docker Build

on: [push]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Build images
        run: docker-compose build

      - name: Run tests
        run: docker-compose run backend npm test
```

## FAQ

**Q: Do I need to install Node.js?**
A: No, everything runs in Docker containers.

**Q: Can I use this for production?**
A: Yes, but use production Dockerfiles and proper secret management.

**Q: How do I update dependencies?**
A: Edit package.json and rebuild: `docker-compose build`

**Q: Where is the database stored?**
A: In Docker volume `mongodb_data`. Survives restarts.

**Q: How do I reset the database?**
A: `docker-compose down -v` (WARNING: deletes all data)

**Q: Can I mix Docker and local?**
A: Yes, you can run only MongoDB in Docker and the rest locally.

**Q: Is hot reload working?**
A: Yes, for both backend and frontend via bind mounts.

## Next Steps

1. ✅ Start with Docker: `docker-compose up`
2. ✅ Test backend: http://localhost:3000/api
3. ✅ Test frontend: http://localhost:5173
4. 🚧 Implement frontend components (see IMPLEMENTATION_GUIDE.md)
5. 🚧 Deploy to production

---

**Ready to develop with Docker!** All dependencies are containerized and managed for you.
