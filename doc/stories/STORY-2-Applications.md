# Story 2: Application Management

## Story Overview

**As a** application manager  
**I want** to manage applications in the system  
**So that** I can track all applications and their lifecycle status

**Story Type**: Feature (Core Domain)  
**Priority**: Highest  
**Estimated Effort**: 5-7 days  
**Dependencies**: Story 1 (Business Units)

---

## Business Value

Applications are the central entity in LDPv2. This story enables:
- Complete application inventory
- Lifecycle status tracking (IDEA → IN_DEVELOPMENT → IN_SERVICE → MAINTENANCE → DECOMMISSIONED)
- Business unit ownership
- Foundation for deployment tracking (Story 6)
- End-of-life and support tracking

---

## Scope

### In Scope
✅ Application CRUD operations  
✅ Lifecycle status management  
✅ Business unit association  
✅ End-of-life and end-of-support date tracking  
✅ Application search and filtering  
✅ Status-based filtering  

### Out of Scope
❌ Version management (Story 5)  
❌ Deployment tracking (Story 6)  
❌ Contact/stakeholder management (Story 3)  
❌ SLA management (Phase 2)  
❌ Technical documentation (Phase 2)  
❌ External dependencies (Phase 2)  

---

## Technical Implementation

### Backend Tasks

#### 1. Database Migration
- [ ] Create Liquibase migration: `004-create-application-tables.xml`
- [ ] Create `application` table:
  ```sql
  - id (UUID, PK)
  - name (VARCHAR(255), not null)
  - description (TEXT, nullable)
  - status (VARCHAR(50), not null) -- IDEA, IN_DEVELOPMENT, IN_SERVICE, MAINTENANCE, DECOMMISSIONED
  - business_unit_id (UUID, FK to business_unit, not null)
  - end_of_life_date (DATE, nullable)
  - end_of_support_date (DATE, nullable)
  - created_at (TIMESTAMP, not null)
  - updated_at (TIMESTAMP, not null)
  ```
- [ ] Add indexes:
  - `idx_application_status` on status
  - `idx_application_business_unit` on business_unit_id
  - `idx_application_name` on name (for search)
- [ ] Add foreign key constraint: `business_unit_id` → `business_unit(id)`
- [ ] Insert sample data (5-10 applications with various statuses)

#### 2. Enum
- [ ] Create `ApplicationStatus` enum:
  ```java
  public enum ApplicationStatus {
      IDEA("Idea"),
      IN_DEVELOPMENT("In Development"),
      IN_SERVICE("In Service"),
      MAINTENANCE("Maintenance"),
      DECOMMISSIONED("Decommissioned");
      
      private final String displayName;
      // Constructor, getter
  }
  ```

#### 3. JPA Entity
- [ ] Create `Application` entity extending `BaseEntity`:
  ```java
  @Entity
  @Table(name = "application")
  public class Application extends BaseEntity {
      @Column(nullable = false)
      private String name;
      
      @Column(columnDefinition = "TEXT")
      private String description;
      
      @Enumerated(EnumType.STRING)
      @Column(nullable = false, length = 50)
      private ApplicationStatus status;
      
      @ManyToOne(fetch = FetchType.LAZY)
      @JoinColumn(name = "business_unit_id", nullable = false)
      private BusinessUnit businessUnit;
      
      @Column(name = "end_of_life_date")
      private LocalDate endOfLifeDate;
      
      @Column(name = "end_of_support_date")
      private LocalDate endOfSupportDate;
      
      // Getters, setters, constructors
  }
  ```

#### 4. Repository Layer
- [ ] Create `ApplicationRepository`:
  ```java
  public interface ApplicationRepository extends JpaRepository<Application, UUID> {
      Page<Application> findByStatus(ApplicationStatus status, Pageable pageable);
      Page<Application> findByBusinessUnitId(UUID businessUnitId, Pageable pageable);
      Page<Application> findByNameContainingIgnoreCase(String name, Pageable pageable);
      Page<Application> findByStatusAndBusinessUnitId(ApplicationStatus status, UUID businessUnitId, Pageable pageable);
      
      @Query("SELECT a FROM Application a WHERE " +
             "(:status IS NULL OR a.status = :status) AND " +
             "(:businessUnitId IS NULL OR a.businessUnit.id = :businessUnitId) AND " +
             "(:name IS NULL OR LOWER(a.name) LIKE LOWER(CONCAT('%', :name, '%')))")
      Page<Application> search(
          @Param("status") ApplicationStatus status,
          @Param("businessUnitId") UUID businessUnitId,
          @Param("name") String name,
          Pageable pageable
      );
  }
  ```

#### 5. DTOs
- [ ] Create `CreateApplicationRequest`:
  - `name` (required, max 255 chars)
  - `description` (optional)
  - `status` (required, default: IDEA)
  - `businessUnitId` (required, UUID)
  - `endOfLifeDate` (optional, LocalDate)
  - `endOfSupportDate` (optional, LocalDate)
- [ ] Create `UpdateApplicationRequest`:
  - All fields optional (partial update support)
- [ ] Create `ApplicationResponse`:
  - `id`, `name`, `description`, `status`, `businessUnit` (summary), `endOfLifeDate`, `endOfSupportDate`, `createdAt`, `updatedAt`
- [ ] Create `ApplicationSummaryResponse` (for lists):
  - `id`, `name`, `status`, `businessUnitName`
- [ ] Create `BusinessUnitSummaryDto`:
  - `id`, `name`

#### 6. Service Layer
- [ ] Create `ApplicationService` with methods:
  ```java
  ApplicationResponse create(CreateApplicationRequest request);
  ApplicationResponse update(UUID id, UpdateApplicationRequest request);
  ApplicationResponse findById(UUID id);
  Page<ApplicationResponse> findAll(Pageable pageable);
  Page<ApplicationResponse> search(ApplicationStatus status, UUID businessUnitId, String name, Pageable pageable);
  Page<ApplicationResponse> findByStatus(ApplicationStatus status, Pageable pageable);
  Page<ApplicationResponse> findByBusinessUnit(UUID businessUnitId, Pageable pageable);
  void delete(UUID id);
  ApplicationResponse updateStatus(UUID id, ApplicationStatus newStatus);
  ```
- [ ] Implement business logic:
  - Validate business unit exists on create/update
  - Validate end-of-support date is before end-of-life date
  - Throw exceptions for invalid states
  - Map entities to DTOs (consider using MapStruct or ModelMapper)

#### 7. Controller Layer
- [ ] Create `ApplicationController` with endpoints:
  ```java
  GET    /api/applications                    - List all (with filters)
  GET    /api/applications/search             - Advanced search
  GET    /api/applications/{id}               - Get by ID
  POST   /api/applications                    - Create new
  PUT    /api/applications/{id}               - Update
  PATCH  /api/applications/{id}/status        - Update status only
  DELETE /api/applications/{id}               - Delete
  GET    /api/applications/by-status/{status} - Filter by status
  GET    /api/applications/by-business-unit/{businessUnitId} - Filter by BU
  ```
- [ ] Add query parameters for filtering:
  - `status`: Filter by status
  - `businessUnitId`: Filter by business unit
  - `name`: Search by name
  - `page`, `size`, `sort`: Pagination
- [ ] Add validation annotations
- [ ] Add Swagger/OpenAPI annotations
- [ ] Add security: require authentication

#### 8. Testing
- [ ] Unit tests for `ApplicationService`:
  - Test create application
  - Test create with invalid business unit (should fail)
  - Test update application
  - Test update status
  - Test search with various filters
  - Test validation (end-of-support before end-of-life)
- [ ] Integration tests for `ApplicationController`:
  - Test full CRUD flow
  - Test filtering by status
  - Test filtering by business unit
  - Test search functionality
  - Test pagination and sorting
  - Test error cases (404, 400)
- [ ] Test coverage > 80%

---

### Frontend Tasks

#### 1. Models
- [ ] Create `application.model.ts`:
  ```typescript
  export enum ApplicationStatus {
    IDEA = 'IDEA',
    IN_DEVELOPMENT = 'IN_DEVELOPMENT',
    IN_SERVICE = 'IN_SERVICE',
    MAINTENANCE = 'MAINTENANCE',
    DECOMMISSIONED = 'DECOMMISSIONED'
  }
  
  export interface Application {
    id: string;
    name: string;
    description?: string;
    status: ApplicationStatus;
    businessUnit: { id: string; name: string };
    endOfLifeDate?: Date;
    endOfSupportDate?: Date;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface CreateApplicationRequest {
    name: string;
    description?: string;
    status: ApplicationStatus;
    businessUnitId: string;
    endOfLifeDate?: Date;
    endOfSupportDate?: Date;
  }
  
  export interface UpdateApplicationRequest {
    name?: string;
    description?: string;
    status?: ApplicationStatus;
    businessUnitId?: string;
    endOfLifeDate?: Date;
    endOfSupportDate?: Date;
  }
  ```

#### 2. Service
- [ ] Create `application.service.ts`:
  ```typescript
  @Injectable({ providedIn: 'root' })
  export class ApplicationService {
    getApplications(filters?, page?, size?, sort?): Observable<Page<Application>>
    searchApplications(criteria): Observable<Page<Application>>
    getApplication(id): Observable<Application>
    createApplication(data): Observable<Application>
    updateApplication(id, data): Observable<Application>
    updateStatus(id, status): Observable<Application>
    deleteApplication(id): Observable<void>
  }
  ```

#### 3. Components

##### ApplicationListComponent
- [ ] Create component with template and styles
- [ ] Features:
  - Table view with columns: Name, Status, Business Unit, End of Life, Actions
  - Status badge with color coding:
    - IDEA: blue
    - IN_DEVELOPMENT: yellow
    - IN_SERVICE: green
    - MAINTENANCE: orange
    - DECOMMISSIONED: gray
  - Filters:
    - Status dropdown (All, IDEA, IN_DEVELOPMENT, IN_SERVICE, MAINTENANCE, DECOMMISSIONED)
    - Business unit dropdown (All + list of BUs)
    - Search by name
  - Pagination controls (20 items per page)
  - Sort by name, status, created date
  - "Create New Application" button
  - Actions per row: View, Edit, Delete, Change Status
- [ ] Implement logic:
  - Load applications on init
  - Apply filters reactively
  - Handle pagination and sorting
  - Handle search with debounce
  - Quick status change dropdown
  - Navigate to detail/form pages
  - Handle delete with confirmation

##### ApplicationDetailComponent
- [ ] Create component with template and styles
- [ ] Features:
  - Display all application details
  - Status badge (colored)
  - Business unit link (navigate to BU detail)
  - Show end-of-life and end-of-support dates (highlight if approaching)
  - "Edit" button
  - "Change Status" dropdown
  - "Delete" button
  - "Back to List" button
  - Tabs (for future: Versions, Deployments, Contacts)
- [ ] Load application by ID from route params
- [ ] Reload on status change

##### ApplicationFormComponent
- [ ] Create component with template and styles
- [ ] Reactive form with fields:
  - Name (required, max 255 chars)
  - Description (optional, textarea)
  - Status (required, dropdown)
  - Business Unit (required, dropdown - load from API)
  - End of Life Date (optional, date picker)
  - End of Support Date (optional, date picker)
- [ ] Form validation:
  - Name required
  - Status required
  - Business unit required
  - End of support date must be before end of life date
  - Show validation errors
- [ ] Support both create and edit modes
- [ ] Handle form submission
- [ ] "Cancel" button

#### 4. Shared Components
- [ ] Create `StatusBadgeComponent`:
  - Input: status (ApplicationStatus)
  - Display colored badge based on status
  - Reusable across application views

#### 5. Routing
- [ ] Add routes:
  ```typescript
  {
    path: 'applications',
    canActivate: [AuthGuard],
    children: [
      { path: '', component: ApplicationListComponent },
      { path: 'new', component: ApplicationFormComponent },
      { path: ':id', component: ApplicationDetailComponent },
      { path: ':id/edit', component: ApplicationFormComponent }
    ]
  }
  ```

#### 6. Navigation
- [ ] Add "Applications" link to header/sidebar (prominent position)

#### 7. Testing
- [ ] Unit tests for `ApplicationService`
- [ ] Component tests for `ApplicationListComponent`:
  - Test rendering
  - Test filters (status, business unit, search)
  - Test pagination
  - Test status change
- [ ] Component tests for `ApplicationFormComponent`:
  - Test form validation
  - Test date validation (end-of-support before end-of-life)
  - Test create and edit modes
- [ ] E2E tests:
  - Create application flow
  - Edit application flow
  - Change status flow
  - Filter and search flow
- [ ] Test coverage > 70%

---

## Acceptance Criteria

### Backend
- [ ] Application can be created with all required fields
- [ ] Application creation fails if business unit doesn't exist
- [ ] Application can be updated (partial updates supported)
- [ ] Application status can be updated independently
- [ ] Application can be deleted
- [ ] Applications can be listed with pagination
- [ ] Applications can be filtered by status
- [ ] Applications can be filtered by business unit
- [ ] Applications can be searched by name
- [ ] Advanced search combines multiple filters
- [ ] End-of-support date validation (must be before end-of-life)
- [ ] All endpoints authenticated
- [ ] API documented in Swagger

### Frontend
- [ ] User can view list of all applications
- [ ] List shows application name, status, business unit
- [ ] Status is displayed with colored badge
- [ ] User can filter applications by status
- [ ] User can filter applications by business unit
- [ ] User can search applications by name
- [ ] Filters work together (combined)
- [ ] List supports pagination and sorting
- [ ] User can create new application
- [ ] Form validates all required fields
- [ ] Form validates date logic (end-of-support before end-of-life)
- [ ] User can view application details
- [ ] User can edit existing application
- [ ] User can change application status from list or detail view
- [ ] User can delete application (with confirmation)
- [ ] Approaching end-of-life dates are highlighted
- [ ] Success/error notifications displayed
- [ ] Navigation is intuitive

### Testing
- [ ] Backend tests pass (>80% coverage)
- [ ] Frontend tests pass (>70% coverage)
- [ ] E2E tests pass

---

## Testing Scenarios

### Scenario 1: Create Application
1. Navigate to applications list
2. Click "Create New Application"
3. Fill in form:
   - Name: "Customer Portal"
   - Description: "External customer-facing portal"
   - Status: IN_DEVELOPMENT
   - Business Unit: Select "Digital Services"
   - End of Support: 2028-12-31
   - End of Life: 2030-12-31
4. Click "Save"
5. Verify success notification
6. Verify redirect to application list
7. Verify new application appears with IN_DEVELOPMENT badge (yellow)

### Scenario 2: Filter Applications
1. Navigate to applications list
2. Select status filter: "IN_SERVICE"
3. Verify only IN_SERVICE applications shown
4. Select business unit filter: "Digital Services"
5. Verify only IN_SERVICE applications from Digital Services shown
6. Clear filters
7. Verify all applications shown

### Scenario 3: Search Applications
1. Navigate to applications list
2. Enter search query: "portal"
3. Wait for debounce
4. Verify results contain only matching applications
5. Clear search
6. Verify all applications shown

### Scenario 4: Change Application Status
1. Navigate to applications list
2. Click "Change Status" dropdown on an application
3. Select new status: "IN_SERVICE"
4. Verify success notification
5. Verify status badge updated to green
6. Refresh page
7. Verify status persisted

### Scenario 5: Edit Application
1. Navigate to application detail page
2. Click "Edit"
3. Modify description and end-of-life date
4. Click "Save"
5. Verify success notification
6. Verify changes reflected in detail view

### Scenario 6: Date Validation
1. Navigate to create/edit application form
2. Set End of Support: 2030-12-31
3. Set End of Life: 2028-12-31 (before end-of-support)
4. Attempt to save
5. Verify validation error: "End of support must be before end of life"
6. Correct dates
7. Verify form can be saved

### Scenario 7: Delete Application
1. Navigate to application detail page
2. Click "Delete"
3. Confirm deletion
4. Verify success notification
5. Verify redirect to application list
6. Verify application removed from list

---

## Definition of Done

- [ ] All backend tasks completed
- [ ] All frontend tasks completed
- [ ] All acceptance criteria met
- [ ] All tests passing (unit, integration, E2E)
- [ ] Code reviewed and approved
- [ ] API documented in Swagger
- [ ] User can perform all operations via UI
- [ ] Demo conducted successfully
- [ ] Code merged to main branch

---

## Technical Debt & Future Improvements

### Known Limitations
- No application archiving (only hard delete)
- No status change audit trail
- No automated end-of-life notifications
- No application tags/categories

### Future Enhancements
- Implement soft delete with archiving
- Add status change history/audit log
- Add automated alerts for approaching end-of-life
- Add tagging system for categorization
- Add application relationships (depends on, integrates with)
- Add bulk status updates
- Add export to Excel/CSV

---

## Dependencies & Blockers

### Dependencies
- Story 1 (Business Units) must be complete

### Potential Blockers
- None identified

---

**Story Status**: Ready for Development  
**Story Created**: February 2026  
**Estimated Completion**: 5-7 days from start
