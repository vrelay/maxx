#!/bin/bash

# Maxx API Server - Complete Deployment and SSL Setup Script
# This script handles everything: dependencies, configuration, deployment, and SSL

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

# SSL Configuration
DOMAIN="bapi.lookai.me"
EMAIL="your-email@example.com"  # Change this to your email
DATA_PATH="./certbot"
STAGING=0  # Set to 1 for testing to avoid rate limits

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
    sudo apt install -y apt-transport-https ca-certificates curl gnupg lsb-release jq htop unzip wget git dnsutils

    print_success "System dependencies installed!"
}

# Install Docker
install_docker() {
    print_header "Installing Docker..."

    if command -v docker &> /dev/null; then
        print_success "Docker is already installed!"
        return
    fi

    # Detect OS
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        OS=$ID
        VERSION_CODENAME=$VERSION_CODENAME
    else
        print_error "Cannot detect OS. Please install Docker manually."
        exit 1
    fi

    # Set Docker repository URL based on OS
    if [ "$OS" = "ubuntu" ]; then
        DOCKER_REPO_URL="https://download.docker.com/linux/ubuntu"
        GPG_URL="https://download.docker.com/linux/ubuntu/gpg"
    elif [ "$OS" = "debian" ]; then
        DOCKER_REPO_URL="https://download.docker.com/linux/debian"
        GPG_URL="https://download.docker.com/linux/debian/gpg"
    else
        print_error "Unsupported OS: $OS. Please install Docker manually."
        exit 1
    fi

    print_status "Detected OS: $OS $VERSION_CODENAME"

    # Clean up any existing broken Docker repository
    sudo rm -f /etc/apt/sources.list.d/docker.list
    sudo rm -f /usr/share/keyrings/docker-archive-keyring.gpg

    # Add Docker's official GPG key
    curl -fsSL $GPG_URL | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

    # Add Docker repository
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] $DOCKER_REPO_URL $VERSION_CODENAME stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

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

# Create basic Docker Compose configuration (HTTP only)
create_basic_docker_compose() {
    print_header "Creating basic Docker Compose configuration..."

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
      maxx-api:
        condition: service_healthy
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

    print_success "Basic Docker Compose configuration created!"
}

# Create SSL-enabled Docker Compose configuration
create_ssl_docker_compose() {
    print_header "Creating SSL-enabled Docker Compose configuration..."

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
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./certbot/conf:/etc/letsencrypt:ro
      - ./certbot/www:/var/www/certbot:ro
    depends_on:
      maxx-api:
        condition: service_healthy
    networks:
      - maxx-network
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  certbot:
    image: certbot/certbot
    container_name: maxx-certbot
    volumes:
      - ./certbot/conf:/etc/letsencrypt:rw
      - ./certbot/www:/var/www/certbot:rw
    entrypoint: "/bin/sh -c 'trap exit TERM; while :; do certbot renew; sleep 12h & wait $${!}; done;'"
    depends_on:
      - nginx

networks:
  maxx-network:
    driver: bridge
EOF

    print_success "SSL-enabled Docker Compose configuration created!"
}

# Create basic Nginx configuration (HTTP only)
create_basic_nginx_config() {
    print_header "Creating basic Nginx configuration..."

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

        location /webhooks {
            # No CORS headers for webhooks (trusted external services)
            # No rate limiting for webhooks (external services need reliable access)
            
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            
            # Preserve original request body for webhook signature verification
            proxy_set_header X-Original-URI $request_uri;
            proxy_set_header X-Original-Method $request_method;
            
            # Faster timeouts for webhooks
            proxy_connect_timeout 30s;
            proxy_send_timeout 60s;
            proxy_read_timeout 60s;
        }

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

    print_success "Basic Nginx configuration created!"
}

