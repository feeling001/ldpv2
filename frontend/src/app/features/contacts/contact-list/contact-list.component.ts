import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ContactService } from '../contact.service';
import { Contact } from '../../../shared/models/contact.model';

@Component({
  selector: 'app-contact-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contact-list.component.html',
  styleUrls: ['./contact-list.component.scss']
})
export class ContactListComponent implements OnInit {
  contacts: Contact[] = [];
  loading = false;
  error = '';

  constructor(
    private contactService: ContactService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadContacts();
  }

  loadContacts(): void {
    this.loading = true;
    this.contactService.getContacts().subscribe({
      next: (contacts) => {
        this.contacts = contacts;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load contacts';
        this.loading = false;
      }
    });
  }

  createNew(): void {
    this.router.navigate(['/contacts/new']);
  }

  viewDetails(id: string): void {
    this.router.navigate(['/contacts', id]);
  }

  delete(id: string): void {
    if (confirm('Are you sure you want to delete this contact?')) {
      this.contactService.deleteContact(id).subscribe({
        next: () => {
          this.loadContacts();
        },
        error: (err) => {
          this.error = 'Failed to delete contact';
        }
      });
    }
  }

  getPrimaryPerson(contact: Contact): string {
    const primary = contact.persons.find(p => p.isPrimary);
    if (primary) {
      return `${primary.person.firstName} ${primary.person.lastName}`;
    }
    return 'No primary contact';
  }

  getPersonCount(contact: Contact): number {
    return contact.persons.length;
  }
}
