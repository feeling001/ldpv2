# LDPv2 - Complete Data Model (TypeScript) - Including Phase 2

This file contains all TypeScript interfaces and enums for the LDPv2 including Phase 2 features.

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

// External dependency types (Phase 2 - Story 8)
export enum ExternalDependencyType {
  WEB_SERVICE = 'WEB_SERVICE',
  DATABASE = 'DATABASE',
  CERTIFICATE = 'CERTIFICATE',
  NETWORK_FLOW = 'NETWORK_FLOW'
}

// Day of week for maintenance windows (Phase 2 - Story 10)
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

## Core Entities (MVP - Stories 0-7)

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

export interface ContactSummary {
  id: string;
  roleName: string;
  primaryPersonName?: string;
  primaryPersonEmail?: string;
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

## Phase 2 Entities (Stories 8-10)

### Story 8: External Dependencies

```typescript
export interface DependencyType {
  id: string;
  typeName: string; // WEB_SERVICE, DATABASE, CERTIFICATE, NETWORK_FLOW, or custom
  description?: string;
  isCustom: boolean; // True if admin-created, false if seeded default
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateDependencyTypeRequest {
  typeName: string;
  description?: string;
}

export interface UpdateDependencyTypeRequest {
  typeName?: string;
  description?: string;
}

export interface ExternalDependency {
  id: string;
  application: ApplicationSummary;
  dependencyType: DependencyType;
  name: string;
  description?: string;
  technicalDocumentation?: string;
  validityStartDate?: Date;
  validityEndDate?: Date;
  isActive: boolean; // Computed based on validity dates
  daysUntilExpiration?: number; // Computed if expiring soon
  status: 'ACTIVE' | 'EXPIRING' | 'EXPIRED' | 'NOT_YET_VALID'; // Computed
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

export interface DependencySummary {
  id: string;
  name: string;
  dependencyType: string;
  application: ApplicationSummary;
  status: 'ACTIVE' | 'EXPIRING' | 'EXPIRED' | 'NOT_YET_VALID';
}
```

---

### Story 9: Data Usage Agreements

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
  status: 'ACTIVE' | 'EXPIRING' | 'EXPIRED' | 'FUTURE'; // Computed
  dependencies: DependencySummary[]; // Covered dependencies
  authorizingContacts: AgreementContact[]; // Who authorized
  createdAt: Date;
  updatedAt: Date;
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

export interface DataUsageAgreementSummary {
  id: string;
  dataNature: string;
  validityEndDate?: Date;
  status: 'ACTIVE' | 'EXPIRING' | 'EXPIRED' | 'FUTURE';
  dependencyCount: number;
}
```

---

### Story 10: SLA Management

```typescript
export interface SLA {
  id: string;
  application: ApplicationSummary;
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
  startTime: string; // "02:00" (HH:MM format)
  endTime: string; // "06:00" (HH:MM format)
  durationMinutes: number; // Computed
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
  isPast: boolean; // Computed
  isFuture: boolean; // Computed
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

export interface UpdateMaintenanceWindowRequest {
  dayOfWeek?: DayOfWeek;
  startTime?: string;
  endTime?: string;
}

export interface CreateCriticalPeriodRequest {
  startDatetime: Date;
  endDatetime: Date;
  description?: string;
}

export interface UpdateCriticalPeriodRequest {
  startDatetime?: Date;
  endDatetime?: Date;
  description?: string;
}

export interface SLASummary {
  id: string;
  applicationName: string;
  availabilityPercentage: number;
  maintenanceWindowsCount: number;
  activeCriticalPeriodsCount: number;
}
```

---

## Statistics & Analytics (MVP)

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

## Pagination & Sorting (Common)

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

## Error Handling (Common)

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

## Dashboard Widgets (Phase 2)

```typescript
// Story 8: Expiring Dependencies Widget
export interface ExpiringDependenciesWidget {
  totalExpiring: number; // Count expiring within 30 days
  dependencies: Array<{
    id: string;
    name: string;
    applicationName: string;
    daysUntilExpiration: number;
    validityEndDate: Date;
  }>;
}

// Story 9: Expiring Agreements Widget
export interface ExpiringAgreementsWidget {
  totalExpiring: number; // Count expiring within 90 days
  agreements: Array<{
    id: string;
    dataNature: string;
    daysUntilExpiration: number;
    validityEndDate: Date;
    dependencyCount: number;
  }>;
}

// Story 10: SLA Overview Widget
export interface SLAOverviewWidget {
  totalApplications: number;
  applicationsWithSLA: number;
  applicationsWithoutSLA: number;
  activeCriticalPeriods: number;
  upcomingCriticalPeriods: number; // Within 7 days
}
```

---

## Computed Status Helpers

```typescript
// Helper for computing dependency/agreement status
export type ValidityStatus = 'ACTIVE' | 'EXPIRING' | 'EXPIRED' | 'NOT_YET_VALID' | 'FUTURE';

export interface ValidityPeriod {
  startDate?: Date;
  endDate?: Date;
}

export function computeValidityStatus(
  period: ValidityPeriod,
  expiringThresholdDays: number = 30
): ValidityStatus {
  const now = new Date();
  
  if (period.startDate && now < period.startDate) {
    return 'NOT_YET_VALID';
  }
  
  if (!period.endDate) {
    return 'ACTIVE'; // No end date = indefinite
  }
  
  if (now > period.endDate) {
    return 'EXPIRED';
  }
  
  const daysUntilExpiration = Math.ceil(
    (period.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  if (daysUntilExpiration <= expiringThresholdDays) {
    return 'EXPIRING';
  }
  
  return 'ACTIVE';
}

export function computeDaysUntilExpiration(endDate?: Date): number | undefined {
  if (!endDate) return undefined;
  
  const now = new Date();
  if (now > endDate) return undefined; // Already expired
  
  return Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}
```

---

**File Version**: 2.0 (Phase 2 Complete)  
**Last Updated**: February 2026  
**Status**: Complete for Phase 2 (Stories 0-10)
