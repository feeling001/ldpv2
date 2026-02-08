import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DeploymentService } from '../deployment.service';
import { ApplicationService } from '../../applications/application.service';
import { EnvironmentService } from '../../environments/environment.service';
import { Deployment } from '../../../shared/models/deployment.model';
import { Application } from '../../../shared/models/application.model';
import { Environment } from '../../../shared/models/environment.model';
import { Page } from '../../../shared/models/environment.model';

@Component({
  selector: 'app-deployment-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './deployment-list.component.html',
  styleUrls: ['./deployment-list.component.scss']
})
export class DeploymentListComponent implements OnInit {
  deployments: Deployment[] = [];
  applications: Application[] = [];
  environments: Environment[] = [];
  
  loading = false;
  error = '';
  
  page = 0;
  size = 20;
  totalElements = 0;
  totalPages = 0;

  selectedApplicationId = '';
  selectedEnvironmentId = '';
  dateFrom = '';
  dateTo = '';

  constructor(
    private deploymentService: DeploymentService,
    private applicationService: ApplicationService,
    private environmentService: EnvironmentService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadApplications();
    this.loadEnvironments();
    this.loadDeployments();
  }

  loadApplications(): void {
    this.applicationService.getApplications({}, 0, 100).subscribe({
      next: (data: Page<Application>) => {
        this.applications = data.content;
      },
      error: (err) => console.error('Failed to load applications', err)
    });
  }

  loadEnvironments(): void {
    this.environmentService.getEnvironments(0, 100).subscribe({
      next: (data: Page<Environment>) => {
        this.environments = data.content;
      },
      error: (err) => console.error('Failed to load environments', err)
    });
  }

  loadDeployments(): void {
    this.loading = true;
    const filters: any = {};
    
    if (this.selectedApplicationId) {
      filters.applicationId = this.selectedApplicationId;
    }
    if (this.selectedEnvironmentId) {
      filters.environmentId = this.selectedEnvironmentId;
    }
    if (this.dateFrom) {
      filters.dateFrom = new Date(this.dateFrom);
    }
    if (this.dateTo) {
      filters.dateTo = new Date(this.dateTo);
    }

    this.deploymentService.getDeployments(filters, this.page, this.size).subscribe({
      next: (data: Page<Deployment>) => {
        this.deployments = data.content;
        this.totalElements = data.totalElements;
        this.totalPages = data.totalPages;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load deployments';
        this.loading = false;
      }
    });
  }

  onFilterChange(): void {
    this.page = 0;
    this.loadDeployments();
  }

  recordNew(): void {
    this.router.navigate(['/deployments/new']);
  }

  viewDetails(id: string): void {
    this.router.navigate(['/deployments', id]);
  }

  nextPage(): void {
    if (this.page < this.totalPages - 1) {
      this.page++;
      this.loadDeployments();
    }
  }

  previousPage(): void {
    if (this.page > 0) {
      this.page--;
      this.loadDeployments();
    }
  }

  getDaysAgo(date: Date): number {
    const now = new Date();
    const deployDate = new Date(date);
    const diff = now.getTime() - deployDate.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }
}
