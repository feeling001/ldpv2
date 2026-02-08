import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ContactService } from '../contact.service';
import { PersonService } from '../../persons/person.service';
import { ContactRole, Person } from '../../../shared/models/contact.model';
import { Page } from '../../../shared/models/environment.model';

@Component({
  selector: 'app-contact-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contact-form.component.html',
  styleUrls: ['./contact-form.component.scss']
})
export class ContactFormComponent implements OnInit {
  form: FormGroup;
  loading = false;
  error = '';
  
  roles: ContactRole[] = [];
  persons: Person[] = [];
  selectedPersons: Set<string> = new Set();
  primaryPersonId: string = '';

  constructor(
    private fb: FormBuilder,
    private contactService: ContactService,
    private personService: PersonService,
    private router: Router
  ) {
    this.form = this.fb.group({
      contactRoleId: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.loadRoles();
    this.loadPersons();
  }

  loadRoles(): void {
    this.contactService.getContactRoles().subscribe({
      next: (roles) => {
        this.roles = roles;
      },
      error: (err) => {
        this.error = 'Failed to load contact roles';
      }
    });
  }

  loadPersons(): void {
    this.personService.getPersons(undefined, 0, 100).subscribe({
      next: (data: Page<Person>) => {
        this.persons = data.content;
      },
      error: (err) => {
        this.error = 'Failed to load persons';
      }
    });
  }

  togglePerson(personId: string): void {
    if (this.selectedPersons.has(personId)) {
      this.selectedPersons.delete(personId);
      if (this.primaryPersonId === personId) {
        this.primaryPersonId = '';
      }
    } else {
      this.selectedPersons.add(personId);
      if (this.selectedPersons.size === 1) {
        this.primaryPersonId = personId;
      }
    }
  }

  setPrimary(personId: string): void {
    if (this.selectedPersons.has(personId)) {
      this.primaryPersonId = personId;
    }
  }

  isSelected(personId: string): boolean {
    return this.selectedPersons.has(personId);
  }

  isPrimary(personId: string): boolean {
    return this.primaryPersonId === personId;
  }

  onSubmit(): void {
    if (this.form.valid && this.selectedPersons.size > 0 && this.primaryPersonId) {
      this.loading = true;
      this.error = '';

      const request = {
        contactRoleId: this.form.value.contactRoleId,
        personIds: Array.from(this.selectedPersons),
        primaryPersonId: this.primaryPersonId
      };

      this.contactService.createContact(request).subscribe({
        next: () => {
          this.router.navigate(['/contacts']);
        },
        error: (err) => {
          this.error = err.error?.message || 'Failed to create contact';
          this.loading = false;
        }
      });
    } else {
      if (this.selectedPersons.size === 0) {
        this.error = 'Please select at least one person';
      } else if (!this.primaryPersonId) {
        this.error = 'Please designate a primary person';
      }
    }
  }

  cancel(): void {
    this.router.navigate(['/contacts']);
  }
}
