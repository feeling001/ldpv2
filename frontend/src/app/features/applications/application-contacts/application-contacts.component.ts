import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApplicationService } from '../application.service';
import { ContactService } from '../../contacts/contact.service';
import { ApplicationContactResponse } from '../../../shared/models/application.model';
import { ContactRole } from '../../../shared/models/contact.model';

@Component({
  selector: 'app-application-contacts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './application-contacts.component.html',
  styleUrls: ['./application-contacts.component.scss']
})
export class ApplicationContactsComponent implements OnInit {
  @Input() applicationId!: string;
  @Input() applicationName!: string;

  contacts: ApplicationContactResponse[] = [];
  availableRoles: ContactRole[] = [];
  loading = false;
  error = '';
  
  showAddDialog = false;
  selectedContactRole = '';
  availableContacts: any[] = [];

  constructor(
    private applicationService: ApplicationService,
    private contactService: ContactService
  ) {}

  ngOnInit(): void {
    if (this.applicationId) {
      this.loadContacts();
      this.loadContactRoles();
    }
  }

  loadContacts(): void {
    this.loading = true;
    this.applicationService.getApplicationContacts(this.applicationId).subscribe({
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

  loadContactRoles(): void {
    this.contactService.getContactRoles().subscribe({
      next: (roles) => {
        this.availableRoles = roles;
      },
      error: (err) => {
        console.error('Failed to load contact roles', err);
      }
    });
  }

  openAddDialog(): void {
    this.showAddDialog = true;
    this.loadAllContacts();
  }

  closeAddDialog(): void {
    this.showAddDialog = false;
    this.selectedContactRole = '';
  }

  loadAllContacts(): void {
    this.contactService.getContacts().subscribe({
      next: (contacts) => {
        this.availableContacts = contacts.filter(c => 
          !this.contacts.some(ac => ac.contact.id === c.id)
        );
      },
      error: (err) => {
        console.error('Failed to load contacts', err);
      }
    });
  }

  addContact(contactId: string): void {
    this.applicationService.addContactToApplication(this.applicationId, contactId).subscribe({
      next: () => {
        this.loadContacts();
        this.closeAddDialog();
      },
      error: (err) => {
        this.error = 'Failed to add contact';
      }
    });
  }

  removeContact(contactId: string): void {
    if (confirm('Remove this contact from the application?')) {
      this.applicationService.removeContactFromApplication(this.applicationId, contactId).subscribe({
        next: () => {
          this.loadContacts();
        },
        error: (err) => {
          this.error = 'Failed to remove contact';
        }
      });
    }
  }

  getPrimaryPerson(contact: any): string {
    const primary = contact.persons.find((p: any) => p.isPrimary);
    if (primary) {
      return `${primary.person.firstName} ${primary.person.lastName}`;
    }
    return 'No primary contact';
  }

  getFilteredContacts(): any[] {
    if (!this.selectedContactRole) {
      return this.availableContacts;
    }
    return this.availableContacts.filter(c => 
      c.contactRole.id === this.selectedContactRole
    );
  }
}
