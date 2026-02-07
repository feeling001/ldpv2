# LDPv2 Monorepo - Story 0: Foundation

Complete implementation of Story 0 (Walking Skeleton) with Spring Boot backend and Angular 18 frontend.



## 📁 Project Structure

```
ldpv2-monorepo/
├── backend/              # Spring Boot 3.2 backend
│   ├── src/
│   │   ├── main/java/com/ldpv2/
│   │   │   ├── config/           # Security, OpenAPI config
│   │   │   ├── controller/       # REST controllers
│   │   │   ├── domain/entity/    # JPA entities
│   │   │   ├── dto/              # Request/Response DTOs
│   │   │   ├── exception/        # Exception handlers
│   │   │   ├── repository/       # Spring Data repositories
│   │   │   ├── security/         # JWT security
│   │   │   └── service/          # Business logic
│   │   └── resources/
│   │       ├── application.yml   # Configuration
│   │       └── db/changelog/     # Liquibase migrations
│   ├── pom.xml
│   └── Dockerfile
├── frontend/             # Angular 18 frontend
│   ├── src/app/
│   │   ├── core/                 # Auth, guards, interceptors
│   │   ├── shared/               # Models, components
│   │   └── features/             # Feature modules
│   ├── package.json
│   ├── angular.json
│   └── Dockerfile
├── docker-compose.yml    # Complete Docker setup
└── README.md            # This file

```

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- JDK 17+ (for local backend development)
- Node.js 18+ (for local frontend development)

### Option 1: Docker Compose (Recommended)

```bash
# Start all services
docker-compose up --build

# Access the application
Frontend: http://localhost:4200
Backend API: http://localhost:8080/api
Swagger UI: http://localhost:8080/swagger-ui/index.html
PostgreSQL: localhost:5432
```

### Option 2: Local Development

#### Backend
```bash
cd backend

# Using Maven
./mvnw spring-boot:run

# Or with Docker for PostgreSQL only
docker run -d -p 5432:5432 \
  -e POSTGRES_DB=ldpv2 \
  -e POSTGRES_USER=ldpv2_user \
  -e POSTGRES_PASSWORD=ldpv2_password \
  postgres:16-alpine
```

#### Frontend
```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm start

# Access at http://localhost:4200
```

## 🔑 Default Credentials

- Username: `admin`
- Password: `admin123`

## 📚 API Documentation

Swagger UI is available at: http://localhost:8080/swagger-ui/index.html

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token

### Environment Endpoints (Requires Authentication)
- `GET /api/environments` - List all environments (paginated)
- `GET /api/environments/{id}` - Get environment by ID
- `POST /api/environments` - Create new environment
- `PUT /api/environments/{id}` - Update environment
- `DELETE /api/environments/{id}` - Delete environment
- `GET /api/environments/search?query={name}` - Search environments

## 🧪 Testing

### Backend Tests
```bash
cd backend
./mvnw test

# With coverage
./mvnw clean test jacoco:report
```

### Frontend Tests
```bash
cd frontend
npm test

# E2E tests
npm run e2e
```

## 📦 Database Migrations

Liquibase automatically runs migrations on startup. Migration files are in:
`backend/src/main/resources/db/changelog/`

## 🔧 Configuration

### Backend Configuration
Edit `backend/src/main/resources/application.yml`

Key properties:
- `spring.datasource.*` - Database configuration
- `jwt.secret` - JWT signing secret (CHANGE IN PRODUCTION!)
- `jwt.expiration` - Token expiration time

### Frontend Configuration
Edit `frontend/src/environments/environment.ts`

## 🐳 Docker Commands

```bash
# Build all images
docker-compose build

# Start services
docker-compose up

# Start in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

## 📝 Story 0 Implementation Checklist

### ✅ Backend
- [x] Spring Boot 3.2 setup with Maven
- [x] PostgreSQL 16 integration
- [x] Liquibase database migrations
- [x] JWT authentication & authorization
- [x] User entity and authentication
- [x] Environment entity (CRUD example)
- [x] Global exception handling
- [x] OpenAPI/Swagger documentation
- [x] Docker support

### ✅ Frontend
- [x] Angular 18 setup
- [x] Authentication service
- [x] JWT interceptor
- [x] Auth guard for route protection
- [x] Login component
- [x] Environment list component
- [x] Environment form component
- [x] Environment detail component
- [x] Responsive Material Design

### ✅ DevOps
- [x] Docker Compose setup
- [x] Multi-stage Dockerfiles
- [x] PostgreSQL in Docker
- [x] Health checks
- [x] Environment variables

## 🎯 Next Steps

After Story 0 is complete, proceed with:
1. **Story 1**: Business Unit Management
2. **Story 2**: Application Management
3. **Story 3**: Contact Management
4. **Story 4**: Enhanced Environment Management
5. **Story 5**: Version Management
6. **Story 6**: Deployment Tracking
7. **Story 7**: Current State Dashboard & History

## 🐛 Troubleshooting

### Backend won't start
- Check PostgreSQL is running: `docker ps`
- Check logs: `docker-compose logs backend`
- Verify database credentials in `application.yml`

### Frontend can't connect to backend
- Verify backend is running on port 8080
- Check CORS configuration in `SecurityConfig.java`
- Verify proxy configuration in `proxy.conf.json`

### Database migrations fail
- Stop all containers: `docker-compose down -v`
- Remove volumes and restart: `docker-compose up --build`

## 📄 License

Proprietary - LDPv2 Team

## 👥 Team

LDPv2 Development Team

---

**Version**: 1.0.0 - Story 0 Foundation  
**Last Updated**: February 2026  
**Status**: ✅ Complete and Ready for Development
