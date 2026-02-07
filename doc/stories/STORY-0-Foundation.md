# Story 0: Foundation - Walking Skeleton

## Story Overview

**As a** development team  
**I want** to establish the technical foundation and development patterns  
**So that** all future features can be built consistently and efficiently

**Story Type**: Technical Foundation  
**Priority**: Highest  
**Estimated Effort**: 2-3 weeks  
**Dependencies**: None (first story)

---

## Business Value

This story establishes:
- Complete tech stack setup (Spring Boot + Angular + PostgreSQL)
- Authentication and authorization framework
- One complete CRUD example (Environment entity) as a template
- CI/CD pipeline foundation
- Testing infrastructure
- Development patterns for all future stories

---

## Scope

### In Scope
✅ Spring Boot project setup with security  
✅ PostgreSQL database with Liquibase  
✅ JWT authentication implementation  
✅ Angular project setup  
✅ Authentication UI (login page)  
✅ Environment entity (complete CRUD) as pattern example  
✅ API documentation (Swagger)  
✅ Docker setup for local development  
✅ Basic CI/CD configuration  

### Out of Scope
❌ All business entities except Environment  
❌ Complex authorization rules (just basic role check)  
❌ OAuth integration (local auth only)  
❌ Advanced UI features  

---

## Technical Implementation

### Backend Tasks

#### 1. Project Setup
- [ ] Create Spring Boot project via Spring Initializr
  - Spring Boot 3.2.x
  - Dependencies: Web, Security, JPA, PostgreSQL, Liquibase, Validation
- [ ] Configure `pom.xml` with additional dependencies
  - JJWT for JWT handling
  - Lombok
  - SpringDoc OpenAPI
  - Testcontainers
- [ ] Setup project structure (packages: config, domain, repository, service, dto, controller, security, exception)

#### 2. Database Setup
- [ ] Create Liquibase changelog master file
- [ ] Migration 001: Create `user` table with columns:
  - `id` (UUID, PK)
  - `username` (VARCHAR, unique, not null)
  - `password` (VARCHAR, hashed, not null)
  - `email` (VARCHAR, unique, not null)
  - `role` (VARCHAR, not null) - Simple role: ADMIN, USER
  - `created_at`, `updated_at` (TIMESTAMP)
- [ ] Migration 002: Create `environment` table with columns:
  - `id` (UUID, PK)
  - `name` (VARCHAR, unique, not null)
  - `description` (TEXT, nullable)
  - `is_production` (BOOLEAN, default false)
  - `criticality_level` (INTEGER, nullable)
  - `created_at`, `updated_at` (TIMESTAMP)
- [ ] Add indexes on `is_production` and `name`

#### 3. JPA Entities
- [ ] Create `BaseEntity` abstract class with:
  - `id` field with UUID generator
  - `createdAt`, `updatedAt` with JPA auditing
- [ ] Create `User` entity extending `BaseEntity`
- [ ] Create `Environment` entity extending `BaseEntity`
- [ ] Configure JPA auditing in configuration class

#### 4. Security Implementation
- [ ] Create `JwtTokenProvider` class
  - `generateToken(Authentication)`: Create JWT token
  - `getUsernameFromToken(String)`: Extract username
  - `validateToken(String)`: Validate token
- [ ] Create `JwtAuthenticationFilter` extends `OncePerRequestFilter`
  - Extract JWT from Authorization header
  - Validate token
  - Set authentication in SecurityContext
- [ ] Create `UserDetailsServiceImpl` implements `UserDetailsService`
  - Load user from database
  - Map to Spring Security UserDetails
- [ ] Create `SecurityConfig`
  - Configure HTTP security
  - Disable CSRF (stateless API)
  - Configure CORS
  - Set session management to STATELESS
  - Define public endpoints: `/api/auth/**`
  - Require authentication for all other endpoints
  - Add JWT filter before UsernamePasswordAuthenticationFilter
