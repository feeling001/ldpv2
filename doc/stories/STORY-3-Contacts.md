# Story 3: Contact Management

## Story Overview

**As a** system user  
**I want** to manage contacts and their roles  
**So that** I can associate stakeholders with applications and business units

**Story Type**: Feature  
**Priority**: Medium  
**Estimated Effort**: 3-5 days  
**Dependencies**: Story 0 (Foundation)

---

## Business Value

Contacts represent stakeholders (Product Owners, Developers, etc.) and their roles. This enables:
- Tracking who is responsible for what
- Contact information management
- Foundation for application stakeholder mapping (used in later stories)

---

## Scope

### In Scope
✅ Contact role management (predefined roles)  
✅ Person management (individuals)  
✅ Contact-Person associations  
✅ Basic CRUD for all entities  

### Out of Scope (Story 2, 6)
❌ Application-Contact associations (added when Story 2 needs it)  
❌ Business Unit-Contact associations  
❌ SLA-Contact associations (Phase 2)  

---

## Database Schema

```sql
-- Contact Roles (predefined)
CREATE TABLE contact_role (
    id UUID PRIMARY KEY,
    role_name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

-- Persons (individuals)
CREATE TABLE person (
    id UUID PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

-- Contacts (functional roles)
CREATE TABLE contact (
    id UUID PRIMARY KEY,
    contact_role_id UUID NOT NULL REFERENCES contact_role(id),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

-- Contact-Person junction (many-to-many)
CREATE TABLE contact_person (
    contact_id UUID NOT NULL REFERENCES contact(id) ON DELETE CASCADE,
    person_id UUID NOT NULL REFERENCES person(id) ON DELETE CASCADE,
    is_primary BOOLEAN NOT NULL DEFAULT false,
    PRIMARY KEY (contact_id, person_id)
);

-- Indexes
CREATE INDEX idx_person_email ON person(email);
CREATE INDEX idx_contact_role ON contact(contact_role_id);
```

---

## Key Endpoints

### Contact Roles
- `GET /api/contact-roles` - List all roles
- `POST /api/contact-roles` - Create role (admin only)

### Persons
- `GET /api/persons` - List all persons
- `GET /api/persons/{id}` - Get person details
- `POST /api/persons` - Create person
- `PUT /api/persons/{id}` - Update person
- `DELETE /api/persons/{id}` - Delete person

### Contacts
- `GET /api/contacts` - List all contacts
- `GET /api/contacts/{id}` - Get contact with persons
- `POST /api/contacts` - Create contact (with person IDs)
- `PUT /api/contacts/{id}` - Update contact
- `POST /api/contacts/{id}/persons/{personId}` - Add person to contact
- `DELETE /api/contacts/{id}/persons/{personId}` - Remove person from contact
- `PATCH /api/contacts/{id}/persons/{personId}/primary` - Set as primary

---

## Frontend Components

### PersonListComponent
- Table: First Name, Last Name, Email, Phone, Actions
- CRUD operations

### ContactRoleListComponent
- Simple list of roles (mostly read-only for regular users)

### ContactFormComponent
- Select contact role (dropdown)
- Multi-select persons (with primary designation)
- Add/remove persons dynamically

---

## Acceptance Criteria

- [ ] Contact roles can be created and listed
- [ ] Persons can be created with unique email
- [ ] Contacts can be created with role and persons
- [ ] One person per contact can be marked as primary
- [ ] Person can be associated with multiple contacts
- [ ] All CRUD operations work via UI
- [ ] Email uniqueness enforced
- [ ] Tests pass (>80% backend, >70% frontend)

---

## Testing Scenarios

1. **Create Person**: Add new person with unique email
2. **Duplicate Email**: Attempt to create person with existing email (should fail)
3. **Create Contact**: Create contact with role and multiple persons
4. **Set Primary**: Mark one person as primary contact
5. **Remove Person**: Remove person from contact
6. **Delete Person**: Delete person (should remove from all contacts)

---

**Story Status**: Ready for Development  
**Estimated Completion**: 3-5 days
