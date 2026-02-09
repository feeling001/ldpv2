# Story 10: Service Level Agreement (SLA) Management

## Story Overview

**As a** service delivery manager  
**I want** to define and track Service Level Agreements for applications  
**So that** I can document expected service levels, maintenance windows, and responsibilities

**Story Type**: Feature (Service Management)  
**Priority**: Medium  
**Estimated Effort**: 6-8 days  
**Dependencies**: Story 2 (Applications), Story 3 (Contacts)

---

## Business Value

SLAs define the expected service levels, maintenance windows, and responsibilities for applications. This enables:
- Clear service level expectations
- Maintenance window planning
- Critical period identification
- Responsibility mapping
- Service delivery tracking
- Foundation for incident management

---

## Scope

### In Scope
✅ SLA CRUD operations  
✅ SLA-Application association (one-to-one)  
✅ Core SLA metrics (availability, response time, reaction time)  
✅ Maintenance window management  
✅ Critical period tracking  
✅ SLA-Contact associations (responsible parties)  
✅ Diagram storage (draw.io JSON format)  
✅ Dependencies documentation  

### Out of Scope
❌ Automated SLA monitoring/compliance  
❌ Incident management integration  
❌ Automated alerts for SLA breaches  
❌ Real-time availability tracking  
❌ Historical compliance reporting  

---

## Database Schema

```sql
-- SLA entity
CREATE TABLE sla (
    id UUID PRIMARY KEY,
    application_id UUID UNIQUE REFERENCES application(id) ON DELETE CASCADE,
    availability_percentage DECIMAL(5,2) NOT NULL, -- e.g., 99.90
    min_avg_response_time_seconds INTEGER NOT NULL,
    reaction_time VARCHAR(255) NOT NULL, -- Free text, e.g., "Within 4 hours for P1 incidents"
    diagram_json JSONB, -- draw.io diagram in JSON format
    dependencies_description TEXT,
    responsibility_scope TEXT,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT check_availability CHECK (availability_percentage >= 0 AND availability_percentage <= 100),
    CONSTRAINT check_response_time CHECK (min_avg_response_time_seconds > 0)
);

-- Maintenance Windows
CREATE TABLE maintenance_window (
    id UUID PRIMARY KEY,
    sla_id UUID NOT NULL REFERENCES sla(id) ON DELETE CASCADE,
    day_of_week VARCHAR(10) NOT NULL, -- MONDAY, TUESDAY, etc.
    start_time TIME NOT NULL, -- e.g., 02:00
    end_time TIME NOT NULL, -- e.g., 06:00
    created_at TIMESTAMP NOT NULL,
    CONSTRAINT check_time_order CHECK (end_time > start_time),
    CONSTRAINT check_day_of_week CHECK (day_of_week IN ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'))
);

-- Critical Periods
CREATE TABLE critical_period (
    id UUID PRIMARY KEY,
    sla_id UUID NOT NULL REFERENCES sla(id) ON DELETE CASCADE,
    start_datetime TIMESTAMP NOT NULL,
    end_datetime TIMESTAMP NOT NULL,
    description TEXT,
    created_at TIMESTAMP NOT NULL,
    CONSTRAINT check_period_order CHECK (end_datetime > start_datetime)
);

-- Computed column for duration in minutes
ALTER TABLE critical_period ADD COLUMN duration_minutes INTEGER GENERATED ALWAYS AS 
    (EXTRACT(EPOCH FROM (end_datetime - start_datetime)) / 60) STORED;

-- SLA-Contact junction (many-to-many)
CREATE TABLE sla_contact (
    sla_id UUID NOT NULL REFERENCES sla(id) ON DELETE CASCADE,
    contact_id UUID NOT NULL REFERENCES contact(id) ON DELETE CASCADE,
    PRIMARY KEY (sla_id, contact_id)
);

-- Indexes
CREATE INDEX idx_sla_application ON sla(application_id);
CREATE INDEX idx_maint_window_sla ON maintenance_window(sla_id);
CREATE INDEX idx_maint_window_day ON maintenance_window(day_of_week);
CREATE INDEX idx_critical_period_sla ON critical_period(sla_id);
CREATE INDEX idx_critical_period_dates ON critical_period(start_datetime, end_datetime);
CREATE INDEX idx_sla_contact_sla ON sla_contact(sla_id);
CREATE INDEX idx_sla_contact_contact ON sla_contact(contact_id);
```

