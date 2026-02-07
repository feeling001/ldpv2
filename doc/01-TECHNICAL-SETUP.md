# LDPv2 - Technical Setup Guide

## Overview

This guide provides the technical foundation for the LDPv2 project, including technology stack details, project structure, and initial setup instructions.

## Technology Stack

### Backend
- **Framework**: Spring Boot 3.2.x
- **Language**: Java 17 or 21
- **Security**: Spring Security 6.x with JWT
- **Persistence**: 
  - PostgreSQL 16
  - Hibernate 6.x (JPA)
  - HikariCP (connection pooling)
- **Migration**: Liquibase 4.x
- **Build Tool**: Maven 3.9.x
- **Testing**:
  - JUnit 5
  - Mockito
  - Testcontainers (for integration tests)
  - REST Assured (for API tests)
- **Documentation**: SpringDoc OpenAPI (Swagger)
- **Validation**: Jakarta Bean Validation

### Frontend
- **Framework**: Angular 18
- **Language**: TypeScript 5.x
- **UI Library**: Angular Material or PrimeNG (to be decided)
- **HTTP Client**: Angular HttpClient
- **State Management**: Service-based (or NgRx for complex state)
- **Forms**: Reactive Forms
- **Routing**: Angular Router
- **Testing**:
  - Jasmine/Karma (unit tests)
  - Cypress or Playwright (E2E tests)
- **Build Tool**: Angular CLI

### DevOps
- **Containerization**: Docker
- **Container Orchestration**: Docker Compose (dev), Kubernetes (prod)
- **CI/CD**: Jenkins, GitLab CI, or GitHub Actions
- **Version Control**: Git

## Project Structure

### Backend Structure
```
ldpv2-backend/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/ldpv2/
│   │   │       ├── LdpV2Application.java
│   │   │       ├── config/
│   │   │       │   ├── SecurityConfig.java
│   │   │       │   ├── JwtConfig.java
│   │   │       │   └── OpenApiConfig.java
│   │   │       ├── domain/
│   │   │       │   ├── entity/
│   │   │       │   │   ├── BaseEntity.java
│   │   │       │   │   ├── Application.java
│   │   │       │   │   ├── Environment.java
│   │   │       │   │   └── ...
│   │   │       │   └── enums/
│   │   │       │       ├── ApplicationStatus.java
│   │   │       │       └── ExternalDependencyType.java
│   │   │       ├── repository/
│   │   │       │   ├── ApplicationRepository.java
│   │   │       │   ├── EnvironmentRepository.java
│   │   │       │   └── ...
│   │   │       ├── service/
│   │   │       │   ├── ApplicationService.java
│   │   │       │   ├── EnvironmentService.java
│   │   │       │   └── ...
│   │   │       ├── dto/
│   │   │       │   ├── request/
│   │   │       │   │   ├── CreateApplicationRequest.java
│   │   │       │   │   └── ...
│   │   │       │   └── response/
│   │   │       │       ├── ApplicationResponse.java
│   │   │       │       └── ...
│   │   │       ├── controller/
│   │   │       │   ├── ApplicationController.java
│   │   │       │   ├── EnvironmentController.java
│   │   │       │   └── ...
│   │   │       ├── security/
│   │   │       │   ├── JwtTokenProvider.java
│   │   │       │   ├── JwtAuthenticationFilter.java
│   │   │       │   └── UserDetailsServiceImpl.java
│   │   │       └── exception/
│   │   │           ├── GlobalExceptionHandler.java
│   │   │           ├── ResourceNotFoundException.java
│   │   │           └── ...
│   │   └── resources/
│   │       ├── application.yml
│   │       ├── application-dev.yml
│   │       ├── application-prod.yml
│   │       └── db/
│   │           └── changelog/
│   │               ├── db.changelog-master.xml
│   │               ├── v1.0/
│   │               │   ├── 001-create-base-tables.xml
│   │               │   ├── 002-create-application-tables.xml
│   │               │   └── ...
│   │               └── data/
│   │                   └── initial-data.xml
│   └── test/
│       └── java/
│           └── com/ldpv2/
│               ├── integration/
│               │   ├── ApplicationIntegrationTest.java
│               │   └── ...
│               ├── service/
│               │   ├── ApplicationServiceTest.java
│               │   └── ...
│               └── controller/
│                   ├── ApplicationControllerTest.java
│                   └── ...
├── pom.xml
├── Dockerfile
└── docker-compose.yml
```

