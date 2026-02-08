import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Application,
  ApplicationStatus,
  CreateApplicationRequest,
  UpdateApplicationRequest
} from '../../shared/models/application.model';
import { Page } from '../../shared/models/environment.model';

@Injectable({
  providedIn: 'root'
})
export class ApplicationService {
  private readonly API_URL = '/api/applications';

  constructor(private http: HttpClient) {}

  getApplications(
    filters?: {
      status?: ApplicationStatus;
      businessUnitId?: string;
      name?: string;
    },
    page: number = 0,
    size: number = 20,
    sortBy: string = 'name',
    sortDirection: string = 'asc'
  ): Observable<Page<Application>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDirection', sortDirection);

    if (filters?.status) {
      params = params.set('status', filters.status);
    }
    if (filters?.businessUnitId) {
      params = params.set('businessUnitId', filters.businessUnitId);
    }
    if (filters?.name) {
      params = params.set('name', filters.name);
    }

    return this.http.get<Page<Application>>(this.API_URL, { params });
  }

  getApplication(id: string): Observable<Application> {
    return this.http.get<Application>(`${this.API_URL}/${id}`);
  }

  createApplication(data: CreateApplicationRequest): Observable<Application> {
    return this.http.post<Application>(this.API_URL, data);
  }

  updateApplication(id: string, data: UpdateApplicationRequest): Observable<Application> {
    return this.http.put<Application>(`${this.API_URL}/${id}`, data);
  }

  updateStatus(id: string, status: ApplicationStatus): Observable<Application> {
    return this.http.patch<Application>(`${this.API_URL}/${id}/status`, null, {
      params: { status }
    });
  }

  deleteApplication(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }
}
