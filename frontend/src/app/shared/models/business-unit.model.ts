export interface BusinessUnit {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BusinessUnitSummary {
  id: string;
  name: string;
}

export interface CreateBusinessUnitRequest {
  name: string;
  description?: string;
}

export interface UpdateBusinessUnitRequest {
  name?: string;
  description?: string;
}