---

## Key Business Logic

### SLA-Application Relationship
- Each application can have at most ONE SLA (one-to-one)
- SLA is optional (not all applications require formal SLAs)
- When creating SLA, validate application doesn't already have one
- When deleting SLA, application is not affected (cascade delete from SLA side)

### Maintenance Windows
- Represent recurring weekly maintenance periods
- Each window defines: day of week, start time, end time
- Multiple windows can be defined per SLA (e.g., nightly 2-4 AM every day)
- Validate end time > start time (no cross-midnight windows in MVP)
- Display in local time (time zone handling future enhancement)

### Critical Periods
- Represent specific date/time ranges requiring higher service levels
- Examples: Black Friday, tax season, year-end closing
- Duration in minutes is computed automatically
- Can overlap (multiple critical periods active simultaneously)
- Historical critical periods are kept for audit

### Contacts
- Multiple contacts can be responsible for an SLA
- Typical roles: Service Delivery Manager, Technical Lead, Escalation Point

---

## Key Endpoints

### SLA Management
- `GET /api/slas` - List all SLAs (paginated)
- `GET /api/slas/{id}` - Get SLA details with all related data
- `GET /api/applications/{appId}/sla` - Get SLA for specific application
- `POST /api/slas` - Create new SLA
- `PUT /api/slas/{id}` - Update SLA
- `DELETE /api/slas/{id}` - Delete SLA
- `GET /api/slas/{id}/contacts` - Get responsible contacts
- `POST /api/slas/{id}/contacts/{contactId}` - Add contact to SLA
- `DELETE /api/slas/{id}/contacts/{contactId}` - Remove contact from SLA

### Maintenance Windows
- `GET /api/slas/{slaId}/maintenance-windows` - List windows for SLA
- `POST /api/slas/{slaId}/maintenance-windows` - Add maintenance window
- `PUT /api/maintenance-windows/{id}` - Update maintenance window
- `DELETE /api/maintenance-windows/{id}` - Delete maintenance window

### Critical Periods
- `GET /api/slas/{slaId}/critical-periods` - List critical periods for SLA
- `GET /api/critical-periods/active` - Get currently active critical periods
- `GET /api/critical-periods/upcoming?days={30}` - Get upcoming critical periods
- `POST /api/slas/{slaId}/critical-periods` - Add critical period
- `PUT /api/critical-periods/{id}` - Update critical period
- `DELETE /api/critical-periods/{id}` - Delete critical period

---

## DTOs

