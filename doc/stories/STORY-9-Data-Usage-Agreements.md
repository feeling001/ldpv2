# Story 9: Data Usage Agreements Management

## Story Overview

**As a** compliance officer  
**I want** to track data usage agreements for external dependencies  
**So that** I can ensure legal compliance and proper authorization for data usage

**Story Type**: Feature (Compliance & Governance)  
**Priority**: High  
**Estimated Effort**: 4-6 days  
**Dependencies**: Story 8 (External Dependencies), Story 3 (Contacts)

---

## Business Value

Data Usage Agreements formalize the authorization to use external data sources and services. This enables:
- Legal compliance tracking
- Data governance documentation
- Authorization management per dependency
- Contact responsibility tracking
- Data lineage documentation
- Agreement lifecycle management

---

## Scope

### In Scope
✅ Data Usage Agreement CRUD operations  
✅ Agreement-Dependency associations (many-to-many)  
✅ Agreement-Contact associations (who authorized)  
✅ Validity period tracking  
✅ Data nature and lineage documentation  
✅ Agreement expiration tracking  
✅ Search and filtering capabilities  

### Out of Scope
❌ Automated agreement renewal workflows  
❌ Digital signature integration  
❌ Document management system integration  
❌ Automated compliance reporting  

---

## Database Schema

```sql
-- Data Usage Agreements
CREATE TABLE data_usage_agreement (
    id UUID PRIMARY KEY,
    data_nature TEXT NOT NULL,
    data_lineage_url VARCHAR(500),
    documentation_url VARCHAR(500),
    validity_start_date DATE NOT NULL,
    validity_end_date DATE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT check_dua_validity_dates CHECK (validity_end_date IS NULL OR validity_end_date >= validity_start_date)
);

-- Junction table: Data Usage Agreement to External Dependency (many-to-many)
CREATE TABLE agreement_dependency (
    agreement_id UUID NOT NULL REFERENCES data_usage_agreement(id) ON DELETE CASCADE,
    dependency_id UUID NOT NULL REFERENCES external_dependency(id) ON DELETE CASCADE,
    PRIMARY KEY (agreement_id, dependency_id)
);

-- Junction table: Data Usage Agreement to Contact (many-to-many)
-- These are the contacts who authorized the agreement
CREATE TABLE agreement_contact (
    agreement_id UUID NOT NULL REFERENCES data_usage_agreement(id) ON DELETE CASCADE,
    contact_id UUID NOT NULL REFERENCES contact(id) ON DELETE CASCADE,
    authorization_role VARCHAR(100), -- e.g., "Data Owner", "Legal Approver"
    PRIMARY KEY (agreement_id, contact_id)
);

-- Indexes
CREATE INDEX idx_dua_validity_end ON data_usage_agreement(validity_end_date);
CREATE INDEX idx_dua_start ON data_usage_agreement(validity_start_date);
CREATE INDEX idx_agreement_dep ON agreement_dependency(dependency_id);
CREATE INDEX idx_agreement_contact ON agreement_contact(contact_id);
```

---

## Key Business Logic

### Validity Period Management
- **Validity Start Date**: When the agreement becomes effective (required)
- **Validity End Date**: When the agreement expires (optional for indefinite agreements)
- **Active Status**: An agreement is "active" if:
  - Current date >= validity_start_date
  - Current date <= validity_end_date (or no end date)

### Expiration Tracking
- Agreements expiring within 90 days should trigger alerts
- Expired agreements should be flagged but not blocked
- Dependencies can reference multiple agreements (e.g., different data types)

### Authorization Documentation
- Each agreement must document the nature of data being used
- Optional link to data lineage documentation (external system)
- Optional link to formal agreement document
- Track contacts who authorized the agreement and their roles

---

## Key Endpoints

