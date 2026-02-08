import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { VersionService } from '../version.service';
import { Version } from '../../../shared/models/version.model';
import { Page } from '../../../shared/models/environment.model';

@Component({
  selector: 'app-version-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './version-list.component.html',
  styleUrls: ['./version-list.component.scss']
})
export class VersionListComponent implements OnInit {
  @Input() applicationId!: string;
  @Input() applicationName!: string;

  versions: Version[] = [];
  loading = false;
  error = '';
  
  page = 0;
  size = 20;
  totalPages = 0;

  constructor(
    private versionService: VersionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (this.applicationId) {
      this.loadVersions();
    }
  }

  loadVersions(): void {
    this.loading = true;
    this.versionService.getVersions(this.applicationId, this.page, this.size).subscribe({
      next: (data: Page<Version>) => {
        this.versions = data.content;
        this.totalPages = data.totalPages;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load versions';
        this.loading = false;
      }
    });
  }

  addVersion(): void {
    this.router.navigate(['/applications', this.applicationId, 'versions', 'new']);
  }

  editVersion(versionId: string): void {
    this.router.navigate(['/applications', this.applicationId, 'versions', versionId, 'edit']);
  }

  deleteVersion(versionId: string): void {
    if (confirm('Are you sure you want to delete this version?')) {
      this.versionService.deleteVersion(this.applicationId, versionId).subscribe({
        next: () => {
          this.loadVersions();
        },
        error: (err) => {
          this.error = 'Failed to delete version';
        }
      });
    }
  }

  nextPage(): void {
    if (this.page < this.totalPages - 1) {
      this.page++;
      this.loadVersions();
    }
  }

  previousPage(): void {
    if (this.page > 0) {
      this.page--;
      this.loadVersions();
    }
  }
}
