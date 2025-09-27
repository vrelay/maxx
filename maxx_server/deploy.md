# Maxx API Server - Complete Deployment Guide

A comprehensive deployment script for the Maxx API server with Docker, Nginx reverse proxy, SSL/TLS encryption, and automated certificate management.

## 🚀 Features

- **Automated Docker deployment** with health checks and logging
- **HTTPS/SSL support** with Let's Encrypt certificates
- **Nginx reverse proxy** with security headers and rate limiting
- **Automatic SSL renewal** via Certbot
- **Firewall configuration** with UFW
- **System monitoring** scripts included
- **Multi-OS support** (Ubuntu/Debian)
- **Production-ready** security configuration

## 📋 Prerequisites

### System Requirements
- **OS**: Ubuntu 18.04+ or Debian 10+
- **RAM**: Minimum 1GB (2GB+ recommended)
- **Storage**: 10GB+ available space
- **Network**: Public IP with ports 80/443 accessible

### Required Information
- **Domain name** pointing to your server (for SSL)
- **Email address** (for Let's Encrypt notifications)
- **Firebase project credentials**
- **Gemini API key**

## ⚡ Quick Start

### Option 1: HTTP-Only Deployment (Development)
```bash
# 1. Make script executable
chmod +x deploy.sh

# 2. Install dependencies and create basic configuration
./deploy.sh setup

# 3. Logout and login (required for Docker group changes)
exit
# Login again via SSH

# 4. Configure environment variables
nano .env
# Edit all placeholder values with your actual credentials

# 5. Deploy the application
./deploy.sh deploy
```

### Option 2: Full HTTPS Deployment (Production)
```bash
# 1. Make script executable
chmod +x deploy.sh

# 2. Configure domain and email in script
nano deploy.sh
# Edit: DOMAIN="your-domain.com"
# Edit: EMAIL="your-email@example.com"

# 3. Ensure DNS is configured
# Point your domain to your server's IP address

# 4. Configure environment variables
nano .env
# Edit all placeholder values with your actual credentials

# 5. Run complete setup with SSL
./deploy.sh full
```

### Option 3: Add SSL to Existing HTTP Deployment
```bash
# Configure domain/email and ensure DNS is working
./deploy.sh ssl
```

## 🔧 Configuration

### Environment Variables (.env)

Create and configure your `.env` file with these required variables:

```bash
# Firebase Configuration (REQUIRED)
FIREBASE_PROJECT_ID=your-actual-project-id
FIREBASE_PRIVATE_KEY_ID=your-actual-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-actual-private-key-content\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-actual-client-id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/your-service-account%40your-project.iam.gserviceaccount.com
FIREBASE_STORAGE_BUCKET=your-project.appspot.com

# Gemini AI Configuration (REQUIRED)
GEMINI_API_KEY=your-actual-gemini-api-key

# Server Configuration
PORT=3000
NODE_ENV=production

# Rate Limiting
MAX_REQUESTS_PER_MINUTE=10
MAX_REQUESTS_PER_HOUR=50

# Image Processing
MAX_IMAGE_SIZE_MB=10
IMAGE_QUALITY=0.8
```

### Script Configuration

Edit these variables in `deploy.sh`:

```bash
# SSL Configuration
DOMAIN="your-domain.com"           # Your actual domain
EMAIL="your-email@example.com"     # Your email for Let's Encrypt
STAGING=0                          # Set to 1 for testing certificates
```

## 📝 Commands Reference

### Initial Setup & Deployment
```bash
./deploy.sh setup      # Install dependencies and create basic config
./deploy.sh deploy     # Deploy HTTP-only version
./deploy.sh ssl        # Add SSL to existing deployment  
./deploy.sh full       # Complete setup with SSL in one command
```

### Service Management
```bash
./deploy.sh status     # Show current service status
./deploy.sh logs       # View live application logs
./deploy.sh restart    # Restart all services
./deploy.sh stop       # Stop all services
./deploy.sh update     # Update and rebuild containers
./deploy.sh clean      # Clean up Docker resources
```

### SSL Management
```bash
./deploy.sh ssl-status   # Show SSL certificate status and expiry
./deploy.sh renew-ssl    # Manually renew SSL certificate
./deploy.sh clean-ssl    # Remove SSL configuration (revert to HTTP)
```

### Monitoring & Maintenance
```bash
./monitor.sh           # System status and health monitoring
./monitor-ssl.sh       # SSL certificate status monitoring
```

## 🌐 API Endpoints

### HTTP Deployment (Development)
- **API Base**: `http://your-server-ip/api`
- **Health Check**: `http://your-server-ip/health`
- **Example**: `http://203.0.113.1/api/looksmaxxing/analyze`

### HTTPS Deployment (Production)
- **API Base**: `https://your-domain.com/api`
- **Health Check**: `https://your-domain.com/health`
- **HTTP Redirect**: All HTTP requests automatically redirect to HTTPS
- **Example**: `https://api.yourapp.com/api/looksmaxxing/analyze`

## 📱 Client Configuration

### React Native App Configuration

#### For HTTP Deployment (Development)
```javascript
// In your React Native app config
const API_BASE_URL = 'http://your-server-ip/api';

// Example
const API_BASE_URL = 'http://203.0.113.1/api';
```

#### For HTTPS Deployment (Production)
```javascript
// In your React Native app config
const API_BASE_URL = 'https://your-domain.com/api';

// Example
const API_BASE_URL = 'https://api.yourapp.com/api';
```

### iOS App Transport Security (ATS)

With HTTPS deployment, your iOS app will work without any ATS configuration. For HTTP deployment (development only), you may need to configure ATS exceptions.

## 🔍 Troubleshooting

### DNS Configuration Issues
```bash
# Check if your domain points to the server
dig +short your-domain.com

# Should return your server's IP address
# If not, configure your DNS provider
```

### SSL Certificate Issues
```bash
# Check certificate status
./deploy.sh ssl-status

# View detailed certificate info
openssl x509 -in certbot/conf/live/your-domain.com/fullchain.pem -text -noout

# Remove SSL and try again
./deploy.sh clean-ssl
# Fix DNS issues, then:
./deploy.sh ssl
```

### Container Issues
```bash
# View detailed logs
docker compose logs -f

# Check container status
docker compose ps

# Restart specific service
docker compose restart maxx-api

# Rebuild from scratch
./deploy.sh clean
./deploy.sh deploy
```

### API Health Check Failures
```bash
# Test locally
curl http://localhost/health

# Test externally (replace with your domain/IP)
curl https://your-domain.com/health

# Check API logs
docker compose logs -f maxx-api
```

### Port Issues
```bash
# Check if ports are open
sudo ufw status
sudo netstat -tlnp | grep -E ':(80|443|3000)'

# Ensure firewall allows HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

## 📂 Generated File Structure

After deployment, your directory will contain:

```
maxx_server/
├── deploy.sh              # Main deployment script
├── docker-compose.yml     # Docker services configuration
├── nginx.conf            # Nginx reverse proxy config
├── Dockerfile            # API container build instructions
├── .dockerignore         # Docker build exclusions
├── .env                  # Environment variables (keep secure!)
├── certbot/              # SSL certificates (auto-generated)
│   ├── conf/
│   └── www/
├── monitor.sh            # System monitoring script
└── monitor-ssl.sh        # SSL monitoring script
```

## 🔒 Security Features

- **SSL/TLS encryption** with modern cipher suites
- **HTTP Strict Transport Security (HSTS)** headers
- **Security headers** (X-Frame-Options, X-Content-Type-Options, etc.)
- **Rate limiting** on API endpoints (10 requests/minute, burst 20)
- **CORS configuration** for cross-origin requests
- **UFW firewall** with minimal open ports
- **Docker container isolation**
- **Automatic security updates** for the system
- **Log rotation** to prevent disk space issues

## 📊 Monitoring & Maintenance

### System Monitoring
```bash
# Quick status check
./monitor.sh

# Continuous monitoring
watch -n 30 './monitor.sh'

# SSL certificate monitoring
./monitor-ssl.sh
```

### Log Management
```bash
# View recent logs
docker compose logs --tail=100

# Follow live logs
docker compose logs -f

# View specific service logs
docker compose logs -f maxx-api
docker compose logs -f nginx
```

### Certificate Renewal

SSL certificates automatically renew via Certbot. Monitor renewal status:

```bash
# Check certificate expiry
./deploy.sh ssl-status

# Manual renewal (if needed)
./deploy.sh renew-ssl

# Test renewal process
docker compose run --rm certbot certonly --webroot -w /var/www/certbot --staging --force-renewal -d your-domain.com
```

## 🚨 Common Issues & Solutions

### 1. "Domain verification failed"
**Problem**: DNS not properly configured  
**Solution**: 
```bash
# Verify DNS configuration
dig +short your-domain.com
# Should return your server IP
```

### 2. "Docker group permission denied"
**Problem**: User not in docker group  
**Solution**: 
```bash
# Logout and login again after setup
exit
# SSH back into your server
```

### 3. "SSL certificate failed"
**Problem**: Let's Encrypt rate limiting or DNS issues  
**Solution**: 
```bash
# Use staging environment first
nano deploy.sh  # Set STAGING=1
./deploy.sh ssl
# Then switch to production
nano deploy.sh  # Set STAGING=0
./deploy.sh renew-ssl
```

### 4. "API not responding"
**Problem**: Application startup issues  
**Solution**: 
```bash
# Check environment variables
grep -v "^#" .env | grep -v "^$"
# Ensure all placeholder values are replaced

# Check application logs
docker compose logs -f maxx-api
```

### 5. "Port 80/443 connection refused"
**Problem**: Firewall blocking ports  
**Solution**: 
```bash
# Check firewall status
sudo ufw status
# Allow required ports
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

## 🔄 Update & Maintenance

### Application Updates
```bash
# Update code and restart
./deploy.sh update

# Or manual process:
git pull                    # If using git
docker compose down
docker compose up -d --build
```

### System Updates
```bash
# System updates (automatic security updates are enabled)
sudo apt update && sudo apt upgrade -y

# Docker updates
sudo apt update docker-ce docker-ce-cli containerd.io
```

### Backup Important Files
```bash
# Backup SSL certificates
tar -czf ssl-backup-$(date +%Y%m%d).tar.gz certbot/

# Backup configuration
cp .env .env.backup
cp nginx.conf nginx.conf.backup
cp docker-compose.yml docker-compose.yml.backup
```

## 📞 Support & Debugging

### Health Checks
- **Application**: `curl https://your-domain.com/health`
- **SSL Certificate**: `./monitor-ssl.sh`
- **System Resources**: `./monitor.sh`
- **Container Status**: `docker compose ps`

### Log Locations
- **Application logs**: `docker compose logs maxx-api`
- **Nginx logs**: `docker compose logs nginx`
- **Certbot logs**: `docker compose logs certbot`
- **System logs**: `/var/log/syslog`

### Performance Monitoring
```bash
# Container resource usage
docker stats

# System resource usage
htop
df -h
free -h
```

This deployment script provides a production-ready setup for the Maxx API server with comprehensive security, monitoring, and maintenance features.