### Frontend Structure
```
ldpv2-frontend/
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── auth/
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── auth.guard.ts
│   │   │   │   ├── jwt.interceptor.ts
│   │   │   │   └── login/
│   │   │   │       ├── login.component.ts
│   │   │   │       ├── login.component.html
│   │   │   │       └── login.component.scss
│   │   │   ├── services/
│   │   │   │   ├── api.service.ts
│   │   │   │   └── error-handler.service.ts
│   │   │   └── interceptors/
│   │   │       ├── jwt.interceptor.ts
│   │   │       └── error.interceptor.ts
│   │   ├── shared/
│   │   │   ├── models/
│   │   │   │   ├── application.model.ts
│   │   │   │   ├── environment.model.ts
│   │   │   │   └── ...
│   │   │   ├── components/
│   │   │   │   ├── header/
│   │   │   │   ├── footer/
│   │   │   │   └── loading-spinner/
│   │   │   └── pipes/
│   │   │       └── date-format.pipe.ts
│   │   ├── features/
│   │   │   ├── applications/
│   │   │   │   ├── application.service.ts
│   │   │   │   ├── application-list/
│   │   │   │   │   ├── application-list.component.ts
│   │   │   │   │   ├── application-list.component.html
│   │   │   │   │   └── application-list.component.scss
│   │   │   │   ├── application-detail/
│   │   │   │   └── application-form/
│   │   │   ├── environments/
│   │   │   │   ├── environment.service.ts
│   │   │   │   └── ...
│   │   │   ├── deployments/
│   │   │   └── business-units/
│   │   ├── app.component.ts
│   │   ├── app.component.html
│   │   ├── app.routes.ts
│   │   └── app.config.ts
│   ├── assets/
│   │   ├── images/
│   │   └── i18n/
│   ├── environments/
│   │   ├── environment.ts
│   │   └── environment.prod.ts
│   ├── styles.scss
│   └── index.html
├── angular.json
├── package.json
├── tsconfig.json
└── Dockerfile
```

## Initial Setup

### Prerequisites
- JDK 17 or 21
- Node.js 18+ and npm
- Docker and Docker Compose
- PostgreSQL 16 (or use Docker)
- Git
- IDE (IntelliJ IDEA, VS Code, or similar)

### Backend Setup

#### 1. Create Spring Boot Project
```bash
# Using Spring Initializr or
# Download from https://start.spring.io with:
# - Spring Boot 3.2.x
# - Dependencies: Web, Security, JPA, PostgreSQL, Liquibase, Validation
```

#### 2. Configure application.yml
```yaml
spring:
  application:
    name: ldpv2-backend
  
  datasource:
    url: jdbc:postgresql://localhost:5432/ldpv2
    username: ldpv2_user
    password: ldpv2_password
    driver-class-name: org.postgresql.Driver
    hikari:
      maximum-pool-size: 10
      minimum-idle: 5
  
  jpa:
    hibernate:
      ddl-auto: validate # Let Liquibase handle schema
    show-sql: true
    properties:
      hibernate:
        format_sql: true
        dialect: org.hibernate.dialect.PostgreSQLDialect
  
  liquibase:
    change-log: classpath:db/changelog/db.changelog-master.xml
    enabled: true

jwt:
  secret: ${JWT_SECRET:your-secret-key-change-in-production}
  expiration: 3600000 # 1 hour in milliseconds

server:
  port: 8080
  servlet:
    context-path: /api

logging:
  level:
    com.ldpv2: DEBUG
    org.springframework.security: DEBUG
```

#### 3. Docker Compose for Development
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: ldpv2-postgres
    environment:
      POSTGRES_DB: ldpv2
      POSTGRES_USER: ldpv2_user
      POSTGRES_PASSWORD: ldpv2_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - ldpv2-network

  backend:
    build: ./ldpv2-backend
    container_name: ldpv2-backend
    depends_on:
      - postgres
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/ldpv2
      SPRING_DATASOURCE_USERNAME: ldpv2_user
      SPRING_DATASOURCE_PASSWORD: ldpv2_password
      JWT_SECRET: development-secret-key
    ports:
      - "8080:8080"
    networks:
      - ldpv2-network

