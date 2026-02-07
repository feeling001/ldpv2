#!/bin/bash

BASE="/home/claude/ldpv2-monorepo/frontend/src/app"

# ========== MODELS ==========

cat > "$BASE/shared/models/user.model.ts" << 'TS'
export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  type: string;
  user: User;
}
TS

cat > "$BASE/shared/models/environment.model.ts" << 'TS'
export interface Environment {
  id: string;
  name: string;
  description?: string;
  isProduction: boolean;
  criticalityLevel?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateEnvironmentRequest {
  name: string;
  description?: string;
  isProduction?: boolean;
  criticalityLevel?: number;
}

export interface UpdateEnvironmentRequest {
  name?: string;
  description?: string;
  isProduction?: boolean;
  criticalityLevel?: number;
}

export interface Page<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      sorted: boolean;
      unsorted: boolean;
    };
  };
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
  size: number;
  number: number;
  numberOfElements: number;
  empty: boolean;
}
TS

echo "Models created"

# ========== SERVICES ==========

cat > "$BASE/core/auth/auth.service.ts" << 'TS'
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { LoginRequest, RegisterRequest, AuthResponse, User } from '../../shared/models/user.model';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'current_user';
  private currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());

  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>('/api/auth/login', credentials).pipe(
      tap(response => {
        this.setSession(response);
      })
    );
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>('/api/auth/register', data).pipe(
      tap(response => {
        this.setSession(response);
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  private setSession(authResponse: AuthResponse): void {
    localStorage.setItem(this.TOKEN_KEY, authResponse.token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(authResponse.user));
    this.currentUserSubject.next(authResponse.user);
  }

  private getUserFromStorage(): User | null {
    const userJson = localStorage.getItem(this.USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
  }
}
TS

cat > "$BASE/features/environments/environment.service.ts" << 'TS'
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
TS

echo "Services created"

# ========== INTERCEPTORS ==========

cat > "$BASE/core/interceptors/jwt.interceptor.ts" << 'TS'
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../auth/auth.service';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  if (token && !req.url.includes('/auth/')) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req);
};
TS

cat > "$BASE/core/interceptors/error.interceptor.ts" << 'TS'
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Unauthorized - redirect to login
        localStorage.removeItem('auth_token');
        localStorage.removeItem('current_user');
        router.navigate(['/login']);
      }

      return throwError(() => error);
    })
  );
};
TS

echo "Interceptors created"

# ========== GUARDS ==========

cat > "$BASE/core/guards/auth.guard.ts" << 'TS'
import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../auth/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  // Store the attempted URL for redirecting
  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};
TS

echo "Guards created"

echo "✓ All Angular TypeScript files created successfully!"

