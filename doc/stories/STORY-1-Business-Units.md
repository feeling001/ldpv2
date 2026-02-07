# Story 1: Business Unit Management

## Story Overview

**As a** system administrator  
**I want** to manage business units in the system  
**So that** I can organize applications under their respective organizational units

**Story Type**: Feature  
**Priority**: High  
**Estimated Effort**: 3-5 days  
**Dependencies**: Story 0 (Foundation)

---

## Business Value

Business units represent the organizational structure within which applications are managed. This story enables:
- Clear organizational hierarchy
- Application ownership mapping
- Contact management at the business unit level
- Foundation for multi-tenant capabilities

---

## Scope

### In Scope
✅ Business unit CRUD operations  
✅ Business unit listing with search/filter  
✅ Basic contact association (simplified for MVP)  
✅ Validation (unique names, required fields)  

### Out of Scope
❌ Complex hierarchical business units (parent/child relationships)  
❌ Full contact management (covered in Story 3)  
❌ Business unit-specific permissions  
❌ Bulk import of business units  

---

## Technical Implementation

### Backend Tasks

#### 1. Database Migration
- [ ] Create Liquibase migration file: `003-create-business-unit-tables.xml`
- [ ] Create `business_unit` table:
  ```sql
  - id (UUID, PK)
  - name (VARCHAR(255), unique, not null)
  - description (TEXT, nullable)
  - created_at (TIMESTAMP, not null)
  - updated_at (TIMESTAMP, not null)
  ```
- [ ] Add index on `name` for search performance
- [ ] Insert sample data (3-5 business units) for testing

#### 2. JPA Entity
- [ ] Create `BusinessUnit` entity extending `BaseEntity`
  ```java
  @Entity
  @Table(name = "business_unit")
  public class BusinessUnit extends BaseEntity {
      @Column(nullable = false, unique = true)
      private String name;
      
      @Column(columnDefinition = "TEXT")
      private String description;
      
      // Getters, setters, constructors
  }
  ```

#### 3. Repository Layer
- [ ] Create `BusinessUnitRepository` interface
  ```java
  public interface BusinessUnitRepository extends JpaRepository<BusinessUnit, UUID> {
      Optional<BusinessUnit> findByName(String name);
      boolean existsByName(String name);
      Page<BusinessUnit> findByNameContainingIgnoreCase(String name, Pageable pageable);
  }
  ```

#### 4. DTOs
- [ ] Create `CreateBusinessUnitRequest`:
  - `name` (required, max 255 chars)
  - `description` (optional)
- [ ] Create `UpdateBusinessUnitRequest`:
  - `name` (optional, max 255 chars)
  - `description` (optional)
- [ ] Create `BusinessUnitResponse`:
  - `id`, `name`, `description`, `createdAt`, `updatedAt`
- [ ] Create `BusinessUnitSummaryResponse` (for lists):
  - `id`, `name`

#### 5. Service Layer
- [ ] Create `BusinessUnitService` with methods:
  ```java
  BusinessUnitResponse create(CreateBusinessUnitRequest request);
  BusinessUnitResponse update(UUID id, UpdateBusinessUnitRequest request);
  BusinessUnitResponse findById(UUID id);
  Page<BusinessUnitResponse> findAll(Pageable pageable);
  Page<BusinessUnitResponse> search(String query, Pageable pageable);
  void delete(UUID id);
  ```
- [ ] Implement business logic:
  - Check uniqueness of name on create/update
  - Throw `ResourceNotFoundException` if not found
  - Throw `BadRequestException` for duplicate names
- [ ] Add validation for required fields

#### 6. Controller Layer
- [ ] Create `BusinessUnitController` with endpoints:
  ```java
  GET    /api/business-units              - List all (paginated)
  GET    /api/business-units/search?q={query} - Search by name
  GET    /api/business-units/{id}         - Get by ID
  POST   /api/business-units              - Create new
  PUT    /api/business-units/{id}         - Update
  DELETE /api/business-units/{id}         - Delete
  ```
- [ ] Add validation annotations (`@Valid`, `@NotNull`, etc.)
- [ ] Add Swagger/OpenAPI annotations
- [ ] Add security: require authentication for all endpoints

#### 7. Testing
- [ ] Unit tests for `BusinessUnitService`:
  - Test create with valid data
  - Test create with duplicate name (should fail)
  - Test update existing business unit
  - Test delete business unit
  - Test search functionality
- [ ] Integration tests for `BusinessUnitController`:
  - Test full CRUD flow
  - Test pagination and sorting
  - Test search with various queries
  - Test error cases (404, 400)
- [ ] Test coverage > 80%

---

### Frontend Tasks