volumes:
  postgres_data:

networks:
  ldpv2-network:
    driver: bridge
```

### Frontend Setup

#### 1. Create Angular Project
```bash
npm install -g @angular/cli@18
ng new ldpv2-frontend
cd ldpv2-frontend
```

#### 2. Install Dependencies
```bash
# Angular Material (or PrimeNG)
ng add @angular/material

# Additional dependencies
npm install --save \
  @angular/common \
  @angular/forms \
  rxjs
```

#### 3. Configure Environment
```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api'
};

// src/environments/environment.prod.ts
export const environment = {
  production: true,
  apiUrl: '/api'
};
```

#### 4. Proxy Configuration for Development
```json
// proxy.conf.json
{
  "/api": {
    "target": "http://localhost:8080",
    "secure": false,
    "changeOrigin": true
  }
}
```

Update `angular.json`:
```json
"serve": {
  "builder": "@angular-devkit/build-angular:dev-server",
  "options": {
    "proxyConfig": "proxy.conf.json"
  }
}
```

## Database Schema Management

### Liquibase Changelog Structure
```xml
<!-- db.changelog-master.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<databaseChangeLog
    xmlns="http://www.liquibase.org/xml/ns/dbchangelog"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://www.liquibase.org/xml/ns/dbchangelog
    http://www.liquibase.org/xml/ns/dbchangelog/dbchangelog-latest.xsd">

    <include file="db/changelog/v1.0/001-create-base-tables.xml"/>
    <include file="db/changelog/v1.0/002-create-application-tables.xml"/>
    <include file="db/changelog/v1.0/003-create-deployment-tables.xml"/>
    <!-- Add more as stories are developed -->
    
</databaseChangeLog>
```

### Example Migration File
```xml
<!-- 001-create-base-tables.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<databaseChangeLog
    xmlns="http://www.liquibase.org/xml/ns/dbchangelog"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://www.liquibase.org/xml/ns/dbchangelog
    http://www.liquibase.org/xml/ns/dbchangelog/dbchangelog-latest.xsd">

    <changeSet id="001-create-base-entities" author="ldpv2-team">
        
        <!-- Enable UUID extension -->
        <sql>CREATE EXTENSION IF NOT EXISTS "uuid-ossp";</sql>
        
        <!-- Create Business Unit table -->
        <createTable tableName="business_unit">
            <column name="id" type="UUID" defaultValueComputed="uuid_generate_v4()">
                <constraints primaryKey="true" nullable="false"/>
            </column>
            <column name="name" type="VARCHAR(255)">
                <constraints nullable="false" unique="true"/>
            </column>
            <column name="created_at" type="TIMESTAMP" defaultValueComputed="CURRENT_TIMESTAMP">
                <constraints nullable="false"/>
            </column>
            <column name="updated_at" type="TIMESTAMP" defaultValueComputed="CURRENT_TIMESTAMP">
                <constraints nullable="false"/>
            </column>
        </createTable>

        <!-- Create Environment table -->
        <createTable tableName="environment">
            <column name="id" type="UUID" defaultValueComputed="uuid_generate_v4()">
                <constraints primaryKey="true" nullable="false"/>
            </column>
            <column name="name" type="VARCHAR(100)">
                <constraints nullable="false" unique="true"/>
            </column>
            <column name="description" type="TEXT"/>
            <column name="is_production" type="BOOLEAN" defaultValueBoolean="false">
                <constraints nullable="false"/>
            </column>
            <column name="criticality_level" type="INTEGER"/>
            <column name="created_at" type="TIMESTAMP" defaultValueComputed="CURRENT_TIMESTAMP">
                <constraints nullable="false"/>
            </column>
            <column name="updated_at" type="TIMESTAMP" defaultValueComputed="CURRENT_TIMESTAMP">
                <constraints nullable="false"/>
            </column>
        </createTable>

        <!-- Indexes -->
        <createIndex tableName="environment" indexName="idx_env_is_production">
            <column name="is_production"/>
        </createIndex>
        
    </changeSet>
    
