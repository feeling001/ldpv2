export interface ContactRole {
  id: string;
  roleName: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
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

export interface PersonInContact {
  person: Person;
  isPrimary: boolean;
}

export interface Contact {
  id: string;
  contactRole: ContactRole;
  persons: PersonInContact[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ContactResponse {
  id: string;
  contactRole: ContactRole;
  persons: PersonInContact[];
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

export interface CreateContactRequest {
  contactRoleId: string;
  personIds: string[];
  primaryPersonId: string;
}

export interface CreateContactRoleRequest {
  roleName: string;
  description?: string;
}