```typescript
export enum DayOfWeek {
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY',
  SUNDAY = 'SUNDAY'
}

export interface SLA {
  id: string;
  application: { id: string; name: string };
  availabilityPercentage: number; // 99.9
  minAvgResponseTimeSeconds: number; // 2
  reactionTime: string; // "Within 4 hours for P1 incidents"
  diagramJson?: object; // draw.io diagram as JSON
  dependenciesDescription?: string;
  responsibilityScope?: string;
  maintenanceWindows: MaintenanceWindow[];
  criticalPeriods: CriticalPeriod[];
  responsibleContacts: ContactSummary[];
  createdAt: Date;
  updatedAt: Date;
}

export interface MaintenanceWindow {
  id: string;
  slaId: string;
  dayOfWeek: DayOfWeek;
  startTime: string; // "02:00"
  endTime: string; // "06:00"
  createdAt: Date;
}

export interface CriticalPeriod {
  id: string;
  slaId: string;
  startDatetime: Date;
  endDatetime: Date;
  durationMinutes: number; // Computed
  description?: string;
  isActive: boolean; // Computed: current time between start and end
  createdAt: Date;
}

export interface CreateSLARequest {
  applicationId: string;
  availabilityPercentage: number;
  minAvgResponseTimeSeconds: number;
  reactionTime: string;
  diagramJson?: object;
  dependenciesDescription?: string;
  responsibilityScope?: string;
  maintenanceWindows?: CreateMaintenanceWindowRequest[];
  criticalPeriods?: CreateCriticalPeriodRequest[];
  contactIds?: string[];
}

export interface UpdateSLARequest {
  availabilityPercentage?: number;
  minAvgResponseTimeSeconds?: number;
  reactionTime?: string;
  diagramJson?: object;
  dependenciesDescription?: string;
  responsibilityScope?: string;
}

export interface CreateMaintenanceWindowRequest {
  dayOfWeek: DayOfWeek;
  startTime: string; // "HH:MM"
  endTime: string; // "HH:MM"
}

export interface CreateCriticalPeriodRequest {
  startDatetime: Date;
  endDatetime: Date;
  description?: string;
}
```

---

## Frontend Components

### SLADetailComponent (Application Detail Tab)
- Displayed as tab in Application Detail view
- If no SLA exists: "Create SLA" button
- If SLA exists: Full SLA details display
- Sections:
  1. **Core Metrics**
     - Availability: 99.9% (with visual gauge)
     - Response Time: 2 seconds
     - Reaction Time: "Within 4 hours for P1 incidents"
  2. **Maintenance Windows**
     - Weekly calendar view showing all maintenance windows
     - List view: Day, Time Range
     - Add/Edit/Delete maintenance window
  3. **Critical Periods**
     - Timeline view of critical periods
     - Highlight currently active periods
     - List: Start, End, Duration, Description
     - Add/Edit/Delete critical period
  4. **Architecture Diagram**
     - Render draw.io diagram (if present)
     - Edit button (opens diagram editor)
  5. **Dependencies & Scope**
     - Dependencies description (formatted text)
     - Responsibility scope (formatted text)
  6. **Responsible Contacts**
     - List of contacts with roles
     - Add/Remove contacts
- "Edit SLA" and "Delete SLA" buttons

### SLAFormComponent
- Reactive form with sections:
  
  **Core Metrics:**
  - Application (dropdown, disabled in edit mode)
  - Availability Percentage (number input, 0-100, 2 decimals)
  - Min Avg Response Time (number input, seconds)
  - Reaction Time (text input or textarea)
  
  **Maintenance Windows:**
  - Repeatable section (add/remove)
  - Day of Week (dropdown)
  - Start Time (time picker)
  - End Time (time picker)
  - Visual: Weekly calendar preview
  
  **Critical Periods:**
  - Repeatable section (add/remove)
  - Start DateTime (datetime picker)
  - End DateTime (datetime picker)
  - Description (text input)
  - Duration auto-computed and displayed
  
  **Documentation:**
  - Diagram (upload draw.io JSON or use embedded editor)
  - Dependencies Description (rich text editor)
  - Responsibility Scope (rich text editor)
  
  **Responsible Contacts:**
  - Multi-select dropdown
  
- Validation:
  - Availability: 0-100, required
  - Response time: > 0, required
  - Reaction time: required
  - Maintenance window: end time > start time
  - Critical period: end datetime > start datetime
  - Application: must not already have SLA
  
- Support create and edit modes

### MaintenanceWindowCalendarComponent
- Visual representation of maintenance windows
- Weekly calendar grid (7 days × 24 hours)
- Highlight maintenance windows
- Click to add/edit window
- Different colors for different window types (if needed)

### CriticalPeriodTimelineComponent
- Timeline visualization of critical periods
- Show past, current, and future periods
- Highlight active periods (green background)
- Click period to edit/view details
- Add new period button

