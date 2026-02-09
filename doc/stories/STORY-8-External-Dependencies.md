# Story 8: External Dependencies Management

## Story Overview

**As an** application manager  
**I want** to track external dependencies for applications  
**So that** I can document and manage all external services, databases, and resources my applications rely on

**Story Type**: Feature (Core Domain)  
**Priority**: High  
**Estimated Effort**: 5-7 days  
**Dependencies**: Story 2 (Applications)

---

## Business Value

External dependencies represent critical integrations and resources that applications rely on. This enables:
- Complete visibility of application dependencies
- Risk assessment and impact analysis
- Dependency lifecycle tracking
- Foundation for data usage agreement management
- Network and security planning

---

## Scope

### In Scope
✅ External dependency CRUD operations  
✅ Dependency type management (catalog)  
✅ Dependency-Application association  
✅ Validity period tracking (start/end dates)  
✅ Dependency documentation and metadata  
✅ Filtering and search capabilities  

### Out of Scope
❌ Data Usage Agreement associations (Story 9)  
❌ Automated dependency detection  
❌ Dependency health monitoring  
❌ Automated alerts for expiring dependencies  

---

## Database Schema

```sql
-- Dependency Types Catalog
CREATE TABLE dependency_type (
    id UUID PRIMARY KEY,
    type_name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

-- External Dependencies
CREATE TABLE external_dependency (
    id UUID PRIMARY KEY,
    application_id UUID NOT NULL REFERENCES application(id) ON DELETE CASCADE,
    dependency_type_id UUID NOT NULL REFERENCES dependency_type(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    technical_documentation TEXT,
    validity_start_date DATE,
    validity_end_date DATE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_dependency_application FOREIGN KEY (application_id) REFERENCES application(id),
    CONSTRAINT fk_dependency_type FOREIGN KEY (dependency_type_id) REFERENCES dependency_type(id),
    CONSTRAINT check_validity_dates CHECK (validity_end_date IS NULL OR validity_end_date >= validity_start_date)
);

-- Indexes
CREATE INDEX idx_ext_dep_application ON external_dependency(application_id);
CREATE INDEX idx_ext_dep_type ON external_dependency(dependency_type_id);
CREATE INDEX idx_ext_dep_validity_end ON external_dependency(validity_end_date);
CREATE INDEX idx_ext_dep_name ON external_dependency(name);

-- Insert default dependency types
INSERT INTO dependency_type (id, type_name, description, created_at, updated_at) VALUES
    (uuid_generate_v4(), 'WEB_SERVICE', 'REST APIs, SOAP services, microservices', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (uuid_generate_v4(), 'DATABASE', 'External database connections', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (uuid_generate_v4(), 'CERTIFICATE', 'SSL/TLS certificates, authentication certificates', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (uuid_generate_v4(), 'NETWORK_FLOW', 'Network connections, firewall rules, VPN tunnels', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
```

---

## Key Business Logic

### Validity Period Management
- **Validity Start Date**: When the dependency becomes available/authorized for use
- **Validity End Date**: When the dependency expires (optional for indefinite dependencies)
- **Active Status**: A dependency is considered "active" if:
  - Current date >= validity_start_date (or no start date)
  - Current date <= validity_end_date (or no end date)

### Expiration Tracking
- Dependencies approaching expiration (within 30 days) should be highlighted
- Expired dependencies (end date in the past) should be flagged
- No validation prevents using expired dependencies (warning only)

---

## Key Endpoints

### Dependency Types (Catalog)
- `GET /api/dependency-types` - List all dependency types
- `GET /api/dependency-types/{id}` - Get dependency type by ID
- `POST /api/dependency-types` - Create custom dependency type (admin only)
- `PUT /api/dependency-types/{id}` - Update dependency type (admin only)
- `DELETE /api/dependency-types/{id}` - Delete dependency type (admin only, if unused)

### External Dependencies
- `GET /api/applications/{appId}/dependencies` - List dependencies for application
- `GET /api/dependencies` - List all dependencies (paginated, filtered)
- `GET /api/dependencies/{id}` - Get dependency details
- `POST /api/applications/{appId}/dependencies` - Create dependency
- `PUT /api/dependencies/{id}` - Update dependency
- `DELETE /api/dependencies/{id}` - Delete dependency
- `GET /api/dependencies/expiring?days={30}` - Get dependencies expiring soon
- `GET /api/dependencies/expired` - Get expired dependencies
- `GET /api/dependencies/by-type/{typeId}` - Filter by dependency type

