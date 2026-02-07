# Story 5: Version Management

## Story Overview

**As a** application manager  
**I want** to track application versions  
**So that** I can manage releases and their lifecycle

**Story Type**: Feature (Core Domain)  
**Priority**: High  
**Estimated Effort**: 3-4 days  
**Dependencies**: Story 2 (Applications)

---

## Business Value

Versions represent application releases. This enables:
- Tracking what versions exist for each application
- Version lifecycle management (release date, end-of-life)
- Foundation for deployment tracking (Story 6)
- Link to external references (Git tags, JIRA releases)

---

## Scope

### In Scope
✅ Version CRUD operations  
✅ Version-Application association  
✅ Version lifecycle (release date, end-of-life)  
✅ External reference tracking (Git, JIRA, etc.)  
✅ Version listing per application  

### Out of Scope
❌ Deployment tracking (Story 6)  
❌ Version comparison/diff  
❌ Automated version detection from CI/CD  

---

## Database Schema

```sql
CREATE TABLE version (
    id UUID PRIMARY KEY,
    application_id UUID NOT NULL REFERENCES application(id) ON DELETE CASCADE,
    version_identifier VARCHAR(100) NOT NULL, -- "1.2.3", "2024.Q1"
    external_reference VARCHAR(500), -- Git tag, JIRA link, etc.
    release_date DATE NOT NULL,
    end_of_life_date DATE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    UNIQUE(application_id, version_identifier)
);

CREATE INDEX idx_version_application ON version(application_id);
CREATE INDEX idx_version_release_date ON version(release_date);
```

---

## Key Endpoints

- `GET /api/applications/{appId}/versions` - List versions for application
- `GET /api/versions/{id}` - Get version details
- `POST /api/applications/{appId}/versions` - Create version
- `PUT /api/versions/{id}` - Update version
- `DELETE /api/versions/{id}` - Delete version
- `GET /api/versions/latest?applicationId={appId}` - Get latest version

---

## DTOs

```typescript
export interface Version {
  id: string;
  applicationId: string;
  versionIdentifier: string; // "1.2.3"
  externalReference?: string; // "https://github.com/org/repo/releases/tag/v1.2.3"
  releaseDate: Date;
  endOfLifeDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateVersionRequest {
  versionIdentifier: string;
  externalReference?: string;
  releaseDate: Date;
  endOfLifeDate?: Date;
}
```

---

## Frontend Components

### VersionListComponent (sub-component of ApplicationDetailComponent)
- Displayed as tab in Application Detail view
- Table: Version, Release Date, End of Life, External Reference, Actions
- "Add New Version" button
- Sort by release date (newest first)
- Actions: Edit, Delete

### VersionFormComponent
- Modal or inline form
- Fields:
  - Version Identifier (required, must be unique per application)
  - External Reference (optional, URL)
  - Release Date (required, date picker)
  - End of Life Date (optional, must be after release date)
- Validation:
  - Version identifier unique within application
  - Dates valid (EOL after release)

---

## Business Rules

1. **Unique Version**: Version identifier must be unique within an application
2. **Date Logic**: End-of-life date (if set) must be after release date
3. **Latest Version**: System tracks the version with the most recent release date as "latest"
4. **Deletion**: Can only delete version if not deployed anywhere (checked in Story 6)

---

## Acceptance Criteria

- [ ] Version can be created for an application
- [ ] Version identifier must be unique within application
- [ ] Duplicate version identifiers are rejected
- [ ] Version release date is required
- [ ] End-of-life date validation (must be after release)
- [ ] Versions listed per application
- [ ] Versions sorted by release date (newest first)
- [ ] Latest version is identifiable
- [ ] Version can be edited
- [ ] Version can be deleted
- [ ] External reference links are clickable
- [ ] Tests pass (>80% backend, >70% frontend)

---

## Testing Scenarios

1. **Create Version**: Add version "1.0.0" to an application
2. **Duplicate Version**: Attempt to create "1.0.0" again (should fail)
3. **Multiple Versions**: Create versions 1.0.0, 1.1.0, 2.0.0, verify sorting
4. **Latest Version**: Verify version with most recent release date marked as latest
5. **Edit Version**: Update end-of-life date
6. **Delete Version**: Delete version (if not deployed)
7. **Date Validation**: Set EOL before release date (should fail)

---

## Integration with Application Detail

The Application Detail page (from Story 2) will be enhanced with a "Versions" tab:

```
Application Detail
├── Overview (existing)
├── Versions (NEW)
│   ├── Version List
│   └── Add Version Button
├── Deployments (Story 6)
└── Contacts (Story 3)
```

---

**Story Status**: Ready for Development  
**Estimated Completion**: 3-4 days
