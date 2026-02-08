import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { ApplicationService } from '../application.service';
import { Application, ApplicationStatus } from '../../../shared/models/application.model';

@Component({
  selector: 'app-application-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './application-detail.component.html',
  styleUrls: ['./application-detail.component.scss']
})
export class ApplicationDetailComponent implements OnInit {
  application?: Application;
  loading = false;
  error = '';

  constructor(
    private applicationService: ApplicationService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadApplication(id);
    }
  }

  loadApplication(id: string): void {
    this.loading = true;
    this.applicationService.getApplication(id).subscribe({
      next: (app) => {
        this.application = app;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load application';
        this.loading = false;
      }
    });
  }

  edit(): void {
    if (this.application) {
      this.router.navigate(['/applications', this.application.id, 'edit']);
    }
  }

  delete(): void {
    if (this.application && confirm('Are you sure you want to delete this application?')) {
      this.applicationService.deleteApplication(this.application.id).subscribe({
        next: () => {
          this.router.navigate(['/applications']);
        },
        error: (err) => {
          this.error = 'Failed to delete application';
        }
      });
    }
  }

  back(): void {
    this.router.navigate(['/applications']);
  }

  getStatusDisplay(status: ApplicationStatus): string {
    const displays: Record<ApplicationStatus, string> = {
      [ApplicationStatus.IDEA]: 'Idea',
      [ApplicationStatus.IN_DEVELOPMENT]: 'In Development',
      [ApplicationStatus.IN_SERVICE]: 'In Service',
      [ApplicationStatus.MAINTENANCE]: 'Maintenance',
      [ApplicationStatus.DECOMMISSIONED]: 'Decommissioned'
    };
    return displays[status] || status;
  }

  getStatusClass(status: ApplicationStatus): string {
    const classes: Record<ApplicationStatus, string> = {
      [ApplicationStatus.IDEA]: 'status-idea',
      [ApplicationStatus.IN_DEVELOPMENT]: 'status-in-development',
      [ApplicationStatus.IN_SERVICE]: 'status-in-service',
      [ApplicationStatus.MAINTENANCE]: 'status-maintenance',
      [ApplicationStatus.DECOMMISSIONED]: 'status-decommissioned'
    };
    return classes[status] || '';
  }
}
