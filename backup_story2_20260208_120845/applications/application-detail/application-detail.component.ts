import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-application-detail',
  standalone: true,
  imports: [CommonModule],
  template: `<div class="container"><h1>Application Detail</h1><p class="info-message">ℹ️ Coming in Story 2</p></div>`,
  styles: [`.container { max-width: 1200px; margin: 2rem auto; padding: 2rem; } .info-message { background: #e3f2fd; padding: 1rem; border-radius: 4px; }`]
})
export class ApplicationDetailComponent {}
