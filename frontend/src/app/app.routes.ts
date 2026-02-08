import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/business-units',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./core/auth/login/login.component').then(m => m.LoginComponent)
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
