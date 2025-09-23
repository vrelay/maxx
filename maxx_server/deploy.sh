#!/bin/bash

# Maxx API Server - Complete Deployment Script
# This single script handles everything: dependencies, configuration, and deployment

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

print_status() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }
print_header() { echo -e "${PURPLE}[MAXX]${NC} $1"; }

# Check if running as root
check_root() {
    if [ "$EUID" -eq 0 ]; then
        print_error "Please don't run this script as root (without sudo)"
        exit 1
    fi
}

# Install system dependencies
install_dependencies() {
    print_header "Installing system dependencies..."
    
    # Update system
    print_status "Updating system packages..."
    sudo apt update && sudo apt upgrade -y
    
    # Install prerequisites
    print_status "Installing prerequisites..."
    sudo apt install -y apt-transport-https ca-certificates curl gnupg lsb-release jq htop unzip wget git
    
    print_success "System dependencies installed!"
}

# Install Docker
install_docker() {
    print_header "Installing Docker..."
    
    if command -v docker &> /dev/null; then
        print_success "Docker is already installed!"
        return
    fi
    
    # Add Docker's official GPG key
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    
    # Add Docker repository
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    # Install Docker
    sudo apt update
    sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    
    # Add user to docker group
    sudo usermod -aG docker $USER
    
    # Configure Docker logging
    print_status "Configuring Docker logging..."
    sudo tee /etc/docker/daemon.json > /dev/null <<EOF
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
EOF
    
    # Start and enable Docker
    sudo systemctl start docker
    sudo systemctl enable docker
    
    print_success "Docker installed and configured!"
}

# Setup firewall
setup_firewall() {
    print_header "Setting up firewall..."
    
    # Install and configure UFW
    sudo apt install -y ufw
    sudo ufw default deny incoming
    sudo ufw default allow outgoing
    sudo ufw allow ssh
    sudo ufw allow 80/tcp
    sudo ufw allow 443/tcp
    sudo ufw --force enable
    
    print_success "Firewall configured!"
}

# Create Docker Compose configuration
create_docker_compose() {
    print_header "Creating Docker Compose configuration..."
    
    cat > docker-compose.yml << 'EOF'
services:
  maxx-api:
    build: .
    container_name: maxx-api
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - PORT=3000
    env_file:
      - .env
    networks:
      - maxx-network
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  nginx:
    image: nginx:alpine
    container_name: maxx-nginx
    restart: unless-stopped
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - maxx-api
    networks:
      - maxx-network
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost/health"]
      interval: 30s
      timeout: 10s
      retries: 3

networks:
  maxx-network:
    driver: bridge
EOF
    
    print_success "Docker Compose configuration created!"
}

