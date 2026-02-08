import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Version, CreateVersionRequest, UpdateVersionRequest } from '../../shared/models/version.model';
import { Page } from '../../shared/models/environment.model';

@Injectable({
  providedIn: 'root'
})
export class VersionService {
  
  constructor(private http: HttpClient) {}

  getVersions(
    applicationId: string,
    page: number = 0,
    size: number = 20,
    sortBy: string = 'releaseDate',
    sortDirection: string = 'desc'
  ): Observable<Page<Version>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDirection', sortDirection);

    return this.http.get<Page<Version>>(
      `/api/applications/${applicationId}/versions`, 
      { params }
    );
  }

  getVersion(applicationId: string, versionId: string): Observable<Version> {
    return this.http.get<Version>(
      `/api/applications/${applicationId}/versions/${versionId}`
    );
  }

  getLatestVersion(applicationId: string): Observable<Version> {
    return this.http.get<Version>(
      `/api/applications/${applicationId}/versions/latest`
    );
  }

  createVersion(applicationId: string, data: CreateVersionRequest): Observable<Version> {
    return this.http.post<Version>(
      `/api/applications/${applicationId}/versions`,
      data
    );
  }

  updateVersion(applicationId: string, versionId: string, data: UpdateVersionRequest): Observable<Version> {
    return this.http.put<Version>(
      `/api/applications/${applicationId}/versions/${versionId}`,
      data
    );
  }

  deleteVersion(applicationId: string, versionId: string): Observable<void> {
    return this.http.delete<void>(
      `/api/applications/${applicationId}/versions/${versionId}`
    );
  }
}
