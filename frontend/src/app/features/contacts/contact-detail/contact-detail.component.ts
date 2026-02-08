import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { ContactService } from '../contact.service';
import { Contact } from '../../../shared/models/contact.model';

@Component({
  selector: 'app-contact-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contact-detail.component.html',
  styleUrls: ['./contact-detail.component.scss']
})
export class ContactDetailComponent implements OnInit {
  contact?: Contact;
  loading = false;
  error = '';

  constructor(
    private contactService: ContactService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadContact(id);
    }
  }

  loadContact(id: string): void {
    this.loading = true;
    this.contactService.getContact(id).subscribe({
      next: (contact) => {
        this.contact = contact;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load contact';
        this.loading = false;
      }
    });
  }

  setPrimary(personId: string): void {
    if (this.contact) {
      this.contactService.setPrimaryPerson(this.contact.id, personId).subscribe({
        next: (updated) => {
          this.contact = updated;
        },
        error: (err) => {
          this.error = 'Failed to set primary person';
        }
      });
    }
  }

  removePerson(personId: string): void {
    if (this.contact && confirm('Remove this person from the contact?')) {
      this.contactService.removePersonFromContact(this.contact.id, personId).subscribe({
        next: (updated) => {
          this.contact = updated;
        },
        error: (err) => {
          this.error = 'Failed to remove person';
        }
      });
    }
  }

  delete(): void {
    if (this.contact && confirm('Delete this contact?')) {
      this.contactService.deleteContact(this.contact.id).subscribe({
        next: () => {
          this.router.navigate(['/contacts']);
        },
        error: (err) => {
          this.error = 'Failed to delete contact';
        }
      });
    }
  }

  back(): void {
    this.router.navigate(['/contacts']);
  }
}