### Data Usage Agreements
- `GET /api/data-usage-agreements` - List all agreements (paginated, filtered)
- `GET /api/data-usage-agreements/{id}` - Get agreement details
- `POST /api/data-usage-agreements` - Create new agreement
- `PUT /api/data-usage-agreements/{id}` - Update agreement
- `DELETE /api/data-usage-agreements/{id}` - Delete agreement
- `GET /api/data-usage-agreements/expiring?days={90}` - Get agreements expiring soon
- `GET /api/data-usage-agreements/expired` - Get expired agreements
- `GET /api/data-usage-agreements/{id}/dependencies` - Get dependencies covered
- `POST /api/data-usage-agreements/{id}/dependencies/{dependencyId}` - Link dependency
- `DELETE /api/data-usage-agreements/{id}/dependencies/{dependencyId}` - Unlink dependency
- `GET /api/data-usage-agreements/{id}/contacts` - Get authorizing contacts
- `POST /api/data-usage-agreements/{id}/contacts` - Add authorizing contact
- `DELETE /api/data-usage-agreements/{id}/contacts/{contactId}` - Remove contact

### Dependencies Enhancement
- `GET /api/dependencies/{id}/agreements` - Get agreements for dependency

---

## DTOs

```typescript
export interface DataUsageAgreement {
  id: string;
  dataNature: string; // Description of data type/usage
  dataLineageUrl?: string; // Link to data lineage documentation
  documentationUrl?: string; // Link to formal agreement document
  validityStartDate: Date;
  validityEndDate?: Date;
  isActive: boolean; // Computed
  daysUntilExpiration?: number; // Computed if expiring
  dependencies: DependencySummary[]; // List of covered dependencies
  authorizingContacts: AgreementContact[]; // Who authorized
  createdAt: Date;
  updatedAt: Date;
}

export interface DependencySummary {
  id: string;
  name: string;
  dependencyType: string;
  application: { id: string; name: string };
}

export interface AgreementContact {
  contact: ContactSummary;
  authorizationRole: string; // e.g., "Data Owner", "Legal Approver"
}

export interface CreateDataUsageAgreementRequest {
  dataNature: string;
  dataLineageUrl?: string;
  documentationUrl?: string;
  validityStartDate: Date;
  validityEndDate?: Date;
  dependencyIds?: string[]; // Initial dependencies to link
  contacts?: Array<{
    contactId: string;
    authorizationRole: string;
  }>;
}

export interface UpdateDataUsageAgreementRequest {
  dataNature?: string;
  dataLineageUrl?: string;
  documentationUrl?: string;
  validityStartDate?: Date;
  validityEndDate?: Date;
}

export interface LinkDependencyRequest {
  dependencyId: string;
}

export interface AddAuthorizingContactRequest {
  contactId: string;
  authorizationRole: string;
}
```

---

## Frontend Components

### DataUsageAgreementListComponent
- Table view of all data usage agreements
- Columns: Data Nature, Validity Period, Status, Dependencies Count, Authorizers, Actions
- Status indicators:
  - **Active**: Green badge
  - **Expiring Soon**: Yellow badge (< 90 days)
  - **Expired**: Red badge
  - **Future**: Gray badge (start date in future)
- Filters:
  - Status (all, active, expiring, expired)
  - By dependency (dropdown)
  - By contact (dropdown)
  - Date range
- Sort by expiration date, start date, data nature
- "Create Agreement" button
- Actions: View, Edit, Delete

### DataUsageAgreementFormComponent
- Reactive form with fields:
  - **Data Nature** (required, textarea) - Description of what data is used for
  - **Data Lineage URL** (optional, URL input) - Link to data lineage documentation
  - **Documentation URL** (optional, URL input) - Link to formal agreement PDF/document
  - **Validity Start Date** (required, date picker)
  - **Validity End Date** (optional, date picker)
  - **Dependencies** (multi-select, searchable dropdown)
  - **Authorizing Contacts** (repeatable section):
    - Contact (dropdown)
    - Authorization Role (text input) - e.g., "Data Owner", "Legal Approver"
    - Add/Remove buttons