---

## DTOs

```typescript
export interface DependencyType {
  id: string;
  typeName: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExternalDependency {
  id: string;
  application: { id: string; name: string };
  dependencyType: DependencyType;
  name: string;
  description?: string;
  technicalDocumentation?: string;
  validityStartDate?: Date;
  validityEndDate?: Date;
  isActive: boolean; // Computed based on validity dates
  daysUntilExpiration?: number; // Computed if expiring soon
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateExternalDependencyRequest {
  dependencyTypeId: string;
  name: string;
  description?: string;
  technicalDocumentation?: string;
  validityStartDate?: Date;
  validityEndDate?: Date;
}

export interface UpdateExternalDependencyRequest {
  dependencyTypeId?: string;
  name?: string;
  description?: string;
  technicalDocumentation?: string;
  validityStartDate?: Date;
  validityEndDate?: Date;
}

export interface CreateDependencyTypeRequest {
  typeName: string;
  description?: string;
}
```

---

## Frontend Components

### DependencyTypeManagementComponent (Admin Only)
- Table view of all dependency types
- CRUD operations for custom types
- Default types (WEB_SERVICE, DATABASE, CERTIFICATE, NETWORK_FLOW) cannot be deleted
- Validation: Cannot delete type if dependencies exist

### DependencyListComponent (Application Detail Tab)
- Displayed as tab in Application Detail view
- Table columns: Name, Type, Status (Active/Expiring/Expired), Validity Period, Actions
- Status indicators:
  - **Active**: Green badge (current date within validity period)
  - **Expiring Soon**: Yellow badge (expires within 30 days)
  - **Expired**: Red badge (end date in past)
  - **Not Yet Valid**: Gray badge (start date in future)
- Filter by:
  - Dependency type
  - Status (all, active, expiring, expired)
- Sort by name, type, expiration date
- "Add Dependency" button
- Actions: View, Edit, Delete

### DependencyFormComponent
- Modal or inline form
- Fields:
  - **Dependency Type** (required, dropdown from catalog)
  - **Name** (required, text input)
  - **Description** (optional, textarea)
  - **Technical Documentation** (optional, textarea or rich text)
  - **Validity Start Date** (optional, date picker)
  - **Validity End Date** (optional, date picker)
- Validation:
  - Name required
  - Dependency type required
  - End date must be >= start date
  - Show warning if end date is in the past
  - Show warning if end date is within 30 days
- Support both create and edit modes

### DependencyDetailComponent
- Display full dependency details
- Show status badge (active/expiring/expired)
- Show computed fields:
  - "Days until expiration" if expiring soon
  - "Expired X days ago" if expired
- Show technical documentation (formatted)
- "Edit" and "Delete" buttons
- Link to application
- Future: Link to data usage agreements (Story 9)

### ExpiringDependenciesWidget (Dashboard)
- Widget showing dependencies expiring within 30 days
- Sortable by expiration date
- Click to navigate to dependency detail
- Badge showing count of expiring dependencies

---

## Acceptance Criteria

### Backend
- [ ] Dependency types can be listed
- [ ] Admin can create custom dependency types
- [ ] Default dependency types are seeded in database
- [ ] Dependency type cannot be deleted if dependencies exist
- [ ] External dependency can be created for an application
- [ ] Dependency creation validates application exists
- [ ] Dependency creation validates dependency type exists
- [ ] Validity dates are validated (end >= start)
- [ ] Dependencies can be updated
- [ ] Dependencies can be deleted
- [ ] Dependencies can be listed per application
- [ ] Dependencies can be filtered by type
- [ ] Dependencies can be filtered by status (active/expiring/expired)
- [ ] Expiring dependencies query returns correct results
- [ ] Active status is computed correctly
- [ ] Days until expiration is computed correctly
- [ ] All endpoints authenticated
- [ ] Tests pass (>80% coverage)

