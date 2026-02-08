import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DeploymentService } from '../../deployments/deployment.service';
import { Deployment } from '../../../shared/models/deployment.model';
import { Page } from '../../../shared/models/environment.model';

@Component({
  selector: 'app-application-deployments',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './application-deployments.component.html',
  styleUrls: ['./application-deployments.component.scss']
})
export class ApplicationDeploymentsComponent implements OnInit {
  @Input() applicationId!: string;
  @Input() applicationName!: string;

  deployments: Deployment[] = [];
  loading = false;
  error = '';
  
  page = 0;
  size = 10;
  totalPages = 0;

  constructor(
    private deploymentService: DeploymentService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (this.applicationId) {
      this.loadDeployments();
    }
  }

  loadDeployments(): void {
    this.loading = true;
    this.deploymentService.getDeploymentsByApplication(this.applicationId, this.page, this.size).subscribe({
      next: (data: Page<Deployment>) => {
        this.deployments = data.content;
        this.totalPages = data.totalPages;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load deployments';
        this.loading = false;
      }
    });
  }

  recordDeployment(): void {
    this.router.navigate(['/deployments/new'], {
      queryParams: { applicationId: this.applicationId }
    });
  }

  viewDetails(id: string): void {
    this.router.navigate(['/deployments', id]);
  }

  getDaysAgo(date: Date): number {
    const now = new Date();
    const deployDate = new Date(date);
    const diff = now.getTime() - deployDate.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
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
}