- [ ] Create `AuthController` with endpoints:
  - `POST /api/auth/register`: Register new user
  - `POST /api/auth/login`: Authenticate and return JWT
  - `GET /api/auth/me`: Get current user info

#### 5. Environment CRUD (Pattern Example)
- [ ] Create `EnvironmentRepository` extends `JpaRepository<Environment, UUID>`
- [ ] Create DTOs:
  - `CreateEnvironmentRequest` (name, description, isProduction, criticalityLevel)
  - `UpdateEnvironmentRequest` (same as create, all optional)
  - `EnvironmentResponse` (all fields + createdAt, updatedAt)
- [ ] Create `EnvironmentService` with methods:
  - `create(CreateEnvironmentRequest)`: Create new environment
  - `update(UUID, UpdateEnvironmentRequest)`: Update environment
  - `findById(UUID)`: Get by ID
  - `findAll(Pageable)`: List all with pagination
  - `delete(UUID)`: Delete environment
- [ ] Create `EnvironmentController` with endpoints:
  - `GET /api/environments`: List all (with pagination, sorting)
  - `GET /api/environments/{id}`: Get by ID
  - `POST /api/environments`: Create new
  - `PUT /api/environments/{id}`: Update
  - `DELETE /api/environments/{id}`: Delete
- [ ] Add validation annotations on DTOs
- [ ] Add Swagger annotations on controller methods

#### 6. Exception Handling
- [ ] Create custom exceptions:
  - `ResourceNotFoundException`
  - `BadRequestException`
  - `UnauthorizedException`
- [ ] Create `GlobalExceptionHandler` with `@ControllerAdvice`
  - Handle all custom exceptions
  - Return standardized error response (status, message, timestamp)

#### 7. Configuration
- [ ] Configure `application.yml` for database, JPA, Liquibase
- [ ] Configure `application-dev.yml` for development
- [ ] Configure `application-prod.yml` for production
- [ ] Create `OpenApiConfig` for Swagger documentation
- [ ] Create `CorsConfig` for frontend integration

#### 8. Testing
- [ ] Unit tests for `EnvironmentService` (with Mockito)
- [ ] Integration tests for `EnvironmentController` (with Testcontainers)
- [ ] Security tests for JWT authentication flow
- [ ] Test coverage > 80%

---

### Frontend Tasks

#### 1. Project Setup
- [ ] Create Angular 18 project: `ng new ldpv2-frontend`
- [ ] Add Angular Material or PrimeNG
- [ ] Configure TypeScript strict mode
- [ ] Setup proxy configuration for API calls
- [ ] Configure environments (dev, prod)

#### 2. Project Structure
- [ ] Create folder structure:
  - `core/` (auth, guards, interceptors, services)
  - `shared/` (models, components, pipes)
  - `features/` (feature modules)
- [ ] Setup routing module

#### 3. Authentication Module
- [ ] Create models:
  - `User` interface (id, username, email, role)
  - `LoginRequest` interface (username, password)
  - `LoginResponse` interface (token, user)
- [ ] Create `AuthService`:
  - `login(credentials)`: Call login API, store JWT in localStorage
  - `logout()`: Clear JWT from localStorage
  - `isAuthenticated()`: Check if JWT exists and is valid
  - `getCurrentUser()`: Get current user from token
- [ ] Create `JwtInterceptor` (implements `HttpInterceptor`):
  - Add Authorization header with JWT to all requests
- [ ] Create `ErrorInterceptor` (implements `HttpInterceptor`):
  - Handle 401 (redirect to login)
  - Handle other errors (show notification)
- [ ] Create `AuthGuard` (implements `CanActivate`):
  - Protect routes requiring authentication
  - Redirect to login if not authenticated
- [ ] Create `LoginComponent`:
  - Reactive form with username and password
  - Call AuthService.login()
  - Redirect to dashboard on success
  - Show error message on failure

