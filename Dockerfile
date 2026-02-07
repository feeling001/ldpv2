# =============================================================================
# Multi-stage Dockerfile - LDPv2 Unified Container
# Builds frontend, backend, and serves both through nginx in a single container
# =============================================================================

# =============================================================================
# Stage 1: Build Angular Frontend
# =============================================================================
FROM node:18-alpine AS frontend-build

WORKDIR /app/frontend

# Copy frontend package files and install dependencies
COPY frontend/package*.json ./
RUN npm install --only=production

# Copy frontend source and build
COPY frontend/ ./
RUN npm run build

# =============================================================================
# Stage 2: Build Spring Boot Backend
# =============================================================================
FROM maven:3.9-eclipse-temurin-17-alpine AS backend-build

WORKDIR /app/backend

# Copy Maven configuration and download dependencies (cached layer)
COPY backend/pom.xml ./
RUN mvn dependency:go-offline -B

# Copy backend source and build
COPY backend/src ./src
RUN mvn clean package -DskipTests

# =============================================================================
# Stage 3: Final Runtime Container
# Combines nginx (for frontend + routing), JRE (for backend), and supervisord
# =============================================================================
FROM eclipse-temurin:17-jre-alpine

# Install nginx and supervisord
RUN apk add --no-cache nginx supervisor wget

# Create necessary directories
RUN mkdir -p /app/backend \
    /app/frontend \
    /var/log/supervisor \
    /run/nginx

# -----------------------------------------------------------------------------
# Copy built artifacts from previous stages
# -----------------------------------------------------------------------------

# Copy Spring Boot JAR from backend build
COPY --from=backend-build /app/backend/target/*.jar /app/backend/app.jar

# Copy built Angular app from frontend build
COPY --from=frontend-build /app/frontend/dist/ldpv2-frontend/browser /app/frontend

# -----------------------------------------------------------------------------
# Configure nginx
# -----------------------------------------------------------------------------

# Remove default nginx configuration
RUN rm -f /etc/nginx/http.d/default.conf

# Copy custom nginx configuration
COPY <<'EOF' /etc/nginx/http.d/ldpv2.conf
server {
    listen 80;
    server_name localhost;
    root /app/frontend;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    gzip_min_length 1000;
    gzip_comp_level 6;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # API proxy to backend (running on localhost:8080)
    location /api/ {
        proxy_pass http://127.0.0.1:8080/api/;
        proxy_http_version 1.1;
        
        # Headers
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket support
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Handle OPTIONS requests for CORS preflight
        if ($request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' '*';
            add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, PATCH, OPTIONS';
            add_header 'Access-Control-Allow-Headers' 'Authorization, Content-Type, Accept';
            add_header 'Access-Control-Max-Age' 1728000;
            add_header 'Content-Type' 'text/plain charset=UTF-8';
            add_header 'Content-Length' 0;
            return 204;
        }
    }

    # Angular routes - fallback to index.html for SPA
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # Don't log favicon requests
    location = /favicon.ico {
        log_not_found off;
        access_log off;
    }
}
EOF

# -----------------------------------------------------------------------------
# Configure supervisord to manage both nginx and Spring Boot
# -----------------------------------------------------------------------------

COPY <<'EOF' /etc/supervisord.conf
[supervisord]
nodaemon=true
user=root
logfile=/var/log/supervisor/supervisord.log
pidfile=/var/run/supervisord.pid
loglevel=info

[program:backend]
command=java -jar /app/backend/app.jar
autostart=true
autorestart=true
startretries=10
startsecs=30
stdout_logfile=/var/log/supervisor/backend.log
stderr_logfile=/var/log/supervisor/backend-error.log
environment=JAVA_OPTS="-Xms256m -Xmx512m"

[program:nginx]
command=nginx -g 'daemon off;'
autostart=true
autorestart=true
stdout_logfile=/var/log/supervisor/nginx.log
stderr_logfile=/var/log/supervisor/nginx-error.log
# Wait for backend to be ready before starting nginx
startsecs=45
EOF

# -----------------------------------------------------------------------------
# Expose port and configure health check
# -----------------------------------------------------------------------------

EXPOSE 80

# Health check - check both nginx and backend
HEALTHCHECK --interval=30s --timeout=10s --start-period=90s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:80/ && \
        wget --quiet --tries=1 --spider http://localhost:8080/api/actuator/health || exit 1

# -----------------------------------------------------------------------------
# Start supervisord which manages both services
# -----------------------------------------------------------------------------

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]