### SLAListComponent (Admin View)
- Table of all SLAs in system
- Columns: Application, Availability, Response Time, Maintenance Windows Count, Critical Periods Active, Actions
- Filter by application
- Sort by availability, response time
- Quick view of SLA summary
- Navigate to application detail

### DiagramEditorComponent (Optional Integration)
- Embed draw.io editor for diagram creation
- Save diagram as JSON
- Load existing diagram for editing
- Full-screen editing mode
- Alternative: Upload draw.io file, store JSON

---

## Acceptance Criteria

### Backend
- [ ] SLA can be created for an application
- [ ] SLA creation fails if application already has SLA
- [ ] SLA validates availability percentage (0-100)
- [ ] SLA validates response time (> 0)
- [ ] SLA can be updated
- [ ] SLA can be deleted (cascade to windows and periods)
- [ ] Maintenance windows can be added to SLA
- [ ] Maintenance window validates end time > start time
- [ ] Multiple maintenance windows can exist per SLA
- [ ] Critical periods can be added to SLA
- [ ] Critical period validates end datetime > start datetime
- [ ] Critical period duration is computed correctly
- [ ] Multiple critical periods can exist per SLA
- [ ] Contacts can be added to SLA
- [ ] Contacts can be removed from SLA
- [ ] SLA details include all related entities
- [ ] Active critical periods query works correctly
- [ ] All endpoints authenticated
- [ ] Tests pass (>80% coverage)

### Frontend
- [ ] User can view SLA in application detail
- [ ] If no SLA, "Create SLA" button is shown
- [ ] User can create new SLA
- [ ] Form validates all required fields
- [ ] Form validates ranges (0-100 for availability)
- [ ] Form validates time/datetime logic
- [ ] User can add multiple maintenance windows
- [ ] User can remove maintenance windows
- [ ] Weekly calendar preview shows maintenance windows
- [ ] User can add multiple critical periods
- [ ] User can remove critical periods
- [ ] Critical period duration is auto-calculated
- [ ] Currently active critical periods are highlighted
- [ ] User can upload/edit diagram
- [ ] Diagram is rendered correctly
- [ ] User can add/remove responsible contacts
- [ ] User can edit existing SLA
- [ ] User can delete SLA (with confirmation)
- [ ] All sections render correctly
- [ ] Success/error notifications displayed
- [ ] Tests pass (>70% coverage)

---

## Testing Scenarios

### Scenario 1: Create SLA with Basic Metrics
1. Navigate to Application Detail → SLA tab
2. Click "Create SLA"
3. Fill in core metrics:
   - Availability: 99.9%
   - Response Time: 2 seconds
   - Reaction Time: "P1: 1 hour, P2: 4 hours, P3: 1 business day"
4. Skip windows/periods for now
5. Click "Save"
6. Verify success notification
7. Verify SLA details displayed
8. Verify availability gauge shows 99.9%

### Scenario 2: Add Maintenance Windows
1. Navigate to existing SLA
2. Click "Edit"
3. Add maintenance window:
   - Day: Monday
   - Start: 02:00
   - End: 04:00
4. Add another window:
   - Day: Wednesday
   - Start: 02:00
   - End: 04:00
5. Save
6. Verify weekly calendar shows both windows
7. Verify windows listed in detail view

### Scenario 3: Add Critical Period
1. Navigate to existing SLA
2. Click "Edit"
3. Add critical period:
   - Start: 2026-11-25 00:00 (Black Friday)
   - End: 2026-11-27 23:59
   - Description: "Black Friday weekend sales event"
4. Verify duration computed: 4,319 minutes
5. Save
6. Verify critical period listed
7. Navigate to dashboard
8. If period is active, verify highlighted

### Scenario 4: Validation - Availability Range
1. Create/Edit SLA
2. Set availability: 101%
3. Attempt to save
4. Verify error: "Availability must be between 0 and 100"
5. Set availability: -5%
6. Verify same error
7. Set availability: 99.5%
8. Verify validation passes