- Validation:
  - Data nature required (min 10 characters)
  - Valid URLs
  - End date >= start date
  - At least one dependency
  - At least one authorizing contact
  - Warning if end date is in past or < 90 days from now
- Support create and edit modes

### DataUsageAgreementDetailComponent
- Display full agreement details
- Status badge (active/expiring/expired)
- Data nature (formatted text)
- Links (data lineage, documentation) - clickable
- Validity period with visual indicator
- Computed fields:
  - "Expires in X days" if expiring
  - "Expired X days ago" if expired
- Section: **Covered Dependencies**
  - List of dependencies with application names
  - "Add Dependency" button
  - Remove dependency action
- Section: **Authorizing Contacts**
  - Table: Contact Name, Role, Email
  - "Add Contact" button
  - Remove contact action
- "Edit" and "Delete" buttons

### DependencyDetailComponent Enhancement
- Add section: **Data Usage Agreements**
- List all agreements covering this dependency
- Click to navigate to agreement detail
- "Link to Agreement" button (search and select existing agreement)

### ExpiringAgreementsWidget (Dashboard)
- Widget showing agreements expiring within 90 days
- Count badge
- List showing: Data nature, days until expiration, dependency count
- Click to navigate to agreement detail
- Warning icon for expired agreements

---

## Acceptance Criteria

### Backend
- [ ] Data usage agreement can be created
- [ ] Agreement validates required fields
- [ ] Agreement validates date logic (end >= start)
- [ ] Agreement can be updated
- [ ] Agreement can be deleted
- [ ] Agreements can be listed with pagination
- [ ] Agreements can be filtered by status (active/expiring/expired)
- [ ] Dependencies can be linked to agreement
- [ ] Dependencies can be unlinked from agreement
- [ ] One dependency can have multiple agreements
- [ ] One agreement can cover multiple dependencies
- [ ] Contacts can be added as authorizers
- [ ] Contacts can be removed from agreement
- [ ] Authorization role is required when adding contact
- [ ] Active status is computed correctly
- [ ] Expiring agreements query works correctly
- [ ] Agreement details include all dependencies and contacts
- [ ] All endpoints authenticated
- [ ] Tests pass (>80% coverage)

### Frontend
- [ ] User can view list of all agreements
- [ ] Agreements show status badge (active/expiring/expired)
- [ ] User can filter agreements by status
- [ ] User can create new agreement
- [ ] Form validates all required fields
- [ ] Form validates URLs
- [ ] Form validates date logic
- [ ] Form requires at least one dependency
- [ ] Form requires at least one authorizing contact
- [ ] User can add/remove authorizing contacts dynamically
- [ ] User can view agreement details
- [ ] User can edit existing agreement
- [ ] User can delete agreement (with confirmation)
- [ ] User can link dependencies to agreement
- [ ] User can unlink dependencies from agreement
- [ ] User can add/remove authorizing contacts from detail view
- [ ] Expiring agreements are highlighted
- [ ] Documentation and lineage links are clickable
- [ ] Dependency detail shows linked agreements
- [ ] Success/error notifications displayed
- [ ] Tests pass (>70% coverage)

---

## Testing Scenarios

### Scenario 1: Create Data Usage Agreement
1. Navigate to Data Usage Agreements list
2. Click "Create Agreement"
3. Fill in form:
   - Data Nature: "Customer contact information for email marketing campaigns"
   - Data Lineage URL: "https://datalineage.company.com/customer-emails"
   - Documentation URL: "https://docs.company.com/agreements/GDPR-2026-001.pdf"
   - Validity Start: 2026-01-01
   - Validity End: 2027-12-31
   - Dependencies: Select "Marketing Database" and "Email Service API"
   - Authorizing Contacts:
     - Contact: "John Doe (Data Protection Officer)", Role: "Data Owner"
     - Contact: "Jane Smith (Legal)", Role: "Legal Approver"
