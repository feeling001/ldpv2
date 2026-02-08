import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Person, CreatePersonRequest, UpdatePersonRequest } from '../../shared/models/contact.model';
import { Page } from '../../shared/models/environment.model';

@Injectable({
  providedIn: 'root'
})
export class PersonService {
  private readonly API_URL = '/api/persons';

  constructor(private http: HttpClient) {}

  getPersons(
    name?: string,
    page: number = 0,
    size: number = 20,
    sortBy: string = 'lastName',
    sortDirection: string = 'asc'
  ): Observable<Page<Person>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDirection', sortDirection);

    if (name && name.trim()) {
      params = params.set('name', name.trim());
    }

    return this.http.get<Page<Person>>(this.API_URL, { params });
  }

  getPerson(id: string): Observable<Person> {
    return this.http.get<Person>(`${this.API_URL}/${id}`);
  }

  createPerson(data: CreatePersonRequest): Observable<Person> {
    return this.http.post<Person>(this.API_URL, data);
  }

  updatePerson(id: string, data: UpdatePersonRequest): Observable<Person> {
    return this.http.put<Person>(`${this.API_URL}/${id}`, data);
  }

  deletePerson(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }
}
