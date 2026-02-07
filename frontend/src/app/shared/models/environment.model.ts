export interface Environment {
  id: string;
  name: string;
  description?: string;
  isProduction: boolean;
  criticalityLevel?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateEnvironmentRequest {
  name: string;
  description?: string;
  isProduction?: boolean;
  criticalityLevel?: number;
}

export interface UpdateEnvironmentRequest {
  name?: string;
  description?: string;
  isProduction?: boolean;
  criticalityLevel?: number;
}

export interface Page<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      sorted: boolean;
      unsorted: boolean;
    };
  };
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
  size: number;
  number: number;
  numberOfElements: number;
  empty: boolean;
}
