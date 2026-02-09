export interface DependencyType {
  id: string;
  typeName: string;
  description?: string;
  isCustom: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExternalDependency {
  id: string;
  application: {
    id: string;
    name: string;
  };
  dependencyType: DependencyType;
  name: string;
  description?: string;
  technicalDocumentation?: string;
  validityStartDate?: Date;
  validityEndDate?: Date;
  isActive: boolean;
  daysUntilExpiration?: number;
  status: 'ACTIVE' | 'EXPIRING' | 'EXPIRED' | 'NOT_YET_VALID';
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
