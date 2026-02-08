import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { PersonService } from '../person.service';
import { Person } from '../../../shared/models/contact.model';

@Component({
  selector: 'app-person-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './person-detail.component.html',
  styleUrls: ['./person-detail.component.scss']
})
export class PersonDetailComponent implements OnInit {
  person?: Person;
  loading = false;
  error = '';

  constructor(
    private personService: PersonService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadPerson(id);
    }
  }

  loadPerson(id: string): void {
    this.loading = true;
    this.personService.getPerson(id).subscribe({
      next: (person) => {
        this.person = person;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load person';
        this.loading = false;
      }
    });
  }

  edit(): void {
    if (this.person) {
      this.router.navigate(['/persons', this.person.id, 'edit']);
    }
  }

  delete(): void {
    if (this.person && confirm('Are you sure you want to delete this person?')) {
      this.personService.deletePerson(this.person.id).subscribe({
        next: () => {
          this.router.navigate(['/persons']);
        },
        error: (err) => {
          this.error = 'Failed to delete person';
        }
      });
    }
  }

  back(): void {
    this.router.navigate(['/persons']);
  }
}
