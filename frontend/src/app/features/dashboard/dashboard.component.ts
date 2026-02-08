import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { User } from '../../shared/models/user.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;

  features = [
    {
      title: 'Business Units',
      description: 'Manage organizational business units',
      icon: '🏢',
      route: '/business-units',
      color: '#3f51b5'
    },
    {
      title: 'Applications',
      description: 'Manage applications and their lifecycle',
      icon: '📱',
      route: '/applications',
      color: '#009688'
    },
    {
      title: 'Environments',
      description: 'Manage deployment environments',
      icon: '🌍',
      route: '/environments',
      color: '#ff9800'
    },
    {
      title: 'Persons',
      description: 'Manage individual contacts',
      icon: '👤',
      route: '/persons',
      color: '#e91e63'
    },
    {
      title: 'Contacts',
      description: 'Manage functional contacts and roles',
      icon: '👥',
      route: '/contacts',
      color: '#9c27b0'
    },
    {
      title: 'Contact Roles',
      description: 'View predefined contact roles',
      icon: '🎭',
      route: '/contact-roles',
      color: '#607d8b'
    }
  ];

  stats = [
    { label: 'Business Units', value: '4', icon: '🏢' },
    { label: 'Applications', value: '7', icon: '📱' },
    { label: 'Environments', value: '4', icon: '🌍' },
    { label: 'Persons', value: '4', icon: '👤' }
  ];

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
  }

  navigate(route: string): void {
    this.router.navigate([route]);
  }

  logout(): void {
    this.authService.logout();
  }
}