#### 4. Environment Management (Pattern Example)
- [ ] Create `Environment` model (TypeScript interface)
- [ ] Create `EnvironmentService`:
  - `getEnvironments(page, size, sort)`: GET /api/environments
  - `getEnvironment(id)`: GET /api/environments/{id}
  - `createEnvironment(data)`: POST /api/environments
  - `updateEnvironment(id, data)`: PUT /api/environments/{id}
  - `deleteEnvironment(id)`: DELETE /api/environments/{id}
- [ ] Create `EnvironmentListComponent`:
  - Display environments in table/list
  - Pagination controls
  - Sort by name, criticality, etc.
  - Actions: View, Edit, Delete
  - Button: Create New
- [ ] Create `EnvironmentDetailComponent`:
  - Display full environment details
  - Edit and Delete buttons
- [ ] Create `EnvironmentFormComponent`:
  - Reactive form for create/edit
  - Validation (required fields, unique name)
  - Submit to API
  - Success/error notifications
- [ ] Add routing:
  - `/environments`: EnvironmentListComponent
  - `/environments/new`: EnvironmentFormComponent (create mode)
  - `/environments/:id`: EnvironmentDetailComponent
  - `/environments/:id/edit`: EnvironmentFormComponent (edit mode)

#### 5. Shared Components
- [ ] Create `HeaderComponent` (navigation, user menu, logout)
- [ ] Create `LoadingSpinnerComponent`
- [ ] Create `ConfirmDialogComponent` (for delete confirmations)
- [ ] Create `NotificationService` (toast notifications)

#### 6. Styling
- [ ] Setup global styles
- [ ] Create responsive layout
- [ ] Style login page
- [ ] Style environment management pages

#### 7. Testing
- [ ] Unit tests for `AuthService`
- [ ] Unit tests for `EnvironmentService`
- [ ] Component tests for `LoginComponent`
- [ ] Component tests for `EnvironmentListComponent`
- [ ] E2E test: Login flow
- [ ] E2E test: Create environment flow
- [ ] Test coverage > 70%

---

### DevOps Tasks

#### 1. Docker Setup
- [ ] Create `Dockerfile` for backend
- [ ] Create `Dockerfile` for frontend
- [ ] Create `docker-compose.yml` with services:
  - PostgreSQL
  - Backend
  - Frontend (optional for dev)
- [ ] Document how to run with Docker

#### 2. CI/CD Pipeline
- [ ] Create `.gitlab-ci.yml` or `Jenkinsfile` or GitHub Actions workflow
- [ ] Pipeline stages:
  - Build (backend and frontend)
  - Test (run all tests)
  - Code quality check (SonarQube optional)
  - Build Docker images
  - Push to registry (optional)
- [ ] Configure environment variables

#### 3. Documentation
- [ ] README.md with:
  - Project description
  - Prerequisites
  - How to run locally
  - How to run with Docker
  - How to run tests
- [ ] API documentation accessible via Swagger UI
- [ ] Contribution guidelines (optional)

---

## Acceptance Criteria

### Authentication
- [ ] User can register a new account
- [ ] User can login with username and password
- [ ] Upon successful login, JWT token is returned
- [ ] JWT token is stored in browser (localStorage)
- [ ] JWT token is automatically included in API requests
- [ ] User is redirected to login page when token is invalid/expired
- [ ] User can logout (token is cleared)

### Environment CRUD
- [ ] User can view a list of all environments
- [ ] List is paginated (20 items per page)
- [ ] User can sort environments by name or criticality
- [ ] User can view details of a specific environment
- [ ] User can create a new environment with:
  - Name (required, unique)
  - Description (optional)
  - Production flag (default: false)
  - Criticality level (optional, 1-5)
- [ ] Form validation works correctly (required fields, unique name)
- [ ] User can edit an existing environment
- [ ] User can delete an environment (with confirmation dialog)
- [ ] Success and error notifications are displayed appropriately

