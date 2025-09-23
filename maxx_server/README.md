# Maxx API Server - One-Script Deployment

A production-ready Node.js API server with Docker, Nginx reverse proxy, and single-script deployment.

## Architecture

```
Internet → Nginx (Port 80) → Node.js API (Port 3000)
```

**Features:**
- Docker Compose v2 with health checks
- Nginx reverse proxy with CORS & rate limiting
- Firebase authentication & Gemini AI integration
- Built-in monitoring and logging
- Security hardening & firewall

---

## One-Script Deployment

### **Local Development**

```bash
# 1. Setup everything (dependencies, Docker, configs)
./deploy.sh setup

# 2. Logout/login for Docker group, then deploy
exit && ssh back-in
nano .env  # Add your credentials
./deploy.sh deploy
```

### **GCP Production Deployment**

```bash
# Create GCP VM
gcloud compute instances create maxx-api-server \
    --zone=us-central1-a \
    --machine-type=e2-standard-2 \
    --image=projects/ubuntu-os-cloud/global/images/ubuntu-2204-jammy-v20240319 \
    --tags=http-server

gcloud compute firewall-rules create allow-http --allow tcp:80 --target-tags http-server

# Connect and deploy
gcloud compute ssh maxx-api-server --zone=us-central1-a
git clone your-repo.git && cd your-repo/maxx_server

# 1. Setup everything
./deploy.sh setup

# 2. Logout/login for Docker group changes
exit
gcloud compute ssh maxx-api-server --zone=us-central1-a
cd your-repo/maxx_server

# 3. Configure and deploy
nano .env  # Add your credentials
./deploy.sh deploy
```

---

## Environment Setup

### Required Credentials

Create/edit `.env` file with:

```bash
# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-key-here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_STORAGE_BUCKET=your-project.appspot.com

# Gemini AI
GEMINI_API_KEY=your-gemini-api-key

# Server Config
PORT=3000
NODE_ENV=production
```

### How to Get Credentials

**Firebase:**
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Project Settings → Service Accounts
3. Generate new private key → Download JSON
4. Extract values from JSON to `.env`

**Gemini API:**
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create API Key
3. Add to `.env` as `GEMINI_API_KEY`

---

## File Structure

### **Essential Files:**
```
maxx_server/
├── deploy.sh          # Single deployment script (handles everything)
├── README.md          # This file
├── .env              # Your credentials (created by script)
├── package.json      # Node.js dependencies
└── src/              # Node.js application code
```

### **What the Script Does:**

**`./deploy.sh setup`:**
- Installs Docker & Docker Compose v2
- Sets up firewall (UFW)
- Creates Docker Compose configuration
- Creates Nginx reverse proxy config
- Creates Dockerfile and .dockerignore
- Creates .env template
- Sets up monitoring tools
- Configures automatic security updates

**`./deploy.sh deploy`:**
- Validates prerequisites
- Builds and starts Docker containers
- Performs health checks
- Shows external IP and API URLs
- Provides management commands

---

## Management Commands

### **Server Management:**
```bash
./deploy.sh setup          # Setup environment and dependencies
./deploy.sh deploy         # Deploy/start server (default)
./deploy.sh status         # Show service status
./deploy.sh logs           # Show live logs
./deploy.sh stop           # Stop all services
./deploy.sh restart        # Restart services
./deploy.sh update         # Update and restart
./deploy.sh clean          # Clean up Docker resources
```

### **Monitoring:**
```bash
./monitor.sh               # System status
docker compose ps          # Container status
docker compose logs -f     # Live logs
docker stats              # Resource usage
```

---

## API Endpoints

Once deployed, your API will be available at:

**Local:** `http://localhost/api`
**Production:** `http://YOUR_EXTERNAL_IP/api`

