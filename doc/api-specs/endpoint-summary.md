# LDPv2 MVP - API Endpoints Summary

Complete list of RESTful API endpoints for the MVP.

**Base URL**: `http://localhost:8080/api`  
**Authentication**: Bearer JWT token (except /auth endpoints)

---

## Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Register new user | No |
| POST | `/auth/login` | Login and get JWT token | No |
| GET | `/auth/me` | Get current user info | Yes |

---

## Business Unit Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/business-units` | List all business units | Yes |
| GET | `/business-units/search?q={query}` | Search business units | Yes |
| GET | `/business-units/{id}` | Get business unit by ID | Yes |
| POST | `/business-units` | Create business unit | Yes |
| PUT | `/business-units/{id}` | Update business unit | Yes |
| DELETE | `/business-units/{id}` | Delete business unit | Yes |

**Query Parameters**:
- `page`: Page number (default: 0)
- `size`: Page size (default: 20)
- `sort`: Sort criteria (e.g., `name,asc`)

---

## Application Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/applications` | List all applications | Yes |
| GET | `/applications/search` | Advanced search | Yes |
| GET | `/applications/{id}` | Get application by ID | Yes |
| POST | `/applications` | Create application | Yes |
| PUT | `/applications/{id}` | Update application | Yes |
| PATCH | `/applications/{id}/status` | Update status only | Yes |
| DELETE | `/applications/{id}` | Delete application | Yes |
| GET | `/applications/by-status/{status}` | Filter by status | Yes |
| GET | `/applications/by-business-unit/{businessUnitId}` | Filter by BU | Yes |

**Query Parameters for `/applications` and `/applications/search`**:
- `status`: Filter by ApplicationStatus
- `businessUnitId`: Filter by business unit ID
- `name`: Search by name (partial match)
- `page`, `size`, `sort`: Pagination

---

## Environment Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/environments` | List all environments | Yes |
| GET | `/environments/{id}` | Get environment by ID | Yes |
| POST | `/environments` | Create environment | Yes |
| PUT | `/environments/{id}` | Update environment | Yes |
| DELETE | `/environments/{id}` | Delete environment | Yes |
| PATCH | `/environments/{id}/deactivate` | Deactivate environment | Yes |
| PATCH | `/environments/{id}/reactivate` | Reactivate environment | Yes |

**Query Parameters**:
- `isActive`: Filter by active status (default: true)
- `isProduction`: Filter production environments
- `environmentGroup`: Filter by group
- `page`, `size`, `sort`: Pagination

---

## Version Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/applications/{appId}/versions` | List versions for application | Yes |
| GET | `/versions/{id}` | Get version by ID | Yes |
| POST | `/applications/{appId}/versions` | Create version | Yes |
| PUT | `/versions/{id}` | Update version | Yes |
| DELETE | `/versions/{id}` | Delete version | Yes |
| GET | `/versions/latest?applicationId={appId}` | Get latest version | Yes |

**Query Parameters for `/applications/{appId}/versions`**:
- `page`, `size`, `sort`: Pagination (default sort: releaseDate,desc)

---

## Deployment Endpoints

### Recording & Retrieval

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/deployments` | Record new deployment | Yes |
| GET | `/deployments` | List all deployments | Yes |
| GET | `/deployments/{id}` | Get deployment by ID | Yes |
| GET | `/deployments/search` | Advanced search | Yes |

### Current State Queries

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/deployments/current` | Get current state (all apps/envs) | Yes |
| GET | `/applications/{appId}/deployments` | Deployment history for app | Yes |
| GET | `/applications/{appId}/deployments/current` | Current state per env for app | Yes |
| GET | `/environments/{envId}/deployments/current` | Current deployments in env | Yes |

### Statistics & Analytics

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/deployments/stats/summary` | Summary statistics | Yes |
| GET | `/deployments/stats/frequency?range={days}` | Deployment frequency | Yes |
| GET | `/deployments/stats/by-environment` | Deployments by environment | Yes |
| GET | `/deployments/stats/by-application` | Top deployed applications | Yes |
| GET | `/deployments/stats/version-distribution` | Version distribution | Yes |
| GET | `/deployments/calendar?year={year}&month={month}` | Calendar data | Yes |

### Export

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/deployments/export?format={csv\|excel}` | Export deployments | Yes |

