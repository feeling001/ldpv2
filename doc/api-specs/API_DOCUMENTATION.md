# LDPv2 Backend API Documentation

## Base URL
```
http://localhost:8080/api
```

## Authentication

### Login
**POST** `/auth/login`

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "token": "string",
  "type": "Bearer",
  "user": {
    "id": "uuid",
    "username": "string",
    "email": "string",
    "role": "ADMIN | USER",
    "createdAt": "timestamp",
    "updatedAt": "timestamp"
  }
}
```

### Register
**POST** `/auth/register`

**Request Body:**
```json
{
  "username": "string (3-50 chars)",
  "email": "string (valid email)",
  "password": "string (min 6 chars)"
}
```

**Response:** Same as Login

---

## Business Units

### Create Business Unit
**POST** `/business-units`

**Auth Required:** Yes

**Request Body:**
```json
{
  "name": "string (required, max 255)",
  "description": "string (optional)"
}
```

**Response:**
```json
{
  "id": "uuid",
  "name": "string",
  "description": "string",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

### Update Business Unit
**PUT** `/business-units/{id}`

**Auth Required:** Yes

**Request Body:**
```json
{
  "name": "string (optional, max 255)",
  "description": "string (optional)"
}
```

**Response:** Same as Create

### Get Business Unit by ID
**GET** `/business-units/{id}`

**Auth Required:** Yes

**Response:** Same as Create

### List Business Units
**GET** `/business-units`

**Auth Required:** Yes

**Query Parameters:**
- `page` (default: 0)
- `size` (default: 20)
- `sortBy` (default: "name")
- `sortDirection` (default: "asc", values: "asc" | "desc")

**Response:**
```json
{
  "content": [BusinessUnitResponse],
  "totalElements": "number",
  "totalPages": "number",
  "size": "number",
  "number": "number"
}
```

### Search Business Units
**GET** `/business-units/search`

**Auth Required:** Yes

**Query Parameters:**
- `q` (required) - search query
- `page` (default: 0)
- `size` (default: 20)

**Response:** Same as List

### Delete Business Unit
**DELETE** `/business-units/{id}`

**Auth Required:** Yes

**Response:** 204 No Content

---

## Environments

### Create Environment
**POST** `/environments`

**Auth Required:** Yes

**Request Body:**
```json
{
  "name": "string (required, max 100)",
  "description": "string (optional)",
  "isProduction": "boolean (default: false)",
  "criticalityLevel": "integer (1-5, optional)"
}
```

**Response:**
```json
{
  "id": "uuid",
  "name": "string",
  "description": "string",
  "isProduction": "boolean",
  "criticalityLevel": "integer",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

### Update Environment
**PUT** `/environments/{id}`

**Auth Required:** Yes

**Request Body:**
```json
{
  "name": "string (optional, max 100)",
  "description": "string (optional)",
  "isProduction": "boolean (optional)",
  "criticalityLevel": "integer (1-5, optional)"
}
```

**Response:** Same as Create

### Get Environment by ID
**GET** `/environments/{id}`

**Auth Required:** Yes

**Response:** Same as Create

### List Environments
**GET** `/environments`

**Auth Required:** Yes

**Query Parameters:**
- `page` (default: 0)
- `size` (default: 20)
- `sortBy` (default: "name")
- `sortDirection` (default: "asc")

**Response:** Paginated list of environments

### Search Environments
**GET** `/environments/search`

**Auth Required:** Yes

**Query Parameters:**
- `query` (required)
- `page` (default: 0)
- `size` (default: 20)

**Response:** Paginated list of environments

### Delete Environment
**DELETE** `/environments/{id}`

**Auth Required:** Yes

**Response:** 204 No Content

---

## Applications

### Create Application
**POST** `/applications`

**Auth Required:** Yes

**Request Body:**
```json
{
  "name": "string (required, max 255)",
  "description": "string (optional)",
  "status": "IDEA | IN_DEVELOPMENT | IN_SERVICE | MAINTENANCE | DECOMMISSIONED (required)",
  "businessUnitId": "uuid (required)",
  "endOfLifeDate": "date (optional)",
  "endOfSupportDate": "date (optional)"
}
```

**Response:**
```json
{
  "id": "uuid",
  "name": "string",
  "description": "string",
  "status": "ApplicationStatus",
  "businessUnit": {
    "id": "uuid",
    "name": "string"
  },
  "endOfLifeDate": "date",
  "endOfSupportDate": "date",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

### Update Application
**PUT** `/applications/{id}`

**Auth Required:** Yes

**Request Body:**
```json
{
  "name": "string (optional, max 255)",
  "description": "string (optional)",
  "status": "ApplicationStatus (optional)",
  "businessUnitId": "uuid (optional)",
  "endOfLifeDate": "date (optional)",
  "endOfSupportDate": "date (optional)"
}
```

**Response:** Same as Create

### Update Application Status
**PATCH** `/applications/{id}/status`

**Auth Required:** Yes

**Query Parameters:**
- `status` (required) - ApplicationStatus enum value

**Response:** Same as Create

### Get Application by ID
**GET** `/applications/{id}`

**Auth Required:** Yes

**Response:** Same as Create

### List Applications
**GET** `/applications`

**Auth Required:** Yes

**Query Parameters:**
- `status` (optional) - filter by status
- `businessUnitId` (optional) - filter by business unit
- `name` (optional) - search by name
- `page` (default: 0)
- `size` (default: 20)
- `sortBy` (default: "name")
- `sortDirection` (default: "asc")

**Response:** Paginated list of applications

### Get Applications by Status
**GET** `/applications/by-status/{status}`

**Auth Required:** Yes

**Query Parameters:**
- `page` (default: 0)
- `size` (default: 20)

**Response:** Paginated list of applications

### Get Applications by Business Unit
**GET** `/applications/by-business-unit/{businessUnitId}`

**Auth Required:** Yes

**Query Parameters:**
- `page` (default: 0)
- `size` (default: 20)

**Response:** Paginated list of applications

### Delete Application
**DELETE** `/applications/{id}`

**Auth Required:** Yes

**Response:** 204 No Content

### Get Application Contacts
**GET** `/applications/{applicationId}/contacts`

**Auth Required:** Yes

**Response:**
```json
[
  {
    "applicationId": "uuid",
    "contact": {
      "id": "uuid",
      "contactRole": {
        "id": "uuid",
        "roleName": "string",
        "description": "string",
        "createdAt": "timestamp",
        "updatedAt": "timestamp"
      },
      "persons": [
        {
          "person": {
            "id": "uuid",
            "firstName": "string",
            "lastName": "string",
            "email": "string",
            "phone": "string",
            "createdAt": "timestamp",
            "updatedAt": "timestamp"
          },
          "isPrimary": "boolean"
        }
      ],
      "createdAt": "timestamp",
      "updatedAt": "timestamp"
    }
  }
]
```

### Add Contact to Application
**POST** `/applications/{applicationId}/contacts`

**Auth Required:** Yes

**Request Body:**
```json
{
  "contactId": "uuid (required)"
}
```

**Response:** Application contact response

### Remove Contact from Application
**DELETE** `/applications/{applicationId}/contacts/{contactId}`

**Auth Required:** Yes

**Response:** 204 No Content

---

## Versions

### Create Version
**POST** `/applications/{applicationId}/versions`

**Auth Required:** Yes

**Request Body:**
```json
{
  "versionIdentifier": "string (required, max 100)",
  "externalReference": "string (optional, max 500)",
  "releaseDate": "date (required, not in future)",
  "endOfLifeDate": "date (optional, must be after releaseDate)"
}
```

**Response:**
```json
{
  "id": "uuid",
  "applicationId": "uuid",
  "applicationName": "string",
  "versionIdentifier": "string",
  "externalReference": "string",
  "releaseDate": "date",
  "endOfLifeDate": "date",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

### Update Version
**PUT** `/applications/{applicationId}/versions/{id}`

**Auth Required:** Yes

**Request Body:**
```json
{
  "versionIdentifier": "string (optional, max 100)",
  "externalReference": "string (optional, max 500)",
  "releaseDate": "date (optional, not in future)",
  "endOfLifeDate": "date (optional)"
}
```

**Response:** Same as Create

### Get Version by ID
**GET** `/applications/{applicationId}/versions/{id}`

**Auth Required:** Yes

**Response:** Same as Create

### List Versions for Application
**GET** `/applications/{applicationId}/versions`

**Auth Required:** Yes

**Query Parameters:**
- `page` (default: 0)
- `size` (default: 20)
- `sortBy` (default: "releaseDate")
- `sortDirection` (default: "desc")

**Response:** Paginated list of versions

### Get Latest Version
**GET** `/applications/{applicationId}/versions/latest`

**Auth Required:** Yes

**Response:** Version response or 404

### Delete Version
**DELETE** `/applications/{applicationId}/versions/{id}`

**Auth Required:** Yes

**Response:** 204 No Content

---

## Deployments

### Record Deployment
**POST** `/deployments`

**Auth Required:** Yes

**Request Body:**
```json
{
  "applicationId": "uuid (required)",
  "versionId": "uuid (required)",
  "environmentId": "uuid (required)",
  "deploymentDate": "timestamp (required, not in future)",
  "deployedBy": "string (optional)",
  "notes": "string (optional)"
}
```

**Response:**
```json
{
  "id": "uuid",
  "application": {
    "id": "uuid",
    "name": "string",
    "status": "ApplicationStatus",
    "businessUnitName": "string"
  },
  "version": {
    "id": "uuid",
    "versionIdentifier": "string",
    "releaseDate": "date"
  },
  "environment": {
    "id": "uuid",
    "name": "string",
    "isProduction": "boolean"
  },
  "deploymentDate": "timestamp",
  "deployedBy": "string",
  "notes": "string",
  "createdAt": "timestamp"
}
```

### Get Deployment by ID
**GET** `/deployments/{id}`

**Auth Required:** Yes

**Response:** Same as Record

### List Deployments
**GET** `/deployments`

**Auth Required:** Yes

**Query Parameters:**
- `applicationId` (optional)
- `environmentId` (optional)
- `versionId` (optional)
- `dateFrom` (optional, ISO timestamp)
- `dateTo` (optional, ISO timestamp)
- `page` (default: 0)
- `size` (default: 20)
- `sortBy` (default: "deploymentDate")
- `sortDirection` (default: "desc")

**Response:** Paginated list of deployments

### Get Current Deployment State
**GET** `/deployments/current`

**Auth Required:** Yes

**Query Parameters:**
- `applicationId` (optional)
- `environmentId` (optional)

**Response:**
```json
[
  {
    "application": {
      "id": "uuid",
      "name": "string",
      "status": "ApplicationStatus",
      "businessUnitName": "string"
    },
    "environment": {
      "id": "uuid",
      "name": "string",
      "isProduction": "boolean"
    },
    "version": {
      "id": "uuid",
      "versionIdentifier": "string",
      "releaseDate": "date"
    },
    "deploymentDate": "timestamp",
    "deployedBy": "string"
  }
]
```

### Get Deployments by Application
**GET** `/deployments/by-application/{applicationId}`

**Auth Required:** Yes

**Query Parameters:**
- `page` (default: 0)
- `size` (default: 20)

**Response:** Paginated list of deployments

### Get Deployments by Environment
**GET** `/deployments/by-environment/{environmentId}`

**Auth Required:** Yes

**Query Parameters:**
- `page` (default: 0)
- `size` (default: 20)

**Response:** Paginated list of deployments

---

## Persons

### Create Person
**POST** `/persons`

**Auth Required:** Yes

**Request Body:**
```json
{
  "firstName": "string (required, max 100)",
  "lastName": "string (required, max 100)",
  "email": "string (required, valid email)",
  "phone": "string (optional, max 50)"
}
```

**Response:**
```json
{
  "id": "uuid",
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "phone": "string",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

### Update Person
**PUT** `/persons/{id}`

**Auth Required:** Yes

**Request Body:**
```json
{
  "firstName": "string (optional, max 100)",
  "lastName": "string (optional, max 100)",
  "email": "string (optional, valid email)",
  "phone": "string (optional, max 50)"
}
```

**Response:** Same as Create

### Get Person by ID
**GET** `/persons/{id}`

**Auth Required:** Yes

**Response:** Same as Create

### List Persons
**GET** `/persons`

**Auth Required:** Yes

**Query Parameters:**
- `name` (optional) - search by first or last name
- `page` (default: 0)
- `size` (default: 20)
- `sortBy` (default: "lastName")
- `sortDirection` (default: "asc")

**Response:** Paginated list of persons

### Delete Person
**DELETE** `/persons/{id}`

**Auth Required:** Yes

**Response:** 204 No Content

---

## Contact Roles

### Create Contact Role
**POST** `/contact-roles`

**Auth Required:** Admin only

**Request Body:**
```json
{
  "roleName": "string (required, max 100)",
  "description": "string (optional)"
}
```

**Response:**
```json
{
  "id": "uuid",
  "roleName": "string",
  "description": "string",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

### List Contact Roles
**GET** `/contact-roles`

**Auth Required:** Yes

**Response:** Array of contact role responses

---

## Contacts

### Create Contact
**POST** `/contacts`

**Auth Required:** Yes

**Request Body:**
```json
{
  "contactRoleId": "uuid (required)",
  "personIds": ["uuid"] (required, at least one),
  "primaryPersonId": "uuid (required, must be in personIds)"
}
```

**Response:**
```json
{
  "id": "uuid",
  "contactRole": {
    "id": "uuid",
    "roleName": "string",
    "description": "string",
    "createdAt": "timestamp",
    "updatedAt": "timestamp"
  },
  "persons": [
    {
      "person": {
        "id": "uuid",
        "firstName": "string",
        "lastName": "string",
        "email": "string",
        "phone": "string",
        "createdAt": "timestamp",
        "updatedAt": "timestamp"
      },
      "isPrimary": "boolean"
    }
  ],
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

### Get Contact by ID
**GET** `/contacts/{id}`

**Auth Required:** Yes

**Response:** Same as Create

### List Contacts
**GET** `/contacts`

**Auth Required:** Yes

**Response:** Array of contact responses

### Add Person to Contact
**POST** `/contacts/{contactId}/persons/{personId}`

**Auth Required:** Yes

**Query Parameters:**
- `isPrimary` (default: false)

**Response:** Contact response

### Remove Person from Contact
**DELETE** `/contacts/{contactId}/persons/{personId}`

**Auth Required:** Yes

**Response:** Contact response

### Set Primary Person
**PATCH** `/contacts/{contactId}/persons/{personId}/primary`

**Auth Required:** Yes

**Response:** Contact response

### Delete Contact
**DELETE** `/contacts/{id}`

**Auth Required:** Yes

**Response:** 204 No Content

---

## Dependency Types

### Create Dependency Type
**POST** `/dependency-types`

**Auth Required:** Admin only

**Request Body:**
```json
{
  "typeName": "string (required, max 100)",
  "description": "string (optional)"
}
```

**Response:**
```json
{
  "id": "uuid",
  "typeName": "string",
  "description": "string",
  "isCustom": "boolean",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

### Update Dependency Type
**PUT** `/dependency-types/{id}`

**Auth Required:** Admin only

**Request Body:**
```json
{
  "typeName": "string (optional, max 100)",
  "description": "string (optional)"
}
```

**Response:** Same as Create

### Get Dependency Type by ID
**GET** `/dependency-types/{id}`

**Auth Required:** Yes

**Response:** Same as Create

### List Dependency Types
**GET** `/dependency-types`

**Auth Required:** Yes

**Response:** Array of dependency type responses

### Delete Dependency Type
**DELETE** `/dependency-types/{id}`

**Auth Required:** Admin only

**Response:** 204 No Content

---

## External Dependencies

### Create External Dependency
**POST** `/dependencies/for-application/{applicationId}`

**Auth Required:** Yes

**Request Body:**
```json
{
  "dependencyTypeId": "uuid (required)",
  "name": "string (required, max 255)",
  "description": "string (optional)",
  "technicalDocumentation": "string (optional)",
  "validityStartDate": "date (optional)",
  "validityEndDate": "date (optional, must be >= startDate)"
}
```

**Response:**
```json
{
  "id": "uuid",
  "application": {
    "id": "uuid",
    "name": "string",
    "status": "ApplicationStatus",
    "businessUnitName": "string"
  },
  "dependencyType": {
    "id": "uuid",
    "typeName": "string",
    "description": "string",
    "isCustom": "boolean",
    "createdAt": "timestamp",
    "updatedAt": "timestamp"
  },
  "name": "string",
  "description": "string",
  "technicalDocumentation": "string",
  "validityStartDate": "date",
  "validityEndDate": "date",
  "isActive": "boolean",
  "daysUntilExpiration": "integer (nullable)",
  "status": "ACTIVE | EXPIRING | EXPIRED | NOT_YET_VALID",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

### Update External Dependency
**PUT** `/dependencies/{id}`

**Auth Required:** Yes

**Request Body:**
```json
{
  "dependencyTypeId": "uuid (optional)",
  "name": "string (optional, max 255)",
  "description": "string (optional)",
  "technicalDocumentation": "string (optional)",
  "validityStartDate": "date (optional)",
  "validityEndDate": "date (optional)"
}
```

**Response:** Same as Create

### Get External Dependency by ID
**GET** `/dependencies/{id}`

**Auth Required:** Yes

**Response:** Same as Create

### List External Dependencies
**GET** `/dependencies`

**Auth Required:** Yes

**Query Parameters:**
- `applicationId` (optional)
- `dependencyTypeId` (optional)
- `status` (optional) - ACTIVE | EXPIRING | EXPIRED | NOT_YET_VALID
- `page` (default: 0)
- `size` (default: 20)
- `sortBy` (default: "name")
- `sortDirection` (default: "asc")

**Response:** Paginated list of external dependencies

### Get Dependencies by Application
**GET** `/dependencies/by-application/{applicationId}`

**Auth Required:** Yes

**Query Parameters:**
- `page` (default: 0)
- `size` (default: 20)

**Response:** Paginated list of external dependencies

### Get Expiring Dependencies
**GET** `/dependencies/expiring`

**Auth Required:** Yes

**Query Parameters:**
- `days` (default: 30) - number of days to look ahead

**Response:** Array of external dependencies expiring within specified days

### Get Expired Dependencies
**GET** `/dependencies/expired`

**Auth Required:** Yes

**Response:** Array of expired external dependencies

### Delete External Dependency
**DELETE** `/dependencies/{id}`

**Auth Required:** Yes

**Response:** 204 No Content

---

## Enums

### ApplicationStatus
- `IDEA` - Idea
- `IN_DEVELOPMENT` - In Development
- `IN_SERVICE` - In Service
- `MAINTENANCE` - Maintenance
- `DECOMMISSIONED` - Decommissioned

### User Roles
- `ADMIN` - Administrator
- `USER` - Regular User

### Dependency Status (Computed)
- `ACTIVE` - Currently valid
- `EXPIRING` - Expires within 30 days
- `EXPIRED` - Past end date
- `NOT_YET_VALID` - Before start date

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "timestamp": "timestamp",
  "status": 400,
  "message": "Error message",
  "errors": {
    "fieldName": "Field error message"
  }
}
```

### 401 Unauthorized
```json
{
  "timestamp": "timestamp",
  "status": 401,
  "message": "Invalid username or password"
}
```

### 404 Not Found
```json
{
  "timestamp": "timestamp",
  "status": 404,
  "message": "Resource not found with id: {id}"
}
```

### 500 Internal Server Error
```json
{
  "timestamp": "timestamp",
  "status": 500,
  "message": "An unexpected error occurred",
  "details": "Error details"
}
```

---

## Authentication Headers

All authenticated endpoints require the following header:

```
Authorization: Bearer {jwt_token}
```

The JWT token is obtained from the `/auth/login` or `/auth/register` endpoints.

---

## Pagination

Paginated responses follow this structure:

```json
{
  "content": [],
  "pageable": {
    "sort": {
      "sorted": "boolean",
      "unsorted": "boolean",
      "empty": "boolean"
    },
    "pageNumber": "integer",
    "pageSize": "integer",
    "offset": "integer",
    "paged": "boolean",
    "unpaged": "boolean"
  },
  "totalPages": "integer",
  "totalElements": "integer",
  "last": "boolean",
  "first": "boolean",
  "numberOfElements": "integer",
  "size": "integer",
  "number": "integer",
  "sort": {
    "sorted": "boolean",
    "unsorted": "boolean",
    "empty": "boolean"
  },
  "empty": "boolean"
}
```

---

## Notes

1. All dates are in ISO-8601 format (`YYYY-MM-DD`)
2. All timestamps are in ISO-8601 format with timezone (`YYYY-MM-DDTHH:mm:ss.SSSZ`)
3. UUIDs are in standard format (`xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)
4. The API uses JSON for request and response bodies
5. Swagger UI is available at `/swagger-ui.html` for interactive API documentation
6. Health check endpoint: `/actuator/health` (no auth required)