# Create SSL-enabled Nginx configuration
create_ssl_nginx_config() {
    print_header "Creating SSL-enabled Nginx configuration..."

    cat > nginx.conf << EOF
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

    limit_req_zone \$binary_remote_addr zone=api:10m rate=10r/m;
    limit_req_zone \$binary_remote_addr zone=health:10m rate=30r/m;

    upstream backend {
        server maxx-api:3000;
        keepalive 32;
    }

    # HTTP Server - Handles Let's Encrypt challenges and redirects to HTTPS
    server {
        listen 80;
        server_name $DOMAIN;

        # Let's Encrypt challenge location
        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }

        # Health check on HTTP for compatibility
        location /health {
            limit_req zone=health burst=10 nodelay;
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
        }

        # Redirect all other HTTP traffic to HTTPS
        location / {
            return 301 https://\$server_name\$request_uri;
        }
    }

    # HTTPS Server
    server {
        listen 443 ssl http2;
        server_name $DOMAIN;

        # SSL Configuration with Let's Encrypt certificates
        ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;

        # Include Let's Encrypt's recommended SSL configuration
        include /etc/letsencrypt/options-ssl-nginx.conf;
        ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

        # Security Headers
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";
        add_header Referrer-Policy "strict-origin-when-cross-origin";
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

        location /webhooks {
            # No CORS headers for webhooks (trusted external services)
            # No rate limiting for webhooks (external services need reliable access)
            
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
            
            # Preserve original request body for webhook signature verification
            proxy_set_header X-Original-URI \$request_uri;
            proxy_set_header X-Original-Method \$request_method;
            
            # Faster timeouts for webhooks
            proxy_connect_timeout 30s;
            proxy_send_timeout 60s;
            proxy_read_timeout 60s;
        }

        location /api {
            if (\$request_method = 'OPTIONS') {
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
            proxy_set_header Upgrade \$http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
            proxy_cache_bypass \$http_upgrade;

            proxy_connect_timeout 60s;
            proxy_send_timeout 300s;
            proxy_read_timeout 300s;
        }

        location /health {
            limit_req zone=health burst=10 nodelay;

            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;

            proxy_connect_timeout 5s;
            proxy_send_timeout 5s;
            proxy_read_timeout 5s;
        }

        location / {
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
        }
    }
}
EOF

    print_success "SSL-enabled Nginx configuration created!"
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
certbot
certs
*.backup_*
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

# Webhook Configuration (Optional - for webhook signature verification)
REVENUECAT_WEBHOOK_SECRET=your-revenuecat-webhook-secret
EOF
        chmod 600 .env
        print_warning "IMPORTANT: Edit the .env file with your actual credentials!"
        print_warning "    nano .env"
    else
        print_success ".env file already exists!"
    fi
}

# Create monitoring scripts
create_monitoring() {
    print_header "Creating monitoring scripts..."

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
echo "Webhook Endpoints:"
echo "RevenueCat: $(curl -s -o /dev/null -w "%{http_code}" http://localhost/webhooks/test 2>/dev/null || echo "Not accessible")"
echo ""
echo "Container Stats:"
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}" 2>/dev/null || echo "No containers running"
echo "===================="
EOF
    chmod +x monitor.sh

    print_success "Basic monitoring script created!"
}

# Create SSL monitoring script
create_ssl_monitoring() {
    print_header "Creating SSL monitoring script..."

    cat > monitor-ssl.sh << EOF
#!/bin/bash

echo "=== SSL Certificate Status - \$(date) ==="
echo ""

# Check certificate expiry
if [ -f "./certbot/conf/live/$DOMAIN/fullchain.pem" ]; then
    echo "Certificate Information:"
    openssl x509 -in ./certbot/conf/live/$DOMAIN/fullchain.pem -noout -text | grep -E "(Subject:|Issuer:|Not Before|Not After)"
    echo ""

    # Check days until expiry
    expiry_date=\$(openssl x509 -in ./certbot/conf/live/$DOMAIN/fullchain.pem -noout -enddate | cut -d= -f2)
    days_left=\$(( (\$(date -d "\$expiry_date" +%s) - \$(date +%s)) / 86400 ))

    if [ \$days_left -gt 30 ]; then
        echo "Certificate expires in \$days_left days (OK)"
    elif [ \$days_left -gt 7 ]; then
        echo "Certificate expires in \$days_left days (Warning)"
    else
        echo "Certificate expires in \$days_left days (Critical)"
    fi
else
    echo "Certificate file not found!"
fi

echo ""
echo "Service Status:"
docker compose ps

echo ""
echo "SSL Test:"
echo "HTTPS: \$(curl -I -s -k https://$DOMAIN/health | head -1 || echo "Failed")"
echo "HTTP Redirect: \$(curl -I -s http://$DOMAIN/ | grep -i location || echo "No redirect found")"

echo ""
echo "Recent Certbot Logs:"
docker compose logs --tail=10 certbot 2>/dev/null || echo "Certbot container not running"

echo "=========================="
EOF
    
    chmod +x monitor-ssl.sh
    print_success "SSL monitoring script created!"
}