</databaseChangeLog>
```

## Security Configuration

### JWT Token Provider Example
```java
@Component
public class JwtTokenProvider {

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expiration}")
    private long jwtExpiration;

    public String generateToken(Authentication authentication) {
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpiration);

        return Jwts.builder()
                .setSubject(userDetails.getUsername())
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(SignatureAlgorithm.HS512, jwtSecret)
                .compact();
    }

    public String getUsernameFromToken(String token) {
        Claims claims = Jwts.parser()
                .setSigningKey(jwtSecret)
                .parseClaimsJws(token)
                .getBody();
        return claims.getSubject();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser().setSigningKey(jwtSecret).parseClaimsJws(token);
            return true;
        } catch (SignatureException | MalformedJwtException | ExpiredJwtException | 
                 UnsupportedJwtException | IllegalArgumentException ex) {
            return false;
        }
    }
}
```

### Security Configuration Example
```java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(session -> 
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/public/**").permitAll()
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter(), 
                UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:4200"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
```

## API Documentation (OpenAPI/Swagger)

### Configuration
```java
@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI ldpV2OpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("LDPv2 API")
                        .description("Lifecycle Data Platform v2 - Application Management API")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("LDPv2 Team")
                                .email("team@ldpv2.com"))
                        .license(new License()
                                .name("Proprietary")
                                .url("https://ldpv2.com/license")))
                .addSecurityItem(new SecurityRequirement().addList("bearerAuth"))
                .components(new Components()
                        .addSecuritySchemes("bearerAuth",
                                new SecurityScheme()
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")));
    }
}
```

Access Swagger UI at: `http://localhost:8080/swagger-ui/index.html`

## Development Workflow

### Backend Development Cycle
1. Create Liquibase migration
2. Run migration: `mvn liquibase:update`
3. Generate JPA entities
4. Create repository interfaces
5. Implement service layer
6. Create DTOs
7. Implement controller
8. Write tests
9. Document API with Swagger annotations
10. Commit and push

### Frontend Development Cycle
1. Create TypeScript models
2. Implement Angular service
3. Create components (list, detail, form)
4. Add routing
5. Style with CSS/SCSS
6. Write tests
7. Commit and push

## Testing Strategy

### Backend Testing
```java
// Unit Test Example
@ExtendWith(MockitoExtension.class)
class ApplicationServiceTest {
    
    @Mock
    private ApplicationRepository applicationRepository;
    
    @InjectMocks
    private ApplicationService applicationService;
    
    @Test
    void shouldCreateApplication() {
        // Test implementation
    }
}

// Integration Test Example with Testcontainers
@SpringBootTest
@Testcontainers
class ApplicationIntegrationTest {
    
    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");
    
    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }
    
    @Test
    void shouldSaveAndRetrieveApplication() {
        // Test implementation
    }
}
```

### Frontend Testing
```typescript
// Component Unit Test
describe('ApplicationListComponent', () => {
  let component: ApplicationListComponent;
  let fixture: ComponentFixture<ApplicationListComponent>;
  let mockApplicationService: jasmine.SpyObj<ApplicationService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('ApplicationService', ['getApplications']);
    
    await TestBed.configureTestingModule({
      imports: [ApplicationListComponent],
      providers: [
        { provide: ApplicationService, useValue: spy }
      ]
    }).compileComponents();

    mockApplicationService = TestBed.inject(ApplicationService) as jasmine.SpyObj<ApplicationService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
```

## Running the Application

### Development Mode

#### Backend
```bash
# Using Maven
mvn spring-boot:run

# Using Docker Compose
docker-compose up
```

#### Frontend
```bash
# Development server
ng serve

# With proxy
ng serve --proxy-config proxy.conf.json

# Access at http://localhost:4200
```

### Production Build

#### Backend
```bash
mvn clean package
java -jar target/ldpv2-backend-1.0.0.jar
```

#### Frontend
```bash
ng build --configuration production
# Output in dist/ directory
```

## Next Steps

After completing this technical setup:
1. Proceed to Story 0 (Foundation) to build the Walking Skeleton
2. Follow the story sequence for iterative development
3. Maintain test coverage throughout
4. Document APIs as you build
5. Commit frequently with meaningful messages

---

**Document Version**: 1.0  
**Last Updated**: February 2026  
**Status**: Ready for Development
