import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DeploymentService } from '../deployment.service';
import { ApplicationService } from '../../applications/application.service';
import { EnvironmentService } from '../../environments/environment.service';
import { VersionService } from '../../versions/version.service';
import { AuthService } from '../../../core/auth/auth.service';
import { Application } from '../../../shared/models/application.model';
import { Environment } from '../../../shared/models/environment.model';
import { Version } from '../../../shared/models/version.model';
import { Page } from '../../../shared/models/environment.model';

@Component({
  selector: 'app-deployment-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './deployment-form.component.html',
  styleUrls: ['./deployment-form.component.scss']
})
export class DeploymentFormComponent implements OnInit {
  form: FormGroup;
  loading = false;
  error = '';
  
  applications: Application[] = [];
  environments: Environment[] = [];
  versions: Version[] = [];

  constructor(
    private fb: FormBuilder,
    private deploymentService: DeploymentService,
    private applicationService: ApplicationService,
    private environmentService: EnvironmentService,
    private versionService: VersionService,
    private authService: AuthService,
    private router: Router
  ) {
    const now = new Date();
    const currentDateTime = now.toISOString().slice(0, 16);
    const currentUser = this.authService.getCurrentUser();

    this.form = this.fb.group({
      applicationId: ['', [Validators.required]],
      versionId: ['', [Validators.required]],
      environmentId: ['', [Validators.required]],
      deploymentDate: [currentDateTime, [Validators.required]],
      deployedBy: [currentUser?.username || '', []],
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.loadApplications();
    this.loadEnvironments();

    this.form.get('applicationId')?.valueChanges.subscribe(appId => {
      if (appId) {
        this.loadVersionsForApplication(appId);
      } else {
        this.versions = [];
        this.form.patchValue({ versionId: '' });
      }
    });
  }

  loadApplications(): void {
    this.applicationService.getApplications({}, 0, 100).subscribe({
      next: (data: Page<Application>) => {
        this.applications = data.content;
      },
      error: (err) => {
        this.error = 'Failed to load applications';
      }
    });
  }

  loadEnvironments(): void {
    this.environmentService.getEnvironments(0, 100).subscribe({
      next: (data: Page<Environment>) => {
        this.environments = data.content;
      },
      error: (err) => {
        this.error = 'Failed to load environments';
      }
    });
  }

  loadVersionsForApplication(applicationId: string): void {
    this.versionService.getVersions(applicationId, 0, 100).subscribe({
      next: (data: Page<Version>) => {
        this.versions = data.content;
      },
      error: (err) => {
        this.error = 'Failed to load versions';
      }
    });
  }

  onSubmit(): void {
    if (this.form.valid) {
      const deploymentDate = new Date(this.form.value.deploymentDate);
      const now = new Date();

      if (deploymentDate > now) {
        this.error = 'Deployment date cannot be in the future';
        return;
      }

      this.loading = true;
      this.error = '';

      const formData = {
        ...this.form.value,
        deploymentDate: deploymentDate.toISOString()
      };

      this.deploymentService.recordDeployment(formData).subscribe({
        next: () => {
          this.router.navigate(['/deployments']);
        },
        error: (err) => {
          this.error = err.error?.message || 'Failed to record deployment';
          this.loading = false;
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/deployments']);
  }
}
