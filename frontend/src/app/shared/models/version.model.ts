export interface Version {
  id: string;
  applicationId: string;
  applicationName: string;
  versionIdentifier: string;
  externalReference?: string;
  releaseDate: Date;
  endOfLifeDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface VersionSummary {
  id: string;
  versionIdentifier: string;
  releaseDate: Date;
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
