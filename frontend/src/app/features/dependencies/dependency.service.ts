import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ExternalDependency,
  CreateExternalDependencyRequest,
  UpdateExternalDependencyRequest,
  DependencyType,
  CreateDependencyTypeRequest,
  UpdateDependencyTypeRequest
} from '../../shared/models/dependency.model';
import { Page } from '../../shared/models/environment.model';

@Injectable({
  providedIn: 'root'
})
export class DependencyService {
  private readonly API_URL = '/api/dependencies';
  private readonly TYPE_API_URL = '/api/dependency-types';

  constructor(private http: HttpClient) {}

  // Dependency Types
  getDependencyTypes(): Observable<DependencyType[]> {
    return this.http.get<DependencyType[]>(this.TYPE_API_URL);
  }

  getDependencyType(id: string): Observable<DependencyType> {
    return this.http.get<DependencyType>(`${this.TYPE_API_URL}/${id}`);
  }

  createDependencyType(data: CreateDependencyTypeRequest): Observable<DependencyType> {
    return this.http.post<DependencyType>(this.TYPE_API_URL, data);
  }

  updateDependencyType(id: string, data: UpdateDependencyTypeRequest): Observable<DependencyType> {
    return this.http.put<DependencyType>(`${this.TYPE_API_URL}/${id}`, data);
  }

  deleteDependencyType(id: string): Observable<void> {
    return this.http.delete<void>(`${this.TYPE_API_URL}/${id}`);
  }

  // External Dependencies
  getDependencies(
    filters?: {
      applicationId?: string;
      dependencyTypeId?: string;
      status?: string;
    },
    page: number = 0,
    size: number = 20,
    sortBy: string = 'name',
    sortDirection: string = 'asc'
  ): Observable<Page<ExternalDependency>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDirection', sortDirection);

    if (filters?.applicationId) {
      params = params.set('applicationId', filters.applicationId);
    }
    if (filters?.dependencyTypeId) {
      params = params.set('dependencyTypeId', filters.dependencyTypeId);
    }
    if (filters?.status) {
      params = params.set('status', filters.status);
    }

    return this.http.get<Page<ExternalDependency>>(this.API_URL, { params });
  }

  getDependency(id: string): Observable<ExternalDependency> {
    return this.http.get<ExternalDependency>(`${this.API_URL}/${id}`);
  }

  getDependenciesByApplication(
    applicationId: string,
    page: number = 0,
    size: number = 20
  ): Observable<Page<ExternalDependency>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<Page<ExternalDependency>>(
      `${this.API_URL}/by-application/${applicationId}`,
      { params }
    );
  }

  createDependency(
    applicationId: string,
    data: CreateExternalDependencyRequest
  ): Observable<ExternalDependency> {
    return this.http.post<ExternalDependency>(
      `${this.API_URL}/for-application/${applicationId}`,
      data
    );
  }

  updateDependency(
    id: string,
    data: UpdateExternalDependencyRequest
  ): Observable<ExternalDependency> {
    return this.http.put<ExternalDependency>(`${this.API_URL}/${id}`, data);
  }

  deleteDependency(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  getExpiringDependencies(days: number = 30): Observable<ExternalDependency[]> {
    const params = new HttpParams().set('days', days.toString());
    return this.http.get<ExternalDependency[]>(`${this.API_URL}/expiring`, { params });
  }

  getExpiredDependencies(): Observable<ExternalDependency[]> {
    return this.http.get<ExternalDependency[]>(`${this.API_URL}/expired`);
  }
}
