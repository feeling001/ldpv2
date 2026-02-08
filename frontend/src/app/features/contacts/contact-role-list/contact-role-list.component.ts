import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContactService } from '../contact.service';
import { ContactRole } from '../../../shared/models/contact.model';

@Component({
  selector: 'app-contact-role-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contact-role-list.component.html',
  styleUrls: ['./contact-role-list.component.scss']
})
export class ContactRoleListComponent implements OnInit {
  roles: ContactRole[] = [];
  loading = false;
  error = '';

  constructor(private contactService: ContactService) {}

  ngOnInit(): void {
    this.loadRoles();
  }

  loadRoles(): void {
    this.loading = true;
    this.contactService.getContactRoles().subscribe({
      next: (roles) => {
        this.roles = roles;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load contact roles';
        this.loading = false;
      }
    });
  }
}
