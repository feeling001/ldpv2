import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./core/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'business-units',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./features/business-units/business-unit-list/business-unit-list.component')
          .then(m => m.BusinessUnitListComponent)
      },
      {
        path: 'new',
        loadComponent: () => import('./features/business-units/business-unit-form/business-unit-form.component')
          .then(m => m.BusinessUnitFormComponent)
      },
      {
        path: ':id',
        loadComponent: () => import('./features/business-units/business-unit-detail/business-unit-detail.component')
          .then(m => m.BusinessUnitDetailComponent)
      },
      {
        path: ':id/edit',
        loadComponent: () => import('./features/business-units/business-unit-form/business-unit-form.component')
          .then(m => m.BusinessUnitFormComponent)
      }
    ]
  },
  {
    path: 'applications',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./features/applications/application-list/application-list.component')
          .then(m => m.ApplicationListComponent)
      },
      {
        path: 'new',
        loadComponent: () => import('./features/applications/application-form/application-form.component')
          .then(m => m.ApplicationFormComponent)
      },
      {
        path: ':id',
        loadComponent: () => import('./features/applications/application-detail/application-detail.component')
          .then(m => m.ApplicationDetailComponent)
      },
      {
        path: ':id/edit',
        loadComponent: () => import('./features/applications/application-form/application-form.component')
          .then(m => m.ApplicationFormComponent)
      }
    ]
  },
  {
    path: 'environments',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./features/environments/environment-list/environment-list.component')
          .then(m => m.EnvironmentListComponent)
      },
      {
        path: 'new',
        loadComponent: () => import('./features/environments/environment-form/environment-form.component')
          .then(m => m.EnvironmentFormComponent)
      },
      {
        path: ':id',
        loadComponent: () => import('./features/environments/environment-detail/environment-detail.component')
          .then(m => m.EnvironmentDetailComponent)
      },
      {
        path: ':id/edit',
        loadComponent: () => import('./features/environments/environment-form/environment-form.component')
          .then(m => m.EnvironmentFormComponent)
      }
    ]
  }
];
