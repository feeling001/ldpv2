import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { BusinessUnitService } from '../business-unit.service';
import { BusinessUnit } from '../../../shared/models/business-unit.model';
import { Page } from '../../../shared/models/environment.model';

@Component({
  selector: 'app-business-unit-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './business-unit-list.component.html',
  styleUrls: ['./business-unit-list.component.scss']
})
export class BusinessUnitListComponent implements OnInit {
  businessUnits: BusinessUnit[] = [];
  loading = false;
  error = '';
  
  page = 0;
  size = 20;
  totalElements = 0;
  totalPages = 0;

  searchQuery = '';
  private searchSubject = new Subject<string>();

  constructor(
    private businessUnitService: BusinessUnitService,
    private router: Router
  ) {
    // Setup search debounce
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(query => {
      this.performSearch(query);
    });
  }

  ngOnInit(): void {
    this.loadBusinessUnits();
  }

  loadBusinessUnits(): void {
    this.loading = true;
    this.businessUnitService.getBusinessUnits(this.page, this.size).subscribe({
      next: (data: Page<BusinessUnit>) => {
        this.businessUnits = data.content;
        this.totalElements = data.totalElements;
        this.totalPages = data.totalPages;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load business units';
        this.loading = false;
      }
    });
  }

  onSearchChange(query: string): void {
    this.searchQuery = query;
    this.searchSubject.next(query);
  }

  performSearch(query: string): void {
    if (!query || query.trim() === '') {
      this.page = 0;
      this.loadBusinessUnits();
      return;
    }

    this.loading = true;
    this.businessUnitService.searchBusinessUnits(query, this.page, this.size).subscribe({
      next: (data: Page<BusinessUnit>) => {
        this.businessUnits = data.content;
        this.totalElements = data.totalElements;
        this.totalPages = data.totalPages;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Search failed';
        this.loading = false;
      }
    });
  }

  createNew(): void {
    this.router.navigate(['/business-units/new']);
  }

  viewDetails(id: string): void {
    this.router.navigate(['/business-units', id]);
  }

  edit(id: string): void {
    this.router.navigate(['/business-units', id, 'edit']);
  }

  delete(id: string): void {
    if (confirm('Are you sure you want to delete this business unit?')) {
      this.businessUnitService.deleteBusinessUnit(id).subscribe({
        next: () => {
          this.loadBusinessUnits();
        },
        error: (err) => {
          this.error = 'Failed to delete business unit';
        }
      });
    }
  }

  nextPage(): void {
    if (this.page < this.totalPages - 1) {
      this.page++;
      if (this.searchQuery) {
        this.performSearch(this.searchQuery);
      } else {
        this.loadBusinessUnits();
      }
    }
  }

  previousPage(): void {
    if (this.page > 0) {
      this.page--;
      if (this.searchQuery) {
        this.performSearch(this.searchQuery);
      } else {
        this.loadBusinessUnits();
      }
    }
  }
}
