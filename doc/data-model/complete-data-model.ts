# LDPv2 - Complete Data Model (TypeScript)

This file contains all TypeScript interfaces and enums for the LDPv2 MVP.

## Enums

```typescript
// Application lifecycle status
export enum ApplicationStatus {
  IDEA = 'IDEA',
  IN_DEVELOPMENT = 'IN_DEVELOPMENT',
  IN_SERVICE = 'IN_SERVICE',
  MAINTENANCE = 'MAINTENANCE',
  DECOMMISSIONED = 'DECOMMISSIONED'
}

// External dependency types (Phase 2)
export enum ExternalDependencyType {
  WEB_SERVICE = 'WEB_SERVICE',
  DATABASE = 'DATABASE',
  CERTIFICATE = 'CERTIFICATE',
  NETWORK_FLOW = 'NETWORK_FLOW'
}

// Day of week for maintenance windows (Phase 2)
export enum DayOfWeek {
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY',
  SUNDAY = 'SUNDAY'
}
```

---

## Core Entities

### Business Unit

```typescript
export interface BusinessUnit {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBusinessUnitRequest {
  name: string;
  description?: string;
}

export interface UpdateBusinessUnitRequest {
  name?: string;
  description?: string;
}

export interface BusinessUnitSummary {
  id: string;
  name: string;
}
```

---

### Application

```typescript
export interface Application {
  id: string;
  name: string;
  description?: string;
  status: ApplicationStatus;
  businessUnit: BusinessUnitSummary;
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

export interface ApplicationSummary {
  id: string;
  name: string;
  status: ApplicationStatus;
  businessUnitName: string;
}
```

---

### Environment

```typescript
export interface Environment {
  id: string;
  name: string;
  description?: string;
  isProduction: boolean;
  criticalityLevel?: number; // 1-5
  isActive: boolean;
  environmentGroup?: string;
  tags?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateEnvironmentRequest {
  name: string;
  description?: string;
  isProduction: boolean;
  criticalityLevel?: number;
  environmentGroup?: string;
  tags?: string;
}

export interface UpdateEnvironmentRequest {
  name?: string;
  description?: string;
  isProduction?: boolean;
  criticalityLevel?: number;
  isActive?: boolean;
  environmentGroup?: string;
  tags?: string;
}

export interface EnvironmentSummary {
  id: string;
  name: string;
  isProduction: boolean;
}
```

---

### Version

```typescript
export interface Version {
  id: string;
  applicationId: string;
  versionIdentifier: string; // "1.2.3", "2024.Q1"
  externalReference?: string; // Git tag, JIRA link
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

export interface UpdateVersionRequest {
  versionIdentifier?: string;
  externalReference?: string;
  releaseDate?: Date;
  endOfLifeDate?: Date;
}

export interface VersionSummary {
  id: string;
  versionIdentifier: string;
  releaseDate: Date;
}
```

---

### Deployment

```typescript
export interface Deployment {
  id: string;
  application: ApplicationSummary;
  version: VersionSummary;
  environment: EnvironmentSummary;
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
  application: ApplicationSummary;
  environment: EnvironmentSummary;
  version: VersionSummary;
  deploymentDate: Date;
  deployedBy?: string;
}

export interface DeploymentSearchCriteria {
  applicationId?: string;
  applicationName?: string;
  versionId?: string;
  environmentIds?: string[];
  dateFrom?: Date;
  dateTo?: Date;
  deployedBy?: string;
  notes?: string;
}
```

---

### Contact Management

```typescript
export interface ContactRole {
  id: string;
  roleName: string;
  description?: string;
}

export interface Person {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePersonRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

export interface UpdatePersonRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
}

export interface Contact {
  id: string;
  contactRole: ContactRole;
  persons: PersonInContact[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PersonInContact {
  person: Person;
  isPrimary: boolean;
}

export interface CreateContactRequest {
  contactRoleId: string;
  personIds: string[];
  primaryPersonId: string;
}
```

---

### User & Authentication

```typescript
export interface User {
  id: string;
  username: string;
  email: string;
  role: string; // "ADMIN", "USER"
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}
```

---

## Statistics & Analytics

```typescript
export interface DeploymentSummary {
  totalApplications: number;
  totalDeployments: number;
  deploymentsThisWeek: number;
  deploymentsThisMonth: number;
  productionDeployments: number;
}

export interface DeploymentFrequency {
  date: string; // "2026-02-01"
  count: number;
}

export interface EnvironmentStats {
  environmentName: string;
  deploymentCount: number;
}

export interface ApplicationStats {
  applicationName: string;
  deploymentCount: number;
}

export interface VersionDistribution {
  versionIdentifier: string;
  environmentCount: number;
  environments: string[];
}

export interface CalendarData {
  date: string; // "2026-02-01"
  deploymentCount: number;
  activityLevel: 'low' | 'normal' | 'high' | 'none';
}
```

---

## Pagination & Sorting

```typescript
export interface Pageable {
  pageNumber: number;
  pageSize: number;
  sort: Sort;
}

export interface Sort {
  sorted: boolean;
  unsorted: boolean;
  orders?: SortOrder[];
}

export interface SortOrder {
  property: string;
  direction: 'ASC' | 'DESC';
}

export interface Page<T> {
  content: T[];
  pageable: Pageable;
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
  size: number;
  number: number;
  numberOfElements: number;
  empty: boolean;
}
```

---

## Error Handling

```typescript
export interface ApiError {
  status: number;
  message: string;
  timestamp: Date;
  path?: string;
  errors?: FieldError[];
}

export interface FieldError {
  field: string;
  message: string;
  rejectedValue?: any;
}
```

---

## Future Entities (Phase 2)

These are not part of the MVP but are included for completeness:

```typescript
// External Dependencies (Phase 2)
export interface ExternalDependency {
  id: string;
  applicationId: string;
  dependencyType: ExternalDependencyType;
  name: string;
  description?: string;
  documentation?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Data Usage Agreements (Phase 2)
export interface DataUsageAgreement {
  id: string;
  dataNature: string;
  documentationUrl: string;
  startDate: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// SLA (Phase 2)
export interface SLA {
  id: string;
  availabilityPercentage: number;
  minAvgResponseTimeSeconds: number;
  reactionTime: string;
  diagramJson?: object;
  dependenciesDescription?: string;
  responsibilityScope?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Technical Documentation (Phase 2)
export interface TechnicalDocumentation {
  id: string;
  applicationId: string;
  title: string;
  url: string;
  createdAt: Date;
  updatedAt: Date;
}
```

---

**File Version**: 1.0  
**Last Updated**: February 2026  
**Status**: Complete for MVP
