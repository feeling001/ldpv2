# Story 8: External Dependencies - Deployment Notes

## Files Created

### Backend
- Database migration: `009-create-external-dependency-tables.xml`
- Entities: `DependencyType.java`, `ExternalDependency.java`
- Repositories: `DependencyTypeRepository.java`, `ExternalDependencyRepository.java`
- Services: `DependencyTypeService.java`, `ExternalDependencyService.java`
- Controllers: `DependencyTypeController.java`, `ExternalDependencyController.java`
- DTOs: Request and Response classes for both entities
- Updated: `db.changelog-master.xml`

### Frontend
- Models: `dependency.model.ts`
- Service: `dependency.service.ts`
- Components:
  - `application-dependencies` (tab in application detail)
  - `dependency-list` (full list page)
  - `dependency-form` (create/edit)
  - `dependency-detail` (view details)
  - `dependency-type-list` (admin catalog management)

## Deployment Steps

1. Copy all backend files to their respective locations
2. Run Liquibase migration: `mvn liquibase:update`
3. Build backend: `mvn clean package`
4. Copy frontend files
5. Install dependencies: `npm install` (if needed)
6. Build frontend: `ng build`

## Testing Checklist

- [ ] Default dependency types seeded
- [ ] Create custom dependency type (admin)
- [ ] Create external dependency
- [ ] Validate date logic
- [ ] Filter by type and status
- [ ] View expiring dependencies
- [ ] Update dependency
- [ ] Delete dependency
- [ ] Cannot delete type with dependencies

## API Endpoints

See Swagger UI at: http://localhost:8080/api/swagger-ui.html

Key endpoints:
- GET /api/dependency-types
- POST /api/dependency-types (admin)
- GET /api/dependencies
- POST /api/dependencies/for-application/{id}
- GET /api/dependencies/expiring?days=30
- GET /api/dependencies/expired