### **Available Endpoints:**
- `GET /health` - Health check
- `POST /api/analyze` - Analyze looksmaxxing images
- `POST /api/generate/front` - Generate enhanced front image
- `POST /api/generate/side` - Generate side profile
- `POST /api/generate/physique` - Generate physique image
- `POST /api/generate/lifestyle` - Generate lifestyle image

### **Authentication:**
All API endpoints require Firebase ID token:
```
Authorization: Bearer <firebase-id-token>
```

---

## Mobile App Integration

Update your React Native service:

```typescript
// In looksmaxxingService.ts
const API_BASE_URL = __DEV__ 
  ? 'http://10.0.2.2:3000/api'        // Local development
  : 'http://YOUR_EXTERNAL_IP/api';    // Production
```

No other changes needed - all endpoints and response formats remain the same!

---

## Docker Configuration

### **Services:**
- **maxx-api**: Node.js API server (port 3000)
- **nginx**: Reverse proxy (port 80)

### **Features:**
- Health checks for both containers
- Automatic restart on failure
- Log rotation (10MB max, 3 files)
- Security headers and CORS
- Rate limiting (10 req/min per IP)

### **Manual Docker Commands:**
```bash
docker compose up -d --build    # Start services
docker compose down             # Stop services
docker compose logs -f          # View logs
docker compose ps               # Service status
docker system prune -f          # Clean up resources
```

---

## Security Features

### **Network Security:**
- UFW firewall (only SSH, HTTP, HTTPS allowed)
- Nginx rate limiting
- Security headers (XSS, CSRF protection)
- CORS configuration

### **Container Security:**
- Non-root user execution
- Minimal Alpine Linux base
- Health checks and restart policies
- Log rotation and monitoring

### **Access Security:**
- Firebase ID token authentication
- Environment variables protection
- Automatic security updates

---

## Troubleshooting

### **Common Issues:**

**Health check fails:**
```bash
docker compose logs -f maxx-api
./start-server.sh restart
```

**Permission denied (Docker):**
```bash
# After quick-setup.sh, logout and login again
exit
# Reconnect to apply Docker group changes
```

**Environment variables not set:**
```bash
nano .env  # Edit credentials
./start-server.sh restart
```

**Port 80 already in use:**
```bash
sudo lsof -i :80  # Check what's using port 80
sudo systemctl stop apache2  # Stop Apache if running
```

### **Logs and Debugging:**
```bash
# API logs
docker compose logs -f maxx-api

# Nginx logs
docker compose logs -f nginx

# System resources
./monitor.sh

# Container stats
docker stats
```

---

## Cost Estimate (GCP)

**Recommended VM:** e2-standard-2
- 2 vCPU, 8GB RAM, 20GB SSD
- **Cost:** ~$50-70/month
- **Traffic:** Included up to reasonable limits

**Cost Optimization:**
- Use preemptible instances for development
- Schedule shutdown during low usage
- Monitor and resize based on actual usage

---

## Production Checklist

Before going live:
- [ ] Set up SSL/TLS certificates
- [ ] Configure domain name and DNS
- [ ] Set up monitoring and alerting
- [ ] Test all API endpoints
- [ ] Configure backups
- [ ] Load test the API
- [ ] Update mobile app with production URL

---

## Support

### **Quick Commands:**
```bash
# Emergency restart
docker compose restart

# Check system status
./monitor.sh

# View detailed logs
docker compose logs -f

# Clean up disk space
docker system prune -a

# Backup configuration
tar -czf backup.tar.gz .env docker-compose.yml nginx.conf
```

### **File Locations:**
- **Logs:** `docker compose logs`
- **Config:** `.env`, `docker-compose.yml`, `nginx.conf`
- **Monitoring:** `./monitor.sh`

---

## You're All Set!

Your Maxx API server is now running with:
- **Production-ready infrastructure**
- **Automatic scaling and restarts**
- **Security hardening**
- **Monitoring and logging**
- **Simple management commands**

The server maintains full compatibility with your existing React Native app while providing enterprise-grade hosting!