### Scenario 5: Validation - Time Order
1. Edit SLA
2. Add maintenance window:
   - Day: Tuesday
   - Start: 06:00
   - End: 02:00 (before start)
3. Attempt to save
4. Verify error: "End time must be after start time"

### Scenario 6: Prevent Duplicate SLA
1. Application already has SLA
2. Attempt to create another SLA for same application
3. Verify error: "Application already has an SLA"
4. Edit existing SLA instead

### Scenario 7: Add Diagram
1. Navigate to SLA detail
2. Click "Edit"
3. Upload draw.io diagram JSON
4. Save
5. Verify diagram renders in detail view
6. Click "Edit Diagram"
7. Modify in embedded editor
8. Save changes
9. Verify updated diagram displayed

### Scenario 8: Manage Responsible Contacts
1. Navigate to SLA detail
2. Click "Add Contact"
3. Select "John Doe (Service Delivery Manager)"
4. Click "Add"
5. Verify contact appears in list
6. Add another contact: "Jane Smith (Technical Lead)"
7. Verify both contacts listed
8. Remove "John Doe"
9. Verify only "Jane Smith" remains

### Scenario 9: View Active Critical Periods
1. Create critical period starting yesterday, ending tomorrow
2. Navigate to dashboard or SLA list
3. Verify period marked as "Active" (green highlight)
4. View critical period detail
5. Verify "Currently Active" badge displayed

### Scenario 10: Weekly Maintenance Calendar View
1. Navigate to SLA detail
2. View maintenance windows section
3. Verify weekly calendar displayed
4. Verify all windows highlighted on calendar
5. Hover over window
6. Verify tooltip shows time range
7. Click on calendar day/time
8. Verify opens "Add Maintenance Window" with day pre-selected

---

## Integration Points

### Application Detail Enhancement
Add "SLA" tab showing:
- Full SLA details if exists
- Create SLA button if not exists
- Quick metrics summary in overview tab

### Dashboard Enhancement (Optional)
Add widgets:
- Applications with/without SLAs count
- Active critical periods count
- Upcoming critical periods (next 7 days)
- Maintenance windows today

---

## Performance Considerations

- [ ] Index on application_id for fast SLA lookup
- [ ] Index on critical period dates for active/upcoming queries
- [ ] Store diagram JSON in JSONB for efficient querying (PostgreSQL)
- [ ] Paginate SLA list if count grows large
- [ ] Optimize loading of related entities (maintenance windows, critical periods, contacts)

---

## Diagram Integration Options

### Option 1: Upload draw.io JSON
- User creates diagram in draw.io desktop app
- Exports as JSON
- Uploads JSON file in SLA form
- Backend stores JSON in JSONB column
- Frontend renders using draw.io viewer library

### Option 2: Embedded draw.io Editor
- Integrate draw.io embed library
- User edits diagram directly in application
- Save diagram as JSON to backend
- Requires: `<iframe>` or draw.io integration library

### Option 3: External Link Only (Simplest MVP)
- Store only URL to diagram (in SharePoint, Confluence, etc.)
- Display link, open in new tab
- No rendering in LDPv2

**Recommendation for MVP**: Option 3 (external link), upgrade to Option 1 or 2 in Phase 2

---

## Future Enhancements (Phase 3)

- [ ] Automated SLA compliance monitoring
- [ ] Real-time availability tracking
- [ ] Incident management integration
- [ ] Automated alerts during critical periods
- [ ] SLA breach notifications
- [ ] Historical compliance reports
- [ ] SLA comparison across applications
- [ ] Automated maintenance window scheduling
- [ ] Time zone support for global teams
- [ ] Integration with monitoring tools (Datadog, New Relic)
- [ ] SLA templates for quick creation
- [ ] Approval workflow for SLA changes

---

**Story Status**: Ready for Development  
**Estimated Completion**: 6-8 days
