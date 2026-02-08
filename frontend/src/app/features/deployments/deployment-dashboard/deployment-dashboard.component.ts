import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DeploymentService } from '../deployment.service';
import { CurrentDeploymentState } from '../../../shared/models/deployment.model';

interface DeploymentMatrix {
  [applicationId: string]: {
    applicationName: string;
    environments: {
      [environmentId: string]: CurrentDeploymentState;
    };
  };
}

@Component({
  selector: 'app-deployment-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './deployment-dashboard.component.html',
  styleUrls: ['./deployment-dashboard.component.scss']
})
export class DeploymentDashboardComponent implements OnInit {
  deploymentStates: CurrentDeploymentState[] = [];
  matrix: DeploymentMatrix = {};
  environmentIds: string[] = [];
  environmentNames: Map<string, string> = new Map();
  loading = false;
  error = '';

  constructor(
    private deploymentService: DeploymentService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCurrentState();
  }

  loadCurrentState(): void {
    this.loading = true;
    this.deploymentService.getCurrentState().subscribe({
      next: (states) => {
        this.deploymentStates = states;
        this.buildMatrix();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load deployment state';
        this.loading = false;
      }
    });
  }

  buildMatrix(): void {
    this.matrix = {};
    const envSet = new Set<string>();

    this.deploymentStates.forEach(state => {
      const appId = state.application.id;
      const envId = state.environment.id;

      if (!this.matrix[appId]) {
        this.matrix[appId] = {
          applicationName: state.application.name,
          environments: {}
        };
      }

      this.matrix[appId].environments[envId] = state;
      envSet.add(envId);
      this.environmentNames.set(envId, state.environment.name);
    });

    this.environmentIds = Array.from(envSet).sort();
  }

  getApplicationIds(): string[] {
    return Object.keys(this.matrix);
  }

  getDeploymentForCell(appId: string, envId: string): CurrentDeploymentState | undefined {
    return this.matrix[appId]?.environments[envId];
  }

  getCellClass(deployment?: CurrentDeploymentState): string {
    if (!deployment) return 'cell-empty';

    const daysAgo = this.getDaysAgo(deployment.deploymentDate);
    
    if (daysAgo < 30) return 'cell-recent';
    if (daysAgo < 90) return 'cell-moderate';
    return 'cell-old';
  }

  getDaysAgo(date: Date): number {
    const now = new Date();
    const deployDate = new Date(date);
    const diff = now.getTime() - deployDate.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  recordDeployment(): void {
    this.router.navigate(['/deployments/new']);
  }
}
