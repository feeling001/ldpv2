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
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./core/layout/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'business-units',
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
          },
          {
            path: ':applicationId/versions/new',
            loadComponent: () => import('./features/versions/version-form/version-form.component')
              .then(m => m.VersionFormComponent)
          },
          {
            path: ':applicationId/versions/:versionId/edit',
            loadComponent: () => import('./features/versions/version-form/version-form.component')
              .then(m => m.VersionFormComponent)
          }
        ]
      },
      {
        path: 'environments',
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
      },
      {
        path: 'deployments',
        children: [
          {
            path: '',
            loadComponent: () => import('./features/deployments/deployment-list/deployment-list.component')
              .then(m => m.DeploymentListComponent)
          },
          {
            path: 'new',
            loadComponent: () => import('./features/deployments/deployment-form/deployment-form.component')
              .then(m => m.DeploymentFormComponent)
          },
          {
            path: 'current',
            loadComponent: () => import('./features/deployments/deployment-dashboard/deployment-dashboard.component')
              .then(m => m.DeploymentDashboardComponent)
          }
        ]
      },
      {
        path: 'persons',
        children: [
          {
            path: '',
            loadComponent: () => import('./features/persons/person-list/person-list.component')
              .then(m => m.PersonListComponent)
          },
          {
            path: 'new',
            loadComponent: () => import('./features/persons/person-form/person-form.component')
              .then(m => m.PersonFormComponent)
          },
          {
            path: ':id',
            loadComponent: () => import('./features/persons/person-detail/person-detail.component')
              .then(m => m.PersonDetailComponent)
          },
          {
            path: ':id/edit',
            loadComponent: () => import('./features/persons/person-form/person-form.component')
              .then(m => m.PersonFormComponent)
          }
        ]
      },
      {
        path: 'contacts',
        children: [
          {
            path: '',
            loadComponent: () => import('./features/contacts/contact-list/contact-list.component')
              .then(m => m.ContactListComponent)
          },
          {
            path: 'new',
            loadComponent: () => import('./features/contacts/contact-form/contact-form.component')
              .then(m => m.ContactFormComponent)
          },
          {
            path: ':id',
            loadComponent: () => import('./features/contacts/contact-detail/contact-detail.component')
              .then(m => m.ContactDetailComponent)
          }
        ]
      },
      {
        path: 'contact-roles',
        loadComponent: () => import('./features/contacts/contact-role-list/contact-role-list.component')
          .then(m => m.ContactRoleListComponent)
      }
    ]
  }
];
