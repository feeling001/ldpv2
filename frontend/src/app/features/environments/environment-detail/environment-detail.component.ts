import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { EnvironmentService } from '../environment.service';
import { Environment } from '../../../shared/models/environment.model';

@Component({
  selector: 'app-environment-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './environment-detail.component.html',
  styleUrls: ['./environment-detail.component.scss']
})
export class EnvironmentDetailComponent implements OnInit {
  environment?: Environment;
  loading = false;
  error = '';

  constructor(
    private environmentService: EnvironmentService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadEnvironment(id);
    }
  }

  loadEnvironment(id: string): void {
    this.loading = true;
    this.environmentService.getEnvironment(id).subscribe({
      next: (env) => {
        this.environment = env;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load environment';
        this.loading = false;
      }
    });
  }

  edit(): void {
    if (this.environment) {
      this.router.navigate(['/environments', this.environment.id, 'edit']);
    }
  }

  delete(): void {
    if (this.environment && confirm('Are you sure you want to delete this environment?')) {
      this.environmentService.deleteEnvironment(this.environment.id).subscribe({
        next: () => {
          this.router.navigate(['/environments']);
        },
        error: (err) => {
          this.error = 'Failed to delete environment';
        }
      });
    }
  }

  back(): void {
    this.router.navigate(['/environments']);
  }
}