# Setup automatic updates
setup_auto_updates() {
    print_header "Setting up automatic security updates..."

    sudo apt install -y unattended-upgrades
    echo 'Unattended-Upgrade::Automatic-Reboot "false";' | sudo tee -a /etc/apt/apt.conf.d/50unattended-upgrades > /dev/null

    print_success "Automatic updates configured!"
}

# Verify domain setup
verify_domain() {
    print_header "Verifying domain setup..."

    print_status "Checking if domain $DOMAIN points to this server..."

    # Get server's public IP
    local server_ip=""
    if curl -s -H "Metadata-Flavor: Google" http://metadata.google.internal/computeMetadata/v1/instance/network-interfaces/0/access-configs/0/external-ip &> /dev/null; then
        server_ip=$(curl -s -H "Metadata-Flavor: Google" http://metadata.google.internal/computeMetadata/v1/instance/network-interfaces/0/access-configs/0/external-ip)
    else
        server_ip=$(timeout 10 curl -s ifconfig.me 2>/dev/null || timeout 10 curl -s ipinfo.io/ip 2>/dev/null || echo "unknown")
    fi

    if [ "$server_ip" != "unknown" ]; then
        print_status "Server IP: $server_ip"

        # Check DNS resolution
        local domain_ip=$(dig +short $DOMAIN 2>/dev/null | head -1 || echo "unknown")

        if [ "$domain_ip" = "$server_ip" ]; then
            print_success "Domain $DOMAIN correctly points to this server!"
            return 0
        else
            print_warning "Domain resolution check:"
            print_warning "  Domain $DOMAIN resolves to: $domain_ip"
            print_warning "  Server IP: $server_ip"
            print_warning "Make sure your DNS is properly configured."
            return 1
        fi
    else
        print_warning "Could not determine server IP. Please ensure your domain points to this server."
        return 1
    fi
}

# Remove old SSL configuration
remove_old_ssl() {
    print_header "Removing previous SSL configuration..."

    # Stop containers first
    if docker compose ps 2>/dev/null | grep -q "maxx"; then
        print_status "Stopping existing containers..."
        docker compose down
    fi

    # Remove old SSL certificates directory
    if [ -d "certs" ]; then
        print_status "Removing old self-signed certificates..."
        rm -rf certs
        print_success "Removed ./certs directory"
    fi

    # Clean up old backup files
    print_status "Cleaning up backup files..."
    rm -f nginx.conf.backup_* docker-compose.yml.backup_* ssl.sh migrate-ssl.sh 2>/dev/null || true

    print_success "Old SSL configuration removed!"
}

# Initialize Let's Encrypt certificates
init_letsencrypt() {
    print_header "Initializing Let's Encrypt certificates..."

    if [ ! -e "$DATA_PATH/conf/options-ssl-nginx.conf" ] || [ ! -e "$DATA_PATH/conf/ssl-dhparams.pem" ]; then
        print_status "Downloading recommended TLS parameters..."
        mkdir -p "$DATA_PATH/conf"
        curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot-nginx/certbot_nginx/_internal/tls_configs/options-ssl-nginx.conf > "$DATA_PATH/conf/options-ssl-nginx.conf"
        curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot/certbot/ssl-dhparams.pem > "$DATA_PATH/conf/ssl-dhparams.pem"
        print_success "TLS parameters downloaded!"
    fi

    print_status "Creating dummy certificate for $DOMAIN..."
    path="/etc/letsencrypt/live/$DOMAIN"
    mkdir -p "$DATA_PATH/conf/live/$DOMAIN"

    docker compose run --rm --entrypoint "\
        openssl req -x509 -nodes -newkey rsa:4096 -days 1\
        -keyout '$path/privkey.pem' \
        -out '$path/fullchain.pem' \
        -subj '/CN=localhost'" certbot

    print_status "Starting nginx with dummy certificate..."
    docker compose up --force-recreate -d nginx

    # Wait for nginx to be ready with better error handling
    print_status "Waiting for nginx to be ready..."
    local attempts=0
    local max_attempts=12
    
    while [ $attempts -lt $max_attempts ]; do
        if docker compose ps nginx | grep -q "Up"; then
            print_success "Nginx is ready!"
            break
        else
            attempts=$((attempts + 1))
            print_status "Attempt $attempts/$max_attempts - waiting for nginx..."
            sleep 5
        fi
    done

    if [ $attempts -eq $max_attempts ]; then
        print_error "Nginx failed to start properly!"
        docker compose logs nginx
        exit 1
    fi

    print_status "Deleting dummy certificate for $DOMAIN..."
    docker compose run --rm --entrypoint "\
        rm -Rf /etc/letsencrypt/live/$DOMAIN && \
        rm -Rf /etc/letsencrypt/archive/$DOMAIN && \
        rm -Rf /etc/letsencrypt/renewal/$DOMAIN.conf" certbot

    print_status "Requesting Let's Encrypt certificate for $DOMAIN..."

    # Email argument
    local email_arg=""
    if [ "$EMAIL" = "your-email@example.com" ]; then
        print_warning "Using default email. Please update EMAIL variable in script for production use."
        email_arg="--register-unsafely-without-email"
    else
        email_arg="--email $EMAIL"
    fi

    # Staging argument
    local staging_arg=""
    if [ $STAGING != "0" ]; then 
        staging_arg="--staging"
        print_warning "Using staging environment. Certificates will not be trusted by browsers."
    fi

    if docker compose run --rm --entrypoint "\
        certbot certonly --webroot -w /var/www/certbot \
        $staging_arg \
        $email_arg \
        -d $DOMAIN \
        --rsa-key-size 4096 \
        --agree-tos \
        --force-renewal" certbot; then
        
        print_status "Reloading nginx with real certificate..."
        docker compose exec nginx nginx -s reload
        print_success "Let's Encrypt certificate obtained and configured!"
    else
        print_error "Failed to obtain SSL certificate from Let's Encrypt!"
        print_error "This could be due to:"
        print_error "1. Domain DNS not properly configured"
        print_error "2. Rate limiting (try again later or use staging)"
        print_error "3. Firewall blocking port 80"
        print_status "Check logs: docker compose logs certbot"
        exit 1
    fi
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
    if grep -q "your-firebase-project-id" .env || grep -q "your-gemini-api-key" .env; then
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
    docker compose down 2>/dev/null || true

    # Clean up old images
    print_status "Cleaning up old images..."
    docker image prune -f || true

    # Build and start services
    print_status "Building and starting services..."
    docker compose up -d --build

    # Wait for services to be ready with improved health checking
    print_status "Waiting for services to be ready..."
    local attempts=0
    local max_attempts=20
    local wait_time=15

    while [ $attempts -lt $max_attempts ]; do
        sleep $wait_time
        
        if curl -f -s http://localhost/health > /dev/null 2>&1; then
            print_success "API is healthy and ready!"
            return 0
        else
            attempts=$((attempts + 1))
            print_status "Attempt $attempts/$max_attempts - waiting for API..."
            
            # Show container status for debugging
            if [ $((attempts % 3)) -eq 0 ]; then
                print_status "Container status:"
                docker compose ps
            fi
        fi
    done

    print_error "API health check failed after $max_attempts attempts!"
    print_status "Checking logs for errors..."
    docker compose logs --tail=50
    exit 1
}

# Start all services with SSL
start_ssl_services() {
    print_header "Starting all services with SSL..."

    # Start the API service first
    docker compose up -d maxx-api

    # Wait for API to be healthy before starting certbot
    print_status "Waiting for API service to be ready..."
    local attempts=0
    local max_attempts=10
    
    while [ $attempts -lt $max_attempts ]; do
        if docker compose ps maxx-api | grep -q "healthy"; then
            print_success "API service is healthy!"
            break
        else
            attempts=$((attempts + 1))
            print_status "Attempt $attempts/$max_attempts - waiting for API..."
            sleep 10
        fi
    done

    # Start Certbot for automatic renewals
    docker compose up -d certbot

    # Check HTTPS health with better error handling
    print_status "Checking HTTPS connectivity..."
    local attempts=0
    local max_attempts=10

    while [ $attempts -lt $max_attempts ]; do
        if curl -k -f -s https://$DOMAIN/health > /dev/null 2>&1; then
            print_success "HTTPS API is healthy and ready!"
            return 0
        else
            attempts=$((attempts + 1))
            print_status "Attempt $attempts/$max_attempts - waiting for HTTPS API..."
            sleep 10
        fi
    done

    print_warning "HTTPS health check failed. Checking HTTP..."
    if curl -f -s http://$DOMAIN/health > /dev/null 2>&1; then
        print_success "HTTP API is working (will redirect to HTTPS)"
    else
        print_error "API health check failed on both HTTP and HTTPS!"
        print_status "Checking container logs..."
        docker compose logs --tail=20 maxx-api
        return 1
    fi

    print_success "All services started successfully!"
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
        echo ""
        print_status "Webhook endpoints for external services:"
        echo "RevenueCat Webhook: http://$external_ip/webhooks/revenuecat"
        echo "Test Webhook: http://$external_ip/webhooks/test"
    else
        echo "const API_BASE_URL = 'http://YOUR_EXTERNAL_IP/api';"
        echo ""
        print_status "Webhook endpoints for external services:"
        echo "RevenueCat Webhook: http://YOUR_EXTERNAL_IP/webhooks/revenuecat"
        echo "Test Webhook: http://YOUR_EXTERNAL_IP/webhooks/test"
    fi

    echo ""
    print_status "Management commands:"
    echo "• Monitor status: ./monitor.sh"
    echo "• View logs: docker compose logs -f"
    echo "• Restart: docker compose restart"
    echo "• Stop: docker compose down"
    echo "• Update: docker compose up -d --build"
    echo "• Setup SSL: ./deploy.sh ssl"

    echo ""
    print_success "Your Maxx API server is live and ready!"
}

# Show SSL deployment status
show_ssl_status() {
    print_header "SSL Configuration Complete!"
    echo ""

    # Get external IP
    local external_ip=""

    # Try to get external IP from GCP metadata
    if curl -s -H "Metadata-Flavor: Google" http://metadata.google.internal/computeMetadata/v1/instance/network-interfaces/0/access-configs/0/external-ip &> /dev/null; then
        external_ip=$(curl -s -H "Metadata-Flavor: Google" http://metadata.google.internal/computeMetadata/v1/instance/network-interfaces/0/access-configs/0/external-ip)
        print_success "External IP: $external_ip"
        print_success "HTTPS API URL: https://$DOMAIN/api"
        print_success "HTTP API URL: http://$DOMAIN/api (redirects to HTTPS)"
        print_success "HTTPS Health Check: https://$DOMAIN/health"
    else
        print_warning "Could not determine external IP. Check your cloud provider console."
        print_success "Local HTTPS API URL: https://localhost/api"
        print_success "Local Health Check: https://localhost/health"
    fi

    echo ""
    print_status "Update your React Native app configuration:"
    echo "const API_BASE_URL = 'https://$DOMAIN/api';"
    echo ""
    print_status "Webhook endpoints for external services:"
    echo "RevenueCat Webhook: https://$DOMAIN/webhooks/revenuecat"
    echo "Test Webhook: https://$DOMAIN/webhooks/test"

    echo ""
    print_warning "Important SSL Notes:"
    echo "• Certificate is from Let's Encrypt (trusted by all browsers and mobile apps)"
    echo "• Your React Native app will now work on iOS without ATS issues"
    echo "• Certificate is valid for 90 days and renews automatically"
    echo "• Certificate files are in ./certbot/ directory"

    echo ""
    print_status "SSL Management Commands:"
    echo "• Test HTTPS: curl -k https://$DOMAIN/health"
    echo "• View certificate: openssl x509 -in certbot/conf/live/$DOMAIN/fullchain.pem -text -noout"
    echo "• Monitor SSL: ./monitor-ssl.sh"
    echo "• Manual renewal: ./deploy.sh renew-ssl"
    echo "• SSL status: ./deploy.sh ssl-status"

    echo ""
    print_success "Your Maxx API server now supports HTTPS!"
}

# Main script logic
main() {
    print_header "Maxx API Server - Complete Setup and SSL Configuration"
    echo ""

    case "${1:-setup}" in
        "setup"|"install"|"")
            check_root
            install_dependencies
            install_docker
            setup_firewall
            create_basic_docker_compose
            create_basic_nginx_config
            create_dockerfile
            create_dockerignore
            create_env_file
            create_monitoring
            setup_auto_updates

            print_success "Basic setup completed!"
            print_warning "IMPORTANT: You need to logout and login again for Docker group changes."
            print_status "Next steps:"
            echo "1. Logout and login: exit"
            echo "2. Edit credentials: nano .env"
            echo "3. Deploy server: ./deploy.sh deploy"
            echo "4. Setup SSL: ./deploy.sh ssl"
            ;;

        "deploy"|"start")
            check_prerequisites
            deploy_application
            show_deployment_status
            ;;

        "ssl")
            if [ "$EMAIL" = "your-email@example.com" ]; then
                print_warning "Please edit this script and update the EMAIL variable with your actual email address!"
                read -p "Continue with default email? (y/N): " continue_default
                if [ "$continue_default" != "y" ] && [ "$continue_default" != "Y" ]; then
                    print_error "Please edit the script and set your email address."
                    exit 1
                fi
            fi

            if ! verify_domain; then
                read -p "Continue anyway? (y/N): " continue_setup
                if [ "$continue_setup" != "y" ] && [ "$continue_setup" != "Y" ]; then
                    print_error "Please configure DNS first and try again."
                    exit 1
                fi
            fi

            remove_old_ssl
            create_ssl_docker_compose
            create_ssl_nginx_config
            init_letsencrypt
            start_ssl_services
            create_ssl_monitoring
            show_ssl_status
            ;;

        "full")
            check_root
            if [ "$EMAIL" = "your-email@example.com" ]; then
                print_warning "Please edit this script and update the EMAIL variable first!"
                exit 1
            fi

            print_status "Starting full setup with SSL..."
            install_dependencies
            install_docker
            setup_firewall
            create_dockerfile
            create_dockerignore
            create_env_file
            create_monitoring
            setup_auto_updates

            if ! verify_domain; then
                print_error "Domain verification failed. Please configure DNS first."
                exit 1
            fi

            remove_old_ssl
            create_ssl_docker_compose
            create_ssl_nginx_config
            init_letsencrypt
            start_ssl_services
            create_ssl_monitoring
            show_ssl_status
            ;;

        "renew-ssl")
            print_status "Manual SSL certificate renewal..."
            docker compose run --rm certbot certonly --webroot -w /var/www/certbot --force-renewal -d $DOMAIN
            docker compose exec nginx nginx -s reload
            print_success "Certificate renewed and Nginx reloaded!"
            ;;

        "ssl-status")
            print_status "Current SSL Status:"
            if [ -f "$DATA_PATH/conf/live/$DOMAIN/fullchain.pem" ]; then
                openssl x509 -in "$DATA_PATH/conf/live/$DOMAIN/fullchain.pem" -noout -dates
                echo ""
            fi
            docker compose ps
            curl -I -s -k https://$DOMAIN/health | head -1 || echo "HTTPS health check failed"
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

        "clean-ssl")
            print_warning "This will remove all SSL certificates and configuration!"
            read -p "Are you sure? (y/N): " confirm
            if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
                docker compose down
                rm -rf certbot
                create_basic_docker_compose
                create_basic_nginx_config
                print_success "SSL configuration removed!"
            fi
            ;;

        *)
            echo "Maxx API Server - Complete Setup and SSL Configuration Script"
            echo ""
            echo "Usage: $0 [command]"
            echo ""
            echo "Commands:"
            echo "  setup     - Install dependencies and create basic configurations (default)"
            echo "  deploy    - Deploy the application (HTTP only)"
            echo "  ssl       - Add SSL support to existing deployment"
            echo "  full      - Complete setup with SSL in one go"
            echo ""
            echo "SSL Management:"
            echo "  renew-ssl - Manually renew SSL certificate"
            echo "  ssl-status- Show SSL certificate status"
            echo "  clean-ssl - Remove SSL configuration"
            echo ""
            echo "Service Management:"
            echo "  status    - Show service status"
            echo "  logs      - Show live logs"
            echo "  stop      - Stop all services"
            echo "  restart   - Restart all services"
            echo "  update    - Update and restart services"
            echo "  clean     - Clean up Docker resources"
            echo ""
            echo "Quick Start (HTTP only):"
            echo "1. ./deploy.sh setup"
            echo "2. logout && login (for Docker group)"
            echo "3. nano .env (add your credentials)"
            echo "4. ./deploy.sh deploy"
            echo ""
            echo "Quick Start (with SSL):"
            echo "1. Edit this script and set EMAIL variable"
            echo "2. Configure DNS: bapi.lookai.me -> your-server-ip"
            echo "3. ./deploy.sh full"
            ;;
    esac
}

# Run main function
main "$@"
