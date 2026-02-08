import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { ApplicationService } from '../application.service';
import { BusinessUnitService } from '../../business-units/business-unit.service';
import { Application, ApplicationStatus } from '../../../shared/models/application.model';
import { BusinessUnit } from '../../../shared/models/business-unit.model';
import { Page } from '../../../shared/models/environment.model';

@Component({
  selector: 'app-application-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './application-list.component.html',
  styleUrls: ['./application-list.component.scss']
})
export class ApplicationListComponent implements OnInit {
  applications: Application[] = [];
  businessUnits: BusinessUnit[] = [];
  loading = false;
  error = '';
  
  page = 0;
  size = 20;
  totalElements = 0;
  totalPages = 0;

  searchQuery = '';
  selectedStatus = '';
  selectedBusinessUnitId = '';
  
  statusOptions = Object.values(ApplicationStatus);
  
  private searchSubject = new Subject<string>();

  constructor(
    private applicationService: ApplicationService,
    private businessUnitService: BusinessUnitService,
    private router: Router
  ) {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => {
      this.page = 0;
      this.loadApplications();
    });
  }

  ngOnInit(): void {
    this.loadBusinessUnits();
    this.loadApplications();
  }

  loadBusinessUnits(): void {
    this.businessUnitService.getBusinessUnits(0, 100).subscribe({
      next: (data: Page<BusinessUnit>) => {
        this.businessUnits = data.content;
      },
      error: (err) => {
        console.error('Failed to load business units', err);
      }
    });
  }

  loadApplications(): void {
    this.loading = true;
    const filters: any = {};
    
    if (this.selectedStatus) {
      filters.status = this.selectedStatus;
    }
    if (this.selectedBusinessUnitId) {
      filters.businessUnitId = this.selectedBusinessUnitId;
    }
    if (this.searchQuery && this.searchQuery.trim() !== '') {
      filters.name = this.searchQuery.trim();
    }

    this.applicationService.getApplications(filters, this.page, this.size).subscribe({
      next: (data: Page<Application>) => {
        this.applications = data.content;
        this.totalElements = data.totalElements;
        this.totalPages = data.totalPages;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load applications';
        this.loading = false;
      }
    });
  }

  onSearchChange(query: string): void {
    this.searchQuery = query;
    this.searchSubject.next(query);
  }

  onFilterChange(): void {
    this.page = 0;
    this.loadApplications();
  }

  createNew(): void {
    this.router.navigate(['/applications/new']);
  }

  viewDetails(id: string): void {
    this.router.navigate(['/applications', id]);
  }

  edit(id: string): void {
    this.router.navigate(['/applications', id, 'edit']);
  }

  changeStatus(id: string, newStatus: string): void {
    if (!newStatus || newStatus === 'Change Status') {
      return;
    }

    this.applicationService.updateStatus(id, newStatus as ApplicationStatus).subscribe({
      next: () => {
        this.loadApplications();
      },
      error: (err) => {
        this.error = 'Failed to update status';
      }
    });
  }

  delete(id: string): void {
    if (confirm('Are you sure you want to delete this application?')) {
      this.applicationService.deleteApplication(id).subscribe({
        next: () => {
          this.loadApplications();
        },
        error: (err) => {
          this.error = 'Failed to delete application';
        }
      });
    }
  }

  nextPage(): void {
    if (this.page < this.totalPages - 1) {
      this.page++;
      this.loadApplications();
    }
  }

  previousPage(): void {
    if (this.page > 0) {
      this.page--;
      this.loadApplications();
    }
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
