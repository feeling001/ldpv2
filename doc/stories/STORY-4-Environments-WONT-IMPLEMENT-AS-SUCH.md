# Story 4: Environment Management (Enhancement)

## Story Overview

**As a** system administrator  
**I want** to enhance environment management  
**So that** I can better organize and categorize deployment targets

**Story Type**: Enhancement  
**Priority**: Medium  
**Estimated Effort**: 2-3 days  
**Dependencies**: Story 0 (Foundation - basic Environment CRUD exists)

---

## Business Value

Story 0 created basic Environment CRUD. This story enhances it with:
- Better organization and categorization
- Production environment safety controls
- Criticality-based filtering and alerts
- Foundation for environment-specific permissions

---

## Scope

### In Scope (Enhancements to Story 0)
✅ Add environment categorization/tags  
✅ Add environment deactivation (soft delete)  
✅ Add production environment warnings  
✅ Add environment groups (e.g., "Production EU", "Development")  
✅ Enhanced search and filtering  

### Out of Scope
❌ Environment-specific user permissions (future)  
❌ Environment health monitoring (future)  

---

## Database Migration

```sql
-- Add new columns to existing environment table
ALTER TABLE environment
ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN environment_group VARCHAR(100),
ADD COLUMN tags VARCHAR(255);

-- Index for filtering
CREATE INDEX idx_environment_active ON environment(is_active);
CREATE INDEX idx_environment_group ON environment(environment_group);
```

---

## Key Enhancements

### Backend
- [ ] Add `isActive` field to Environment entity (soft delete)
- [ ] Add `environmentGroup` field (e.g., "Production", "Non-Production")
- [ ] Add `tags` field (comma-separated or JSON array)
- [ ] Update `EnvironmentRepository` with new queries:
  - `findByIsActive(boolean)`
  - `findByEnvironmentGroup(String)`
  - `findByIsProductionAndIsActive(boolean, boolean)`
- [ ] Add deactivate/reactivate methods to service
- [ ] Update DTOs with new fields

### Frontend
- [ ] Add "Active/Inactive" filter toggle
- [ ] Add "Group" filter dropdown
- [ ] Show warning dialog when creating/editing production environments
- [ ] Show "Deactivate" instead of "Delete" (with reactivate option)
- [ ] Add visual indicators for inactive environments (grayed out)
- [ ] Add environment group badges

---

## Acceptance Criteria

- [ ] Environments can be deactivated (soft delete)
- [ ] Inactive environments are hidden by default
- [ ] User can view inactive environments via filter
- [ ] Inactive environments can be reactivated
- [ ] Production environments show warning before modifications
- [ ] Environments can be organized into groups
- [ ] Environments can be tagged
- [ ] Search includes tags and groups

---

## Testing Scenarios

1. **Deactivate Environment**: Deactivate an environment, verify it's hidden from default list
2. **Reactivate Environment**: Reactivate an environment, verify it appears again
3. **Production Warning**: Attempt to edit production environment, verify warning shown
4. **Group Filtering**: Filter by environment group, verify correct results
5. **Tag Search**: Search by tag, verify matching environments shown

---

**Story Status**: Ready for Development  
**Estimated Completion**: 2-3 days