**Query Parameters for `/deployments` and `/deployments/search`**:
- `applicationId`: Filter by application
- `versionId`: Filter by version
- `environmentId`: Filter by environment
- `dateFrom`: Filter by start date
- `dateTo`: Filter by end date
- `deployedBy`: Filter by user
- `page`, `size`, `sort`: Pagination

**Query Parameters for `/deployments/current`**:
- `applicationId`: Optional filter by application
- `environmentId`: Optional filter by environment

---

## Contact Endpoints

### Contact Roles

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/contact-roles` | List all contact roles | Yes |
| POST | `/contact-roles` | Create contact role | Yes (Admin) |

### Persons

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/persons` | List all persons | Yes |
| GET | `/persons/{id}` | Get person by ID | Yes |
| POST | `/persons` | Create person | Yes |
| PUT | `/persons/{id}` | Update person | Yes |
| DELETE | `/persons/{id}` | Delete person | Yes |

**Query Parameters for `/persons`**:
- `email`: Search by email
- `name`: Search by name (first or last)
- `page`, `size`, `sort`: Pagination

### Contacts

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/contacts` | List all contacts | Yes |
| GET | `/contacts/{id}` | Get contact with persons | Yes |
| POST | `/contacts` | Create contact | Yes |
| PUT | `/contacts/{id}` | Update contact | Yes |
| DELETE | `/contacts/{id}` | Delete contact | Yes |
| POST | `/contacts/{id}/persons/{personId}` | Add person to contact | Yes |
| DELETE | `/contacts/{id}/persons/{personId}` | Remove person from contact | Yes |
| PATCH | `/contacts/{id}/persons/{personId}/primary` | Set as primary | Yes |

---

## Common Response Formats

### Success Response (Single Entity)
```json
{
  "id": "uuid",
  "name": "Entity Name",
  ...
  "createdAt": "2026-02-07T10:00:00Z",
  "updatedAt": "2026-02-07T10:00:00Z"
}
```

### Success Response (Paginated List)
```json
{
  "content": [ /* array of entities */ ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 20,
    "sort": { "sorted": true, "unsorted": false }
  },
  "totalElements": 100,
  "totalPages": 5,
  "last": false,
  "first": true,
  "size": 20,
  "number": 0,
  "numberOfElements": 20,
  "empty": false
}
```

### Error Response
```json
{
  "status": 400,
  "message": "Validation failed",
  "timestamp": "2026-02-07T10:00:00Z",
  "path": "/api/applications",
  "errors": [
    {
      "field": "name",
      "message": "Name is required",
      "rejectedValue": null
    }
  ]
}
```

---

## HTTP Status Codes

| Code | Meaning | When Used |
|------|---------|-----------|
| 200 | OK | Successful GET, PUT, PATCH |
| 201 | Created | Successful POST |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Validation error, business rule violation |
| 401 | Unauthorized | Missing or invalid JWT token |
| 403 | Forbidden | Valid token but insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate resource (e.g., unique constraint violation) |
| 500 | Internal Server Error | Unexpected server error |

---

## Authentication Header

All authenticated endpoints require:
```
Authorization: Bearer <JWT_TOKEN>
```

Example:
```
GET /api/applications
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## CORS Configuration

Frontend origin allowed: `http://localhost:4200` (development)

Allowed methods: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `OPTIONS`

Allowed headers: `*`

Credentials: `true`

---

## Rate Limiting (Future)

Not implemented in MVP, but planned for production:
- 100 requests per minute per user
- 1000 requests per hour per user

---

## API Versioning

Current version: `v1` (implicit)

Future versions will use URL path: `/api/v2/...`

---

## OpenAPI/Swagger Documentation

Interactive API documentation available at:
- **Swagger UI**: `http://localhost:8080/swagger-ui/index.html`
- **OpenAPI Spec**: `http://localhost:8080/v3/api-docs`

---

**Document Version**: 1.0  
**Last Updated**: February 2026  
**Status**: Complete for MVP
