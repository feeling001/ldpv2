import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  BusinessUnit,
  CreateBusinessUnitRequest,
  UpdateBusinessUnitRequest
} from '../../shared/models/business-unit.model';
import { Page } from '../../shared/models/environment.model';

@Injectable({
  providedIn: 'root'
})
export class BusinessUnitService {
  private readonly API_URL = '/api/business-units';

  constructor(private http: HttpClient) {}

  getBusinessUnits(
    page: number = 0,
    size: number = 20,
    sortBy: string = 'name',
    sortDirection: string = 'asc'
  ): Observable<Page<BusinessUnit>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDirection', sortDirection);

    return this.http.get<Page<BusinessUnit>>(this.API_URL, { params });
  }

  searchBusinessUnits(query: string, page: number = 0, size: number = 20): Observable<Page<BusinessUnit>> {
    const params = new HttpParams()
      .set('q', query)
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<Page<BusinessUnit>>(`${this.API_URL}/search`, { params });
  }

  getBusinessUnit(id: string): Observable<BusinessUnit> {
    return this.http.get<BusinessUnit>(`${this.API_URL}/${id}`);
  }

  createBusinessUnit(data: CreateBusinessUnitRequest): Observable<BusinessUnit> {
    return this.http.post<BusinessUnit>(this.API_URL, data);
  }

  updateBusinessUnit(id: string, data: UpdateBusinessUnitRequest): Observable<BusinessUnit> {
    return this.http.put<BusinessUnit>(`${this.API_URL}/${id}`, data);
  }

  deleteBusinessUnit(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }
}