#### 1. Models
- [ ] Create `business-unit.model.ts`:
  ```typescript
  export interface BusinessUnit {
    id: string;
    name: string;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface BusinessUnitSummary {
    id: string;
    name: string;
  }
  
  export interface CreateBusinessUnitRequest {
    name: string;
    description?: string;
  }
  
  export interface UpdateBusinessUnitRequest {
    name?: string;
    description?: string;
  }
  ```

#### 2. Service
- [ ] Create `business-unit.service.ts`:
  ```typescript
  @Injectable({ providedIn: 'root' })
  export class BusinessUnitService {
    getBusinessUnits(page, size, sort): Observable<Page<BusinessUnit>>
    searchBusinessUnits(query, page, size): Observable<Page<BusinessUnit>>
    getBusinessUnit(id): Observable<BusinessUnit>
    createBusinessUnit(data): Observable<BusinessUnit>
    updateBusinessUnit(id, data): Observable<BusinessUnit>
    deleteBusinessUnit(id): Observable<void>
  }
  ```

#### 3. Components

##### BusinessUnitListComponent
- [ ] Create component with template and styles
- [ ] Features:
  - Table/list view of business units
  - Columns: Name, Description, Actions
  - Pagination controls (page size: 20)
  - Sort by name
  - Search bar (filter by name)
  - "Create New" button
  - Actions per row: View, Edit, Delete
- [ ] Implement component logic:
  - Load business units on init
  - Handle pagination events
  - Handle sort events
  - Handle search with debounce (300ms)
  - Navigate to detail/form pages
  - Handle delete with confirmation

##### BusinessUnitDetailComponent
- [ ] Create component with template and styles
- [ ] Features:
  - Display all business unit details
  - "Edit" button
  - "Delete" button
  - "Back to List" button
  - Show created/updated timestamps
- [ ] Load business unit by ID from route params

##### BusinessUnitFormComponent
- [ ] Create component with template and styles
- [ ] Reactive form with fields:
  - Name (required, max 255 chars)
  - Description (optional, textarea)
- [ ] Form validation:
  - Name required
  - Max length validation
  - Show validation errors
- [ ] Support both create and edit modes (based on route)
- [ ] Handle form submission:
  - Call appropriate service method
  - Show loading indicator during save
  - Navigate to list on success
  - Show error notification on failure
- [ ] "Cancel" button (navigate back)

#### 4. Routing
- [ ] Add routes to `app.routes.ts`:
  ```typescript
  {
    path: 'business-units',
    canActivate: [AuthGuard],
    children: [
      { path: '', component: BusinessUnitListComponent },
      { path: 'new', component: BusinessUnitFormComponent },
      { path: ':id', component: BusinessUnitDetailComponent },
      { path: ':id/edit', component: BusinessUnitFormComponent }
    ]
  }
  ```

#### 5. Navigation
- [ ] Add "Business Units" link to header/sidebar navigation

#### 6. Testing
- [ ] Unit tests for `BusinessUnitService`
- [ ] Component tests for `BusinessUnitListComponent`:
  - Test rendering of business units
  - Test pagination
  - Test search
  - Test navigation to create/edit/detail
- [ ] Component tests for `BusinessUnitFormComponent`:
  - Test form validation
  - Test create mode
  - Test edit mode
  - Test form submission
- [ ] E2E test: Full CRUD flow
- [ ] Test coverage > 70%

---

## Acceptance Criteria

### Backend
- [ ] Business unit can be created with unique name
- [ ] Duplicate business unit names are rejected with 400 error
- [ ] Business unit can be updated
- [ ] Business unit can be deleted
- [ ] Business units can be listed with pagination
- [ ] Business units can be searched by name (case-insensitive)
- [ ] All endpoints are authenticated
- [ ] All endpoints return proper HTTP status codes
- [ ] API is documented in Swagger