4. Click "Save"
5. Verify success notification
6. Verify agreement appears in list with "Active" status

### Scenario 2: Expiring Agreement Warning
1. Create agreement with end date 60 days from today
2. Verify warning: "This agreement expires in 60 days"
3. Save agreement
4. Verify "Expiring Soon" badge (yellow)
5. Navigate to dashboard
6. Verify agreement appears in "Expiring Agreements" widget

### Scenario 3: Link Dependency to Agreement
1. Navigate to Dependency Detail
2. View "Data Usage Agreements" section
3. Click "Link to Agreement"
4. Search and select existing agreement
5. Click "Link"
6. Verify success notification
7. Verify agreement appears in dependency's agreements list
8. Navigate to agreement detail
9. Verify dependency appears in covered dependencies list

### Scenario 4: Add Authorizing Contact
1. Navigate to Agreement Detail
2. In "Authorizing Contacts" section, click "Add Contact"
3. Select contact: "Bob Johnson (Compliance Manager)"
4. Enter role: "Compliance Reviewer"
5. Click "Add"
6. Verify contact appears in list with role
7. Verify contact's email is displayed

### Scenario 5: Multiple Agreements per Dependency
1. Create Dependency: "Customer Database"
2. Create Agreement 1: "Marketing Data Usage"
3. Link "Customer Database" to Agreement 1
4. Create Agreement 2: "Analytics Data Usage"
5. Link "Customer Database" to Agreement 2
6. Navigate to "Customer Database" detail
7. Verify both agreements listed
8. Verify each agreement shows different data nature

### Scenario 6: Date Validation
1. Create agreement form
2. Set start date: 2027-01-01
3. Set end date: 2026-01-01
4. Attempt to save
5. Verify error: "End date must be after start date"

### Scenario 7: Filter Agreements
1. Create agreements with various statuses
2. Filter by "Expiring Soon"
3. Verify only expiring agreements shown
4. Filter by specific dependency
5. Verify only agreements covering that dependency shown

### Scenario 8: View Expired Agreement
1. Navigate to agreement with past end date
2. Verify "Expired" badge (red)
3. Verify message: "This agreement expired X days ago"
4. Verify dependencies still visible
5. Verify no functionality blocked (informational only)

---

## Integration Points

### Dependency Detail Enhancement
Add section showing:
- List of data usage agreements covering this dependency
- Agreement status and expiration info
- Quick link to agreement detail
- "Link to Agreement" action

### Dashboard Enhancement
Add "Expiring Agreements" widget:
- Count of agreements expiring within 90 days
- List of top 5 expiring soonest
- Link to full list

### Application Detail Enhancement (Indirect)
Show summary of agreements via dependencies:
- Count of dependencies with valid agreements
- Count of dependencies without agreements
- Warnings for expired agreements

---

## Performance Considerations

- [ ] Index on validity_end_date for expiring/expired queries
- [ ] Index on junction tables for fast agreement-dependency lookups
- [ ] Pagination for agreement lists
- [ ] Optimize N+1 queries when loading dependencies and contacts
- [ ] Consider caching expiring agreements count

---

## Compliance & Security Considerations

- [ ] Audit log for all agreement changes
- [ ] Restrict deletion of agreements (admin only or soft delete)
- [ ] Email notifications for expiring agreements (90 days, 30 days, 7 days)
- [ ] Export capability for compliance reporting
- [ ] Document retention policy (keep expired agreements for audit)

---

## Future Enhancements (Phase 3)

- [ ] Automated renewal workflow
- [ ] Digital signature integration
- [ ] Document version management
- [ ] Automated compliance reporting
- [ ] Integration with DMS (Document Management System)
- [ ] Email alerts for expiring agreements
- [ ] Bulk agreement creation
- [ ] Agreement templates
- [ ] Approval workflow before activation
- [ ] Impact analysis (what happens if agreement expires)

---

**Story Status**: Ready for Development  
**Estimated Completion**: 4-6 days