# Create Nginx configuration
create_nginx_config() {
    print_header "Creating Nginx configuration..."
    
    cat > nginx.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 50M;

    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log;

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;

    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/m;
    limit_req_zone $binary_remote_addr zone=health:10m rate=30r/m;

    upstream backend {
        server maxx-api:3000;
        keepalive 32;
    }

    server {
        listen 80;
        server_name _;

        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";
        add_header Referrer-Policy "strict-origin-when-cross-origin";

        location /api {
            if ($request_method = 'OPTIONS') {
                add_header 'Access-Control-Allow-Origin' '*';
                add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS';
                add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization';
                add_header 'Access-Control-Max-Age' 1728000;
                add_header 'Content-Type' 'text/plain; charset=utf-8';
                add_header 'Content-Length' 0;
                return 204;
            }

            add_header 'Access-Control-Allow-Origin' '*' always;
            add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS' always;
            add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;

            limit_req zone=api burst=20 nodelay;

            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
            
            proxy_connect_timeout 60s;
            proxy_send_timeout 300s;
            proxy_read_timeout 300s;
        }

        location /health {
            limit_req zone=health burst=10 nodelay;
            
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            
            proxy_connect_timeout 5s;
            proxy_send_timeout 5s;
            proxy_read_timeout 5s;
        }

        location / {
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
EOF
    
    print_success "Nginx configuration created!"
}

# Create Dockerfile
create_dockerfile() {
    print_header "Creating Dockerfile..."
    
    cat > Dockerfile << 'EOF'
FROM node:18-alpine

WORKDIR /app

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

COPY src ./src

RUN chown -R nodejs:nodejs /app
USER nodejs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

CMD ["npm", "start"]
EOF
    
    print_success "Dockerfile created!"
}

# Create .dockerignore
create_dockerignore() {
    print_header "Creating .dockerignore..."
    
    cat > .dockerignore << 'EOF'
node_modules
npm-debug.log
.env
.env.*
.git
.gitignore
README.md
deploy.sh
Dockerfile
.dockerignore
coverage
.nyc_output
.DS_Store
*.log
EOF
    
    print_success ".dockerignore created!"
}

# Create environment file
create_env_file() {
    print_header "Creating environment configuration..."
    
    if [ ! -f ".env" ]; then
        cat > .env << 'EOF'
# Firebase Configuration (REQUIRED - Replace with your actual values)
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-actual-private-key-here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/your-service-account%40your-project.iam.gserviceaccount.com

# Gemini AI Configuration (REQUIRED - Replace with your actual API key)
GEMINI_API_KEY=your-gemini-api-key

# Server Configuration
PORT=3000
NODE_ENV=production

# Storage Configuration (REQUIRED - Replace with your bucket name)
FIREBASE_STORAGE_BUCKET=your-project.appspot.com

# Rate Limiting
MAX_REQUESTS_PER_MINUTE=10
MAX_REQUESTS_PER_HOUR=50

# Image Processing
MAX_IMAGE_SIZE_MB=10
IMAGE_QUALITY=0.8
EOF
        chmod 600 .env
        print_warning "IMPORTANT: Edit the .env file with your actual credentials!"
        print_warning "    nano .env"
    else
        print_success ".env file already exists!"
    fi
}

# Create monitoring script
create_monitoring() {
    print_header "Creating monitoring script..."
    
    cat > monitor.sh << 'EOF'
#!/bin/bash
echo "=== Maxx API Status $(date) ===" 
echo "System Resources:"
echo "Memory: $(free -h | grep '^Mem:' | awk '{print $3"/"$2}')"
echo "Disk: $(df -h / | tail -1 | awk '{print $3"/"$2" ("$5" used)"}')"
echo ""
echo "Docker Status:"
docker compose ps 2>/dev/null || echo "Docker Compose not running"
echo ""
echo "API Health:"
curl -s http://localhost/health 2>/dev/null | jq . || echo "API not responding"
echo ""
echo "Container Stats:"
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}" 2>/dev/null || echo "No containers running"
echo "===================="
EOF
    chmod +x monitor.sh
    
    print_success "Monitoring script created!"
}

# Setup automatic updates
setup_auto_updates() {
    print_header "Setting up automatic security updates..."
    
    sudo apt install -y unattended-upgrades
    echo 'Unattended-Upgrade::Automatic-Reboot "false";' | sudo tee -a /etc/apt/apt.conf.d/50unattended-upgrades > /dev/null
    
    print_success "Automatic updates configured!"
}

# Check prerequisites for deployment
check_prerequisites() {
    print_status "Checking deployment prerequisites..."
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. This should not happen after setup."
        exit 1
    fi
    
    # Check Docker Compose v2
    if ! docker compose version &> /dev/null; then
        print_error "Docker Compose v2 is not available."
        exit 1
    fi
    
    # Check if user is in docker group
    if ! groups | grep -q docker; then
        print_error "User is not in docker group. Please logout and login again."
        exit 1
    fi
    
    # Check .env file
    if [ ! -f ".env" ]; then
        print_error ".env file not found."
        exit 1
    fi
    
    # Check if .env has been configured
    if grep -q "your-firebase-project-id" .env; then
        print_error "Please edit .env file with your actual credentials first:"
        print_error "nano .env"
        exit 1
    fi
    
    print_success "Prerequisites check passed!"
}

# Deploy the application
deploy_application() {
    print_header "Deploying Maxx API server..."
    
    # Stop existing containers
    print_status "Stopping existing containers..."
    docker compose down || true
    
    # Clean up old images
    print_status "Cleaning up old images..."
    docker image prune -f || true
    
    # Build and start services
    print_status "Building and starting services..."
    docker compose up -d --build
    
    # Wait for services to be ready
    print_status "Waiting for services to be ready..."
    sleep 30
    
    # Check health
    print_status "Checking service health..."
    local attempts=0
    local max_attempts=10
    
    while [ $attempts -lt $max_attempts ]; do
        if curl -f -s http://localhost/health > /dev/null 2>&1; then
            print_success "API is healthy and ready!"
            break
        else
            attempts=$((attempts + 1))
            print_status "Attempt $attempts/$max_attempts - waiting for API..."
            sleep 10
        fi
    done
    
    if [ $attempts -eq $max_attempts ]; then
        print_error "API health check failed after $max_attempts attempts!"
        print_status "Checking logs for errors..."
        docker compose logs --tail=50
        exit 1
    fi
}

# Show deployment status
show_deployment_status() {
    print_header "Deployment Status"
    echo ""
    
    # Get external IP
    print_status "Getting server information..."
    local external_ip=""
    
    # Try to get external IP from GCP metadata
    if curl -s -H "Metadata-Flavor: Google" http://metadata.google.internal/computeMetadata/v1/instance/network-interfaces/0/access-configs/0/external-ip &> /dev/null; then
        external_ip=$(curl -s -H "Metadata-Flavor: Google" http://metadata.google.internal/computeMetadata/v1/instance/network-interfaces/0/access-configs/0/external-ip)
        print_success "External IP: $external_ip"
        print_success "API URL: http://$external_ip/api"
        print_success "Health Check: http://$external_ip/health"
    else
        print_warning "Could not determine external IP. Check your cloud provider console."
        print_success "Local API URL: http://localhost/api"
        print_success "Local Health Check: http://localhost/health"
    fi
    
    echo ""
    print_status "Service Status:"
    docker compose ps
    
    echo ""
    print_status "Update your mobile app configuration:"
    if [ -n "$external_ip" ]; then
        echo "const API_BASE_URL = 'http://$external_ip/api';"
    else
        echo "const API_BASE_URL = 'http://YOUR_EXTERNAL_IP/api';"
    fi
    
    echo ""
    print_status "Management commands:"
    echo "• Monitor status: ./monitor.sh"
    echo "• View logs: docker compose logs -f"
    echo "• Restart: docker compose restart"
    echo "• Stop: docker compose down"
    echo "• Update: docker compose up -d --build"
    
    echo ""
    print_success "Your Maxx API server is live and ready!"
}

# Main script logic
main() {
    print_header "Maxx API Server - Complete Deployment"
    echo ""
    
    case "${1:-setup}" in
        "setup"|"install"|"")
            check_root
            install_dependencies
            install_docker
            setup_firewall
            create_docker_compose
            create_nginx_config
            create_dockerfile
            create_dockerignore
            create_env_file
            create_monitoring
            setup_auto_updates
            
            print_success "Setup completed!"
            print_warning "IMPORTANT: You need to logout and login again for Docker group changes."
            print_status "Next steps:"
            echo "1. Logout and login: exit"
            echo "2. Edit credentials: nano .env"
            echo "3. Deploy server: ./deploy.sh deploy"
            ;;
            
        "deploy"|"start")
            check_prerequisites
            deploy_application
            show_deployment_status
            ;;
            
        "status")
            print_status "Current Status:"
            docker compose ps
            echo ""
            curl -s http://localhost/health | jq . || echo "API not responding"
            ;;
            
        "logs")
            docker compose logs -f
            ;;
            
        "stop")
            print_status "Stopping services..."
            docker compose down
            print_success "Services stopped!"
            ;;
            
        "restart")
            print_status "Restarting services..."
            docker compose restart
            print_success "Services restarted!"
            ;;
            
        "update")
            print_status "Updating services..."
            docker compose down
            docker compose up -d --build
            print_success "Services updated!"
            ;;
            
        "clean")
            print_status "Cleaning up Docker resources..."
            docker compose down
            docker system prune -f
            print_success "Cleanup completed!"
            ;;
            
        *)
            echo "Maxx API Server - Complete Deployment Script"
            echo ""
            echo "Usage: $0 [command]"
            echo ""
            echo "Commands:"
            echo "  setup     - Install dependencies and create configurations (default)"
            echo "  deploy    - Deploy the application"
            echo "  status    - Show service status"
            echo "  logs      - Show live logs"
            echo "  stop      - Stop all services"
            echo "  restart   - Restart all services"
            echo "  update    - Update and restart services"
            echo "  clean     - Clean up Docker resources"
            echo ""
            echo "Quick Start:"
            echo "1. ./deploy.sh setup"
            echo "2. logout && login (for Docker group)"
            echo "3. nano .env (add your credentials)"
            echo "4. ./deploy.sh deploy"
            ;;
    esac
}

# Run main function
main "$@"
