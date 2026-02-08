import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Deployment, RecordDeploymentRequest, CurrentDeploymentState } from '../../shared/models/deployment.model';
import { Page } from '../../shared/models/environment.model';

@Injectable({
  providedIn: 'root'
})
export class DeploymentService {
  private readonly API_URL = '/api/deployments';

  constructor(private http: HttpClient) {}

  getDeployments(
    filters?: {
      applicationId?: string;
      environmentId?: string;
      versionId?: string;
      dateFrom?: Date;
      dateTo?: Date;
    },
    page: number = 0,
    size: number = 20,
    sortBy: string = 'deploymentDate',
    sortDirection: string = 'desc'
  ): Observable<Page<Deployment>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDirection', sortDirection);

    if (filters?.applicationId) {
      params = params.set('applicationId', filters.applicationId);
    }
    if (filters?.environmentId) {
      params = params.set('environmentId', filters.environmentId);
    }
    if (filters?.versionId) {
      params = params.set('versionId', filters.versionId);
    }
    if (filters?.dateFrom) {
      params = params.set('dateFrom', filters.dateFrom.toISOString());
    }
    if (filters?.dateTo) {
      params = params.set('dateTo', filters.dateTo.toISOString());
    }

    return this.http.get<Page<Deployment>>(this.API_URL, { params });
  }

  getDeployment(id: string): Observable<Deployment> {
    return this.http.get<Deployment>(`${this.API_URL}/${id}`);
  }

  getDeploymentsByApplication(applicationId: string, page: number = 0, size: number = 20): Observable<Page<Deployment>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<Page<Deployment>>(
      `${this.API_URL}/by-application/${applicationId}`,
      { params }
    );
  }

  getDeploymentsByEnvironment(environmentId: string, page: number = 0, size: number = 20): Observable<Page<Deployment>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<Page<Deployment>>(
      `${this.API_URL}/by-environment/${environmentId}`,
      { params }
    );
  }

  getCurrentState(applicationId?: string, environmentId?: string): Observable<CurrentDeploymentState[]> {
    let params = new HttpParams();
    if (applicationId) {
      params = params.set('applicationId', applicationId);
    }
    if (environmentId) {
      params = params.set('environmentId', environmentId);
    }

    return this.http.get<CurrentDeploymentState[]>(
      `${this.API_URL}/current`,
      { params }
    );
  }

  recordDeployment(data: RecordDeploymentRequest): Observable<Deployment> {
    return this.http.post<Deployment>(this.API_URL, data);
  }
}
