# Story 6: Deployment Tracking

## Story Overview

**As a** application manager  
**I want** to record and track deployments  
**So that** I know which version is deployed in each environment

**Story Type**: Feature (Core Domain)  
**Priority**: Highest  
**Estimated Effort**: 5-7 days  
**Dependencies**: Story 2 (Applications), Story 4 (Environments), Story 5 (Versions)

---

## Business Value

Deployments are the core tracking mechanism. This enables:
- Record which application version is in which environment
- Complete deployment history (audit trail)
- Current state visibility (what's in production right now)
- Foundation for compliance and change tracking

---

## Scope

### In Scope
✅ Deployment recording (application + version + environment)  
✅ Deployment history (immutable records)  
✅ Current deployment state query  
✅ Deployment metadata (who, when, notes)  
✅ Basic deployment listing and filtering  

### Out of Scope
❌ Automated deployment from CI/CD  
❌ Deployment approval workflows  
❌ Rollback functionality  
❌ Deployment health monitoring  

---

## Database Schema

```sql
CREATE TABLE deployment (
    id UUID PRIMARY KEY,
    application_id UUID NOT NULL REFERENCES application(id),
    version_id UUID NOT NULL REFERENCES version(id),
    environment_id UUID NOT NULL REFERENCES environment(id),
    deployment_date TIMESTAMP NOT NULL,
    deployed_by VARCHAR(255), -- Username or system identifier
    notes TEXT,
    created_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_deployment_application FOREIGN KEY (application_id) REFERENCES application(id),
    CONSTRAINT fk_deployment_version FOREIGN KEY (version_id) REFERENCES version(id),
    CONSTRAINT fk_deployment_environment FOREIGN KEY (environment_id) REFERENCES environment(id),
    CONSTRAINT check_version_belongs_to_app CHECK (
        EXISTS (SELECT 1 FROM version WHERE id = version_id AND application_id = deployment.application_id)
    )
);

-- Indexes for common queries
CREATE INDEX idx_deployment_application ON deployment(application_id);
CREATE INDEX idx_deployment_environment ON deployment(environment_id);
CREATE INDEX idx_deployment_date ON deployment(deployment_date DESC);
CREATE INDEX idx_deployment_app_env ON deployment(application_id, environment_id);
```

---

## Key Business Logic

### Current Deployment State
The "current" deployment for an application in an environment is defined as:
**The deployment with the most recent `deployment_date` for that (application, environment) combination**

Query:
```sql
SELECT DISTINCT ON (application_id, environment_id) *
FROM deployment
WHERE application_id = ? AND environment_id = ?
ORDER BY application_id, environment_id, deployment_date DESC;
```

### Immutability
Deployments are **immutable** once created. No updates or deletions allowed (audit requirement). Only soft-delete for admin cleanup.

---

## Key Endpoints

### Recording Deployments
- `POST /api/deployments` - Record new deployment
  - Request: `{ applicationId, versionId, environmentId, deploymentDate, deployedBy?, notes? }`
  - Validates version belongs to application
  - Validates deployment date not in future

### Querying Deployments
- `GET /api/deployments` - List all deployments (paginated, filtered)
  - Filters: `applicationId`, `environmentId`, `versionId`, `dateFrom`, `dateTo`
- `GET /api/deployments/{id}` - Get deployment details
- `GET /api/deployments/current` - Get current state across all environments
  - Query params: `applicationId?`, `environmentId?`
- `GET /api/applications/{appId}/deployments` - Deployment history for application
- `GET /api/applications/{appId}/deployments/current` - Current state per environment for app
- `GET /api/environments/{envId}/deployments/current` - All current deployments in environment

---

## DTOs

```typescript
export interface Deployment {
  id: string;
  application: { id: string; name: string };
  version: { id: string; versionIdentifier: string };
  environment: { id: string; name: string };
  deploymentDate: Date;
  deployedBy?: string;
  notes?: string;
  createdAt: Date;
}

export interface RecordDeploymentRequest {
  applicationId: string;
  versionId: string;
  environmentId: string;
  deploymentDate: Date;
  deployedBy?: string;
  notes?: string;
}

export interface CurrentDeploymentState {
  application: { id: string; name: string };
  environment: { id: string; name: string };
  version: { id: string; versionIdentifier: string };
  deploymentDate: Date;
  deployedBy?: string;
}
```

---

## Frontend Components

### RecordDeploymentComponent
- Form to record new deployment:
  - Application (dropdown or pre-selected from context)
  - Version (dropdown - load versions for selected application)
  - Environment (dropdown)
  - Deployment Date (datetime picker, default: now)
  - Deployed By (text input, default: current user)
  - Notes (textarea, optional)
- Validation:
  - All required fields
  - Version belongs to selected application
  - Date not in future
- Submit creates immutable deployment record

### DeploymentHistoryComponent (tab in ApplicationDetailComponent)
- Timeline view of deployments for an application
- Group by environment
- Show: Version, Environment, Date, Deployed By
- Sort: Most recent first
- Filter: By environment, by date range

### CurrentDeploymentStateComponent
- Dashboard view showing current state
- Matrix: Applications (rows) × Environments (columns)
- Each cell shows: Version number, deployment date
- Color coding:
  - Green: Recently deployed (< 30 days)
  - Yellow: Older deployment (30-90 days)
  - Red: Very old (> 90 days)
- Click cell to see deployment details
- "Record Deployment" action per cell

### EnvironmentDeploymentsComponent (tab in Environment detail)
- List all applications currently deployed in this environment
- Columns: Application, Version, Deployment Date, Deployed By
- Link to application detail

---

## Acceptance Criteria

### Backend
- [ ] Deployment can be recorded with valid data
- [ ] Version must belong to the specified application
- [ ] Deployment date cannot be in future
- [ ] Deployments are immutable (no updates/deletes)
- [ ] Current deployment state query returns correct version per environment
- [ ] Deployment history is complete and ordered correctly
- [ ] All endpoints authenticated
- [ ] Tests pass (>80% coverage)

### Frontend
- [ ] User can record new deployment
- [ ] Form validates all fields
- [ ] Version dropdown shows only versions for selected application
- [ ] Deployment appears immediately in history
- [ ] Current state dashboard shows accurate data
- [ ] Timeline view shows deployment history
- [ ] User can filter deployment history
- [ ] Deployment date defaults to current time
- [ ] Deployed by defaults to current user
- [ ] Tests pass (>70% coverage)

---

## Testing Scenarios

### Scenario 1: Record Deployment
1. Navigate to "Record Deployment"
2. Select Application: "Customer Portal"
3. Version dropdown loads versions for Customer Portal
4. Select Version: "1.2.0"
5. Select Environment: "PROD-EU"
6. Deployment Date defaults to now
7. Deployed By defaults to current user
8. Add notes: "Hotfix for login issue"
9. Submit
10. Verify success notification
11. Verify deployment appears in history

### Scenario 2: Invalid Version
1. Attempt to record deployment
2. Manually set versionId for different application
3. Submit
4. Verify error: "Version does not belong to selected application"

### Scenario 3: Future Date Validation
1. Record deployment
2. Set deployment date to tomorrow
3. Submit
4. Verify error: "Deployment date cannot be in future"

### Scenario 4: Current State Query
1. Record multiple deployments for same app in different environments
2. Navigate to current state dashboard
3. Verify each environment shows the most recent deployment
4. Record new deployment for same app/env
5. Verify dashboard updates to show new deployment

### Scenario 5: Deployment History
1. Navigate to Application Detail → Deployments tab
2. Verify all deployments shown, grouped by environment
3. Verify sorted by date (most recent first)
4. Filter by environment
5. Verify only deployments to that environment shown

### Scenario 6: Environment View
1. Navigate to Environment Detail → Deployments tab
2. Verify all applications deployed to this environment shown
3. Verify versions and dates correct
4. Click on application
5. Verify navigates to application detail

---

## Integration Points

### Application Detail Enhancement
Add "Deployments" tab showing:
- Current deployment state (per environment)
- Deployment history timeline
- "Record New Deployment" button

### Environment Detail Enhancement
Add "Deployments" tab showing:
- All applications currently deployed
- Quick record deployment action

### Dashboard (new)
Create main dashboard showing:
- Current deployment state matrix
- Recent deployments (last 10)
- Quick stats (total apps, total deployments this week)

---

## Performance Considerations

- [ ] Index on (application_id, environment_id, deployment_date) for current state queries
- [ ] Pagination for deployment history (can grow large)
- [ ] Consider caching current deployment state (refresh every 5 min)
- [ ] Optimize DISTINCT ON query for PostgreSQL

---

**Story Status**: Ready for Development  
**Estimated Completion**: 5-7 days
