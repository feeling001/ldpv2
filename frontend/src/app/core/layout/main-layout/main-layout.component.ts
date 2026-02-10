import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { User } from '../../../shared/models/user.model';
import { filter } from 'rxjs/operators';

interface NavItem {
  title: string;
  icon: string;
  route: string;
  color: string;
}

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent implements OnInit {
  currentUser: User | null = null;
  activeRoute: string = '';
  
  navItems: NavItem[] = [
    {
      title: 'Dashboard',
      icon: '📊',
      route: '/dashboard',
      color: '#2196f3'
    },
    {
      title: 'Business Units',
      icon: '🏢',
      route: '/business-units',
      color: '#3f51b5'
    },
    {
      title: 'Applications',
      icon: '📱',
      route: '/applications',
      color: '#009688'
    },
    {
      title: 'Environments',
      icon: '🌍',
      route: '/environments',
      color: '#ff9800'
    },
    {
      title: 'Dependencies',
      icon: '🔗',
      route: '/dependencies',
      color: '#00bcd4'
    },
    {
      title: 'Persons',
      icon: '👤',
      route: '/persons',
      color: '#e91e63'
    },
    {
      title: 'Contacts',
      icon: '👥',
      route: '/contacts',
      color: '#9c27b0'
    },
    {
      title: 'Contact Roles',
      icon: '🎭',
      route: '/contact-roles',
      color: '#607d8b'
    }
  ];

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.activeRoute = this.router.url;
    
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.activeRoute = event.url;
    });
  }

  isActive(route: string): boolean {
    if (route === '/dashboard') {
      return this.activeRoute === '/dashboard';
    }
    return this.activeRoute.startsWith(route);
  }

  navigate(route: string): void {
    this.router.navigate([route]);
  }

  logout(): void {
    this.authService.logout();
  }
}