### Frontend
- [ ] User can view list of dependencies for an application
- [ ] Dependencies show status badge (active/expiring/expired)
- [ ] User can filter dependencies by type
- [ ] User can filter dependencies by status
- [ ] User can create new dependency
- [ ] Form validates all required fields
- [ ] Form validates date logic (end >= start)
- [ ] Form shows warnings for past or soon expiring dates
- [ ] User can view dependency details
- [ ] User can edit existing dependency
- [ ] User can delete dependency (with confirmation)
- [ ] Expiring dependencies are highlighted
- [ ] Admin can manage dependency types catalog
- [ ] Success/error notifications displayed
- [ ] Tests pass (>70% coverage)

---

## Testing Scenarios

### Scenario 1: Create External Dependency
1. Navigate to Application Detail → Dependencies tab
2. Click "Add Dependency"
3. Fill in form:
   - Type: "WEB_SERVICE"
   - Name: "Payment Gateway API"
   - Description: "External payment processing service"
   - Technical Documentation: "Endpoint: https://api.payment.com/v2"
   - Validity Start: 2026-01-01
   - Validity End: 2027-12-31
4. Click "Save"
5. Verify success notification
6. Verify dependency appears in list with "Active" status (green badge)

### Scenario 2: Expiring Dependency Warning
1. Navigate to Application Detail → Dependencies tab
2. Click "Add Dependency"
3. Fill in form with end date 20 days from today
4. Verify warning message: "This dependency expires in 20 days"
5. Save dependency
6. Verify dependency shows "Expiring Soon" badge (yellow)

### Scenario 3: Expired Dependency
1. Navigate to Application Detail → Dependencies tab
2. Click "Add Dependency"
3. Fill in form with end date in the past
4. Verify warning message: "This dependency has already expired"
5. Save dependency (system allows but warns)
6. Verify dependency shows "Expired" badge (red)

### Scenario 4: Date Validation
1. Create dependency form
2. Set start date: 2027-01-01
3. Set end date: 2026-01-01 (before start)
4. Attempt to save
5. Verify error: "End date must be after start date"

### Scenario 5: Filter Dependencies
1. Navigate to Application Detail → Dependencies tab
2. Create dependencies of different types
3. Filter by type: "DATABASE"
4. Verify only database dependencies shown
5. Filter by status: "Expiring"
6. Verify only expiring dependencies shown

### Scenario 6: Manage Dependency Types (Admin)
1. Login as admin
2. Navigate to Settings → Dependency Types
3. Click "Create Custom Type"
4. Name: "CLOUD_SERVICE"
5. Description: "Cloud service providers and SaaS platforms"
6. Save
7. Verify new type appears in catalog
8. Verify new type available in dependency creation form

### Scenario 7: Delete Dependency Type Protection
1. Login as admin
2. Navigate to Settings → Dependency Types
3. Attempt to delete "WEB_SERVICE" (has dependencies)
4. Verify error: "Cannot delete dependency type with existing dependencies"
5. Create new unused type
6. Delete it
7. Verify successful deletion

### Scenario 8: View Expiring Dependencies Dashboard
1. Navigate to main dashboard
2. View "Expiring Dependencies" widget
3. Verify list shows dependencies expiring within 30 days
4. Verify sorted by expiration date (soonest first)
5. Click on dependency
6. Verify navigation to dependency detail

---

## Integration Points

### Application Detail Enhancement
Add "Dependencies" tab showing:
- List of all external dependencies
- Status overview (count by status)
- "Add Dependency" button
- Filter and search controls

### Dashboard Enhancement (Optional for Story 8)
Add widget showing:
- Expiring dependencies count
- Top 5 dependencies expiring soonest
- Link to full list

---

## Performance Considerations

- [ ] Index on application_id for fast dependency lookup per application
- [ ] Index on validity_end_date for expiring/expired queries
- [ ] Index on dependency_type_id for type filtering
- [ ] Compute active status and days until expiration in service layer (not stored)
- [ ] Pagination for dependency lists (can grow large)

---

## Future Enhancements (Phase 3)

- [ ] Automated dependency scanning/detection
- [ ] Dependency health monitoring
- [ ] Automated email alerts for expiring dependencies
- [ ] Dependency impact analysis (which apps depend on this service)
- [ ] Dependency renewal workflow
- [ ] Integration with certificate management tools
- [ ] Network diagram visualization
- [ ] Bulk import of dependencies from CSV

---

**Story Status**: Ready for Development  
**Estimated Completion**: 5-7 days
