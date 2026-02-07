import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { EnvironmentService } from '../environment.service';
import { Environment, Page } from '../../../shared/models/environment.model';

@Component({
  selector: 'app-environment-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './environment-list.component.html',
  styleUrls: ['./environment-list.component.scss']
})
export class EnvironmentListComponent implements OnInit {
  environments: Environment[] = [];
  loading = false;
  error = '';
  
  page = 0;
  size = 20;
  totalElements = 0;
  totalPages = 0;

  constructor(
    private environmentService: EnvironmentService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadEnvironments();
  }

  loadEnvironments(): void {
    this.loading = true;
    this.environmentService.getEnvironments(this.page, this.size).subscribe({
      next: (data: Page<Environment>) => {
        this.environments = data.content;
        this.totalElements = data.totalElements;
        this.totalPages = data.totalPages;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load environments';
        this.loading = false;
      }
    });
  }

  createNew(): void {
    this.router.navigate(['/environments/new']);
  }

  viewDetails(id: string): void {
    this.router.navigate(['/environments', id]);
  }

  edit(id: string): void {
    this.router.navigate(['/environments', id, 'edit']);
  }

  delete(id: string): void {
    if (confirm('Are you sure you want to delete this environment?')) {
      this.environmentService.deleteEnvironment(id).subscribe({
        next: () => {
          this.loadEnvironments();
        },
        error: (err) => {
          this.error = 'Failed to delete environment';
        }
      });
    }
  }

  nextPage(): void {
    if (this.page < this.totalPages - 1) {
      this.page++;
      this.loadEnvironments();
    }
  }

  previousPage(): void {
    if (this.page > 0) {
      this.page--;
      this.loadEnvironments();
    }
  }
}
