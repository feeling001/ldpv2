import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DependencyService } from '../dependency.service';
import { ExternalDependency, DependencyType } from '../../../shared/models/dependency.model';
import { Page } from '../../../shared/models/environment.model';

@Component({
  selector: 'app-dependency-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dependency-list.component.html',
  styleUrls: ['./dependency-list.component.scss']
})
export class DependencyListComponent implements OnInit {
  dependencies: ExternalDependency[] = [];
  dependencyTypes: DependencyType[] = [];
  loading = false;
  error = '';
  
  page = 0;
  size = 20;
  totalElements = 0;
  totalPages = 0;

  selectedTypeId = '';
  selectedStatus = '';

  statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'ACTIVE', label: 'Active' },
    { value: 'EXPIRING', label: 'Expiring Soon' },
    { value: 'EXPIRED', label: 'Expired' },
    { value: 'NOT_YET_VALID', label: 'Not Yet Valid' }
  ];

  constructor(
    private dependencyService: DependencyService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDependencyTypes();
    this.loadDependencies();
  }

  loadDependencyTypes(): void {
    this.dependencyService.getDependencyTypes().subscribe({
      next: (types) => {
        this.dependencyTypes = types;
      },
      error: (err) => {
        console.error('Failed to load dependency types', err);
      }
    });
  }

  loadDependencies(): void {
    this.loading = true;
    const filters: any = {};
    
    if (this.selectedTypeId) {
      filters.dependencyTypeId = this.selectedTypeId;
    }
    if (this.selectedStatus) {
      filters.status = this.selectedStatus;
    }

    this.dependencyService.getDependencies(filters, this.page, this.size).subscribe({
      next: (data: Page<ExternalDependency>) => {
        this.dependencies = data.content;
        this.totalElements = data.totalElements;
        this.totalPages = data.totalPages;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load dependencies';
        this.loading = false;
      }
    });
  }

  onFilterChange(): void {
    this.page = 0;
    this.loadDependencies();
  }

  createNew(): void {
    this.router.navigate(['/dependencies/new']);
  }

  viewDetails(id: string): void {
    this.router.navigate(['/dependencies', id]);
  }

  edit(id: string): void {
    this.router.navigate(['/dependencies', id, 'edit']);
  }

  delete(id: string): void {
    if (confirm('Are you sure you want to delete this dependency?')) {
      this.dependencyService.deleteDependency(id).subscribe({
        next: () => {
          this.loadDependencies();
        },
        error: (err) => {
          this.error = 'Failed to delete dependency';
        }
      });
    }
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      'ACTIVE': 'status-active',
      'EXPIRING': 'status-expiring',
      'EXPIRED': 'status-expired',
      'NOT_YET_VALID': 'status-not-valid'
    };
    return classes[status] || '';
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'ACTIVE': 'Active',
      'EXPIRING': 'Expiring Soon',
      'EXPIRED': 'Expired',
      'NOT_YET_VALID': 'Not Yet Valid'
    };
    return labels[status] || status;
  }

  nextPage(): void {
    if (this.page < this.totalPages - 1) {
      this.page++;
      this.loadDependencies();
    }
  }

  previousPage(): void {
    if (this.page > 0) {
      this.page--;
      this.loadDependencies();
    }
  }
}