### API Documentation
- [ ] Swagger UI is accessible at `/swagger-ui/index.html`
- [ ] All endpoints are documented with request/response schemas
- [ ] Authentication endpoints are documented
- [ ] Environment endpoints are documented

### Testing
- [ ] Backend unit tests pass (>80% coverage)
- [ ] Backend integration tests pass
- [ ] Frontend unit tests pass (>70% coverage)
- [ ] E2E tests pass for critical flows

### DevOps
- [ ] Application runs successfully with `docker-compose up`
- [ ] CI/CD pipeline builds and tests successfully
- [ ] README documentation is complete and accurate

---

## Testing Scenarios

### Scenario 1: User Registration and Login
1. Navigate to registration page
2. Fill in username, email, password
3. Submit registration form
4. Verify success message
5. Navigate to login page
6. Enter username and password
7. Submit login form
8. Verify redirect to dashboard
9. Verify JWT token in localStorage
10. Verify Authorization header in subsequent requests

### Scenario 2: Create Environment
1. Login as authenticated user
2. Navigate to environments list
3. Click "Create New Environment"
4. Fill in form:
   - Name: "PROD-EU"
   - Description: "Production environment for Europe"
   - Production: true
   - Criticality: 5
5. Submit form
6. Verify success notification
7. Verify redirect to environment list
8. Verify new environment appears in list

### Scenario 3: Edit Environment
1. Navigate to environment list
2. Click "Edit" on an environment
3. Modify description
4. Submit form
5. Verify success notification
6. Verify changes are reflected

### Scenario 4: Delete Environment
1. Navigate to environment list
2. Click "Delete" on an environment
3. Confirm deletion in dialog
4. Verify success notification
5. Verify environment is removed from list

### Scenario 5: Unauthorized Access
1. Logout or clear JWT token
2. Attempt to access protected route (e.g., `/environments`)
3. Verify redirect to login page
4. Login again
5. Verify redirect to originally requested page

---

## Definition of Done

- [ ] All backend tasks completed
- [ ] All frontend tasks completed
- [ ] All DevOps tasks completed
- [ ] All acceptance criteria met
- [ ] All tests passing (unit, integration, E2E)
- [ ] Code reviewed and approved
- [ ] API documented in Swagger
- [ ] User documentation updated
- [ ] Demo conducted successfully
- [ ] Code merged to main branch

---

## Technical Debt & Future Improvements

### Known Limitations
- Simple role-based authorization (ADMIN, USER) - will need environment-specific roles in future
- Local authentication only - OAuth integration planned for later
- Basic error handling - can be enhanced with more specific error codes
- No password reset functionality - to be added later

### Future Enhancements
- Implement refresh token mechanism
- Add password strength validation
- Implement account activation via email
- Add "Remember me" functionality
- Implement rate limiting on auth endpoints
- Add audit logging for security events

---

## Dependencies & Blockers

### Dependencies
None - this is the first story

### Potential Blockers
- PostgreSQL setup issues → Use Docker Compose
- CORS configuration issues → Properly configure allowed origins
- JWT secret management → Use environment variables
- Network connectivity between services → Use Docker network

---

## Resources & References

### Spring Boot Documentation
- [Spring Security](https://docs.spring.io/spring-security/reference/index.html)
- [Spring Data JPA](https://docs.spring.io/spring-data/jpa/docs/current/reference/html/)
- [Liquibase with Spring Boot](https://docs.liquibase.com/tools-integrations/springboot/springboot.html)

### Angular Documentation
- [Angular Authentication](https://angular.io/guide/security)
- [HTTP Interceptors](https://angular.io/guide/http-interceptor-use-cases)
- [Reactive Forms](https://angular.io/guide/reactive-forms)

### JWT
- [JJWT Library](https://github.com/jwtk/jjwt)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

---

**Story Status**: Ready for Development  
**Story Created**: February 2026  
**Estimated Completion**: 2-3 weeks from start
