import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
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

  stats = [
    { label: 'Business Units', value: '4', icon: '🏢', color: '#3f51b5' },
    { label: 'Applications', value: '7', icon: '📱', color: '#009688' },
    { label: 'Environments', value: '4', icon: '🌍', color: '#ff9800' },
    { label: 'Persons', value: '4', icon: '👤', color: '#e91e63' },
    { label: 'Contacts', value: '0', icon: '👥', color: '#9c27b0' },
    { label: 'Contact Roles', value: '8', icon: '🎭', color: '#607d8b' }
  ];

  recentActivity = [
    { action: 'Created', entity: 'Application', name: 'Mobile App', time: '2 hours ago' },
    { action: 'Updated', entity: 'Business Unit', name: 'Digital Services', time: '5 hours ago' },
    { action: 'Created', entity: 'Person', name: 'John Doe', time: '1 day ago' },
    { action: 'Updated', entity: 'Environment', name: 'PROD-EU', time: '2 days ago' }
  ];

  constructor(
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
  }
}
