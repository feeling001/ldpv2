import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Environment,
  CreateEnvironmentRequest,
  UpdateEnvironmentRequest,
  Page
} from '../../shared/models/environment.model';

@Injectable({
  providedIn: 'root'
})
export class EnvironmentService {
  private readonly API_URL = '/api/environments';

  constructor(private http: HttpClient) {}

  getEnvironments(
    page: number = 0,
    size: number = 20,
    sortBy: string = 'name',
    sortDirection: string = 'asc'
  ): Observable<Page<Environment>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDirection', sortDirection);

    return this.http.get<Page<Environment>>(this.API_URL, { params });
  }

  searchEnvironments(query: string, page: number = 0, size: number = 20): Observable<Page<Environment>> {
    const params = new HttpParams()
      .set('query', query)
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<Page<Environment>>(`${this.API_URL}/search`, { params });
  }

  getEnvironment(id: string): Observable<Environment> {
    return this.http.get<Environment>(`${this.API_URL}/${id}`);
  }

  createEnvironment(data: CreateEnvironmentRequest): Observable<Environment> {
    return this.http.post<Environment>(this.API_URL, data);
  }

  updateEnvironment(id: string, data: UpdateEnvironmentRequest): Observable<Environment> {
    return this.http.put<Environment>(`${this.API_URL}/${id}`, data);
  }

  deleteEnvironment(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }
}
