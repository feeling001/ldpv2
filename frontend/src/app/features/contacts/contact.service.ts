import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Contact, ContactRole, CreateContactRequest, CreateContactRoleRequest } from '../../shared/models/contact.model';

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private readonly CONTACT_URL = '/api/contacts';
  private readonly ROLE_URL = '/api/contact-roles';

  constructor(private http: HttpClient) {}

  // Contact Roles
  getContactRoles(): Observable<ContactRole[]> {
    return this.http.get<ContactRole[]>(this.ROLE_URL);
  }

  createContactRole(data: CreateContactRoleRequest): Observable<ContactRole> {
    return this.http.post<ContactRole>(this.ROLE_URL, data);
  }

  // Contacts
  getContacts(): Observable<Contact[]> {
    return this.http.get<Contact[]>(this.CONTACT_URL);
  }

  getContact(id: string): Observable<Contact> {
    return this.http.get<Contact>(`${this.CONTACT_URL}/${id}`);
  }

  createContact(data: CreateContactRequest): Observable<Contact> {
    return this.http.post<Contact>(this.CONTACT_URL, data);
  }

  addPersonToContact(contactId: string, personId: string, isPrimary: boolean = false): Observable<Contact> {
    const params = new HttpParams().set('isPrimary', isPrimary.toString());
    return this.http.post<Contact>(`${this.CONTACT_URL}/${contactId}/persons/${personId}`, null, { params });
  }

  removePersonFromContact(contactId: string, personId: string): Observable<Contact> {
    return this.http.delete<Contact>(`${this.CONTACT_URL}/${contactId}/persons/${personId}`);
  }

  setPrimaryPerson(contactId: string, personId: string): Observable<Contact> {
    return this.http.patch<Contact>(`${this.CONTACT_URL}/${contactId}/persons/${personId}/primary`, null);
  }

  deleteContact(id: string): Observable<void> {
    return this.http.delete<void>(`${this.CONTACT_URL}/${id}`);
  }
}
