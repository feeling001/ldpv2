import { ContactResponse } from './contact.model';

export enum ApplicationStatus {
  IDEA = 'IDEA',
  IN_DEVELOPMENT = 'IN_DEVELOPMENT',
  IN_SERVICE = 'IN_SERVICE',
  MAINTENANCE = 'MAINTENANCE',
  DECOMMISSIONED = 'DECOMMISSIONED'
}

export interface Application {
  id: string;
  name: string;
  description?: string;
  status: ApplicationStatus;
  businessUnit: { id: string; name: string };
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

export interface ApplicationContactResponse {
  applicationId: string;
  contact: ContactResponse;
}

export interface AddContactToApplicationRequest {
  contactId: string;
}
