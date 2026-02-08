import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { PersonService } from '../person.service';
import { Person } from '../../../shared/models/contact.model';
import { Page } from '../../../shared/models/environment.model';

@Component({
  selector: 'app-person-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './person-list.component.html',
  styleUrls: ['./person-list.component.scss']
})
export class PersonListComponent implements OnInit {
  persons: Person[] = [];
  loading = false;
  error = '';
  
  page = 0;
  size = 20;
  totalElements = 0;
  totalPages = 0;

  searchQuery = '';
  private searchSubject = new Subject<string>();

  constructor(
    private personService: PersonService,
    private router: Router
  ) {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(query => {
      this.page = 0;
      this.loadPersons();
    });
  }

  ngOnInit(): void {
    this.loadPersons();
  }

  loadPersons(): void {
    this.loading = true;
    const name = this.searchQuery.trim() || undefined;
    
    this.personService.getPersons(name, this.page, this.size).subscribe({
      next: (data: Page<Person>) => {
        this.persons = data.content;
        this.totalElements = data.totalElements;
        this.totalPages = data.totalPages;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load persons';
        this.loading = false;
      }
    });
  }

  onSearchChange(query: string): void {
    this.searchQuery = query;
    this.searchSubject.next(query);
  }

  createNew(): void {
    this.router.navigate(['/persons/new']);
  }

  viewDetails(id: string): void {
    this.router.navigate(['/persons', id]);
  }

  edit(id: string): void {
    this.router.navigate(['/persons', id, 'edit']);
  }

  delete(id: string): void {
    if (confirm('Are you sure you want to delete this person? This will remove them from all contacts.')) {
      this.personService.deletePerson(id).subscribe({
        next: () => {
          this.loadPersons();
        },
        error: (err) => {
          this.error = 'Failed to delete person';
        }
      });
    }
  }

  nextPage(): void {
    if (this.page < this.totalPages - 1) {
      this.page++;
      this.loadPersons();
    }
  }

  previousPage(): void {
    if (this.page > 0) {
      this.page--;
      this.loadPersons();
    }
  }
}
