import { ApplicationStatus } from './application.model';

export interface Deployment {
  id: string;
  application: {
    id: string;
    name: string;
    status: ApplicationStatus;
    businessUnitName: string;
  };
  version: {
    id: string;
    versionIdentifier: string;
    releaseDate: Date;
  };
  environment: {
    id: string;
    name: string;
    isProduction: boolean;
  };
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
  application: {
    id: string;
    name: string;
    status: ApplicationStatus;
    businessUnitName: string;
  };
  environment: {
    id: string;
    name: string;
    isProduction: boolean;
  };
  version: {
    id: string;
    versionIdentifier: string;
    releaseDate: Date;
  };
  deploymentDate: Date;
  deployedBy?: string;
}
