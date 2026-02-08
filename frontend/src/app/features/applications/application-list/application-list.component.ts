import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-application-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container">
      <h1>Applications</h1>
      <p class="info-message">
        ℹ️ Application management will be implemented in Story 2.
      </p>
      <p>Coming soon: Create and manage applications, track lifecycle status, and link to business units.</p>
    </div>
  `,
  styles: [`
    .container { max-width: 1200px; margin: 2rem auto; padding: 2rem; }
    .info-message { background: #e3f2fd; padding: 1rem; border-radius: 4px; border-left: 4px solid #2196f3; }
  `]
})
export class ApplicationListComponent {}
