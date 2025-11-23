# Walk Buddies - Docker Deployment Guide (Beginner)

A complete guide to deploying Walk Buddies using Docker, written for first-time Docker users.

---

## What is Docker?

Docker packages your app and everything it needs (code, libraries, settings) into a "container" that runs the same way on any computer. Think of it like shipping your app in a standardized box.

---

## Step 1: Install Docker

### On Mac
```bash
# Option 1: Download Docker Desktop
# Go to https://docker.com/products/docker-desktop
# Download and install the .dmg file

# Option 2: Using Homebrew
brew install --cask docker
```

### On Windows
1. Download Docker Desktop from https://docker.com/products/docker-desktop
2. Run the installer
3. Enable WSL 2 when prompted
4. Restart your computer

### On Linux (Ubuntu/Debian)
```bash
# Update package index
sudo apt-get update

# Install prerequisites
sudo apt-get install -y apt-transport-https ca-certificates curl software-properties-common

# Add Docker's GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Add Docker repository
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Add your user to docker group (so you don't need sudo)
sudo usermod -aG docker $USER

# Log out and back in, then verify
docker --version
```

### Verify Installation
```bash
docker --version
# Should show: Docker version 24.x.x or similar

docker run hello-world
# Should download and run a test container
```

---

## Step 2: Project Structure

Create this folder structure for Walk Buddies:

```
walk-buddies/
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   ├── src/
│   │   └── index.js
│   └── .env.example
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   └── src/
├── docker-compose.yml
├── .env
└── README.md
```

---

## Step 3: Create Dockerfiles

### Backend Dockerfile (`backend/Dockerfile`)

```dockerfile
# Use Node.js base image
FROM node:20-alpine

# Set working directory inside container
WORKDIR /app

# Copy package files first (for better caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the code
COPY . .

# Expose port 3000
EXPOSE 3000

# Command to run the app
CMD ["npm", "start"]
```

### Frontend Dockerfile (`frontend/Dockerfile`)

```dockerfile
# Build stage
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files to nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx config (optional)
# COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

---

## Step 4: Create Docker Compose File

### `docker-compose.yml`

```yaml
version: '3.8'

services:
  # Backend API
  backend:
    build: ./backend
    container_name: walkbuddies-api
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - database
    restart: unless-stopped

  # Frontend
  frontend:
    build: ./frontend
    container_name: walkbuddies-web
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: unless-stopped

  # Database
  database:
    image: postgres:15-alpine
    container_name: walkbuddies-db
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_USER=${DB_USER}
      - POSTGRES_PASSWORD=${DB_PASSWORD}
      - POSTGRES_DB=${DB_NAME}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  # Redis (for caching/sessions)
  redis:
    image: redis:7-alpine
    container_name: walkbuddies-redis
    ports:
      - "6379:6379"
    restart: unless-stopped

volumes:
  postgres_data:
```

---

## Step 5: Create Environment File

### `.env`

```bash
# Database
DB_USER=walkbuddies
DB_PASSWORD=your_secure_password_here
DB_NAME=walkbuddies_db
DATABASE_URL=postgresql://walkbuddies:your_secure_password_here@database:5432/walkbuddies_db

# Security
JWT_SECRET=your_jwt_secret_key_here_make_it_long

# App
NODE_ENV=production
API_URL=http://localhost:3000
```

**Important:** Never commit `.env` to git! Add it to `.gitignore`

---

## Step 6: Build and Run

### First Time Setup

```bash
# Navigate to project folder
cd walk-buddies

# Build all containers
docker compose build

# Start all services
docker compose up
```

### Run in Background (Detached Mode)

```bash
docker compose up -d
```

### View Running Containers

```bash
docker compose ps
```

Output:
```
NAME                  STATUS          PORTS
walkbuddies-api       Up 2 minutes    0.0.0.0:3000->3000/tcp
walkbuddies-web       Up 2 minutes    0.0.0.0:80->80/tcp
walkbuddies-db        Up 2 minutes    0.0.0.0:5432->5432/tcp
walkbuddies-redis     Up 2 minutes    0.0.0.0:6379->6379/tcp
```

### View Logs

```bash
# All services
docker compose logs

# Specific service
docker compose logs backend

# Follow logs (live)
docker compose logs -f backend
```

---

## Step 7: Common Docker Commands

### Start/Stop

```bash
# Start services
docker compose up -d

# Stop services
docker compose down

# Stop and remove volumes (deletes database!)
docker compose down -v

# Restart a service
docker compose restart backend
```

### Rebuild After Code Changes

```bash
# Rebuild specific service
docker compose build backend

# Rebuild and restart
docker compose up -d --build
```

### Access Container Shell

```bash
# Enter backend container
docker compose exec backend sh

# Run command in container
docker compose exec backend npm run migrate
```

### Check Resource Usage

```bash
docker stats
```

---

## Step 8: Database Management

### Run Migrations

```bash
docker compose exec backend npm run migrate
```

### Access Database Directly

```bash
# Connect to PostgreSQL
docker compose exec database psql -U walkbuddies -d walkbuddies_db

# Run SQL
\dt  # List tables
\q   # Quit
```

### Backup Database

```bash
# Create backup
docker compose exec database pg_dump -U walkbuddies walkbuddies_db > backup.sql

# Restore backup
docker compose exec -T database psql -U walkbuddies walkbuddies_db < backup.sql
```

---

## Step 9: Deploy to Production

### Option A: DigitalOcean Droplet ($6-12/month)

```bash
# 1. Create droplet with Docker pre-installed
# 2. SSH into server
ssh root@your-server-ip

# 3. Clone your repo
git clone https://github.com/yourusername/walk-buddies.git
cd walk-buddies

# 4. Create .env file
nano .env
# Paste your production environment variables

# 5. Build and run
docker compose up -d

# 6. Set up SSL with Let's Encrypt (optional but recommended)
```

### Option B: Railway (Easy, $5-20/month)

1. Go to https://railway.app
2. Connect GitHub repo
3. Railway auto-detects Docker
4. Add environment variables
5. Deploy

### Option C: AWS ECS / Google Cloud Run

More complex but scalable. Use for 10K+ users.

---

## Step 10: Add SSL/HTTPS

### Using Nginx + Let's Encrypt

Create `nginx/nginx.conf`:

```nginx
server {
    listen 80;
    server_name walkbuddies.app;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name walkbuddies.app;

    ssl_certificate /etc/letsencrypt/live/walkbuddies.app/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/walkbuddies.app/privkey.pem;

    location / {
        proxy_pass http://frontend:80;
    }

    location /api {
        proxy_pass http://backend:3000;
    }
}
```

Add to `docker-compose.yml`:

```yaml
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/conf.d/default.conf
      - /etc/letsencrypt:/etc/letsencrypt
    depends_on:
      - frontend
      - backend
```

---

## Troubleshooting

### Container Won't Start

```bash
# Check logs
docker compose logs backend

# Common issues:
# - Port already in use: Change port in docker-compose.yml
# - Missing env vars: Check .env file
# - Build error: Run docker compose build --no-cache
```

### Database Connection Error

```bash
# Ensure database is running
docker compose ps database

# Check database logs
docker compose logs database

# Verify connection string in .env
```

### Out of Disk Space

```bash
# Remove unused images/containers
docker system prune -a

# Remove unused volumes (careful!)
docker volume prune
```

### Permission Denied

```bash
# Add user to docker group
sudo usermod -aG docker $USER
# Log out and back in
```

---

## Quick Reference

| Task | Command |
|------|---------|
| Build | `docker compose build` |
| Start | `docker compose up -d` |
| Stop | `docker compose down` |
| Logs | `docker compose logs -f` |
| Restart | `docker compose restart` |
| Rebuild | `docker compose up -d --build` |
| Shell | `docker compose exec backend sh` |
| Status | `docker compose ps` |

---

## Checklist Before Launch

- [ ] All Dockerfiles created
- [ ] docker-compose.yml configured
- [ ] .env file with production values
- [ ] .env added to .gitignore
- [ ] Database migrations run
- [ ] SSL certificate installed
- [ ] Domain DNS configured
- [ ] Backups scheduled
- [ ] Monitoring set up

---

## Cost Estimate (Production)

| Service | Provider | Cost/Month |
|---------|----------|------------|
| Server | DigitalOcean | $12 |
| Database | Included | $0 |
| Domain | Namecheap | $1 |
| SSL | Let's Encrypt | $0 |
| **Total** | | **$13/month** |

Scale up as needed when you get more users.

---

**Document Version:** 1.0
**Last Updated:** November 2025