### Frontend
- [ ] User can view list of all business units
- [ ] List supports pagination (20 items per page)
- [ ] User can search business units by name
- [ ] Search has debounce (doesn't query on every keystroke)
- [ ] User can create new business unit
- [ ] Form validates required fields
- [ ] User cannot create duplicate business unit names
- [ ] User can view business unit details
- [ ] User can edit existing business unit
- [ ] User can delete business unit (with confirmation)
- [ ] Success/error notifications are displayed
- [ ] Navigation is intuitive and works correctly

### Testing
- [ ] Backend unit tests pass (>80% coverage)
- [ ] Backend integration tests pass
- [ ] Frontend unit tests pass (>70% coverage)
- [ ] E2E tests pass

---

## Testing Scenarios

### Scenario 1: Create Business Unit
1. Navigate to business units list
2. Click "Create New Business Unit"
3. Fill in form:
   - Name: "Digital Services"
   - Description: "Digital transformation initiatives"
4. Click "Save"
5. Verify success notification
6. Verify redirect to business unit list
7. Verify new business unit appears in list

### Scenario 2: Duplicate Name Prevention
1. Navigate to create business unit form
2. Enter name of existing business unit
3. Click "Save"
4. Verify error message: "Business unit with this name already exists"
5. Verify business unit is not created

### Scenario 3: Edit Business Unit
1. Navigate to business units list
2. Click "Edit" on a business unit
3. Modify description
4. Click "Save"
5. Verify success notification
6. Verify changes are reflected in detail view

### Scenario 4: Delete Business Unit
1. Navigate to business units list
2. Click "Delete" on a business unit
3. Confirm deletion in dialog
4. Verify success notification
5. Verify business unit is removed from list

### Scenario 5: Search Business Units
1. Navigate to business units list
2. Enter search query: "digital"
3. Wait for debounce (300ms)
4. Verify filtered results contain only matching business units
5. Clear search
6. Verify all business units are shown again

### Scenario 6: Pagination
1. Create 25+ business units (if not exists)
2. Navigate to business units list
3. Verify only 20 items shown on page 1
4. Click "Next page"
5. Verify remaining items shown on page 2
6. Click "Previous page"
7. Verify back to page 1

---

## Definition of Done

- [ ] All backend tasks completed
- [ ] All frontend tasks completed
- [ ] All acceptance criteria met
- [ ] All tests passing (unit, integration, E2E)
- [ ] Code reviewed and approved
- [ ] API documented in Swagger
- [ ] User can perform all CRUD operations via UI
- [ ] Demo conducted successfully
- [ ] Code merged to main branch

---

## Technical Debt & Future Improvements

### Known Limitations
- No hierarchical business units (flat structure only)
- No business unit deactivation (only hard delete)
- No audit trail for changes
- No bulk operations

### Future Enhancements
- Add parent-child relationships between business units
- Implement soft delete with deactivation flag
- Add audit logging for business unit changes
- Add bulk import from CSV/Excel
- Add business unit-specific settings
- Implement business unit archiving

---

## Dependencies & Blockers

### Dependencies
- Story 0 (Foundation) must be complete

### Potential Blockers
- None identified

---

## API Specification

### Endpoints

#### GET /api/business-units
**Description**: List all business units  
**Query Parameters**:
- `page` (default: 0)
- `size` (default: 20)
- `sort` (default: name,asc)

**Response**: `200 OK`
```json
{
  "content": [
    {
      "id": "uuid",
      "name": "Digital Services",
      "description": "Digital transformation initiatives",
      "createdAt": "2026-02-01T10:00:00Z",
      "updatedAt": "2026-02-01T10:00:00Z"
    }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 20,
    "sort": { "sorted": true, "unsorted": false }
  },
  "totalElements": 5,
  "totalPages": 1
}
```

#### GET /api/business-units/search
**Description**: Search business units by name  
**Query Parameters**:
- `q` (search query)
- `page`, `size`, `sort`

**Response**: Same as GET /api/business-units

#### GET /api/business-units/{id}
**Description**: Get business unit by ID  
**Response**: `200 OK`
```json
{
  "id": "uuid",
  "name": "Digital Services",
  "description": "Digital transformation initiatives",
  "createdAt": "2026-02-01T10:00:00Z",
  "updatedAt": "2026-02-01T10:00:00Z"
}
```
**Error**: `404 Not Found` if business unit doesn't exist

#### POST /api/business-units
**Description**: Create new business unit  
**Request Body**:
```json
{
  "name": "Digital Services",
  "description": "Digital transformation initiatives"
}
```
**Response**: `201 Created`
```json
{
  "id": "uuid",
  "name": "Digital Services",
  "description": "Digital transformation initiatives",
  "createdAt": "2026-02-01T10:00:00Z",
  "updatedAt": "2026-02-01T10:00:00Z"
}
```
**Errors**:
- `400 Bad Request` if name is duplicate or validation fails
- `401 Unauthorized` if not authenticated

#### PUT /api/business-units/{id}
**Description**: Update business unit  
**Request Body**:
```json
{
  "name": "Digital Services",
  "description": "Updated description"
}
```
**Response**: `200 OK` (same format as POST)
**Errors**:
- `404 Not Found` if business unit doesn't exist
- `400 Bad Request` if validation fails

#### DELETE /api/business-units/{id}
**Description**: Delete business unit  
**Response**: `204 No Content`  
**Error**: `404 Not Found` if business unit doesn't exist

---

**Story Status**: Ready for Development  
**Story Created**: February 2026  
**Estimated Completion**: 3-5 days from start
