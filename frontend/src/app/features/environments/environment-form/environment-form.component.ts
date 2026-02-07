import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { EnvironmentService } from '../environment.service';

@Component({
  selector: 'app-environment-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './environment-form.component.html',
  styleUrls: ['./environment-form.component.scss']
})
export class EnvironmentFormComponent implements OnInit {
  form: FormGroup;
  loading = false;
  error = '';
  isEditMode = false;
  environmentId?: string;

  constructor(
    private fb: FormBuilder,
    private environmentService: EnvironmentService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      description: [''],
      isProduction: [false],
      criticalityLevel: [null, [Validators.min(1), Validators.max(5)]]
    });
  }

  ngOnInit(): void {
    this.environmentId = this.route.snapshot.paramMap.get('id') || undefined;
    this.isEditMode = !!this.environmentId;

    if (this.isEditMode && this.environmentId) {
      this.loadEnvironment(this.environmentId);
    }
  }

  loadEnvironment(id: string): void {
    this.loading = true;
    this.environmentService.getEnvironment(id).subscribe({
      next: (env) => {
        this.form.patchValue(env);
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load environment';
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.loading = true;
      this.error = '';

      const request$ = this.isEditMode && this.environmentId
        ? this.environmentService.updateEnvironment(this.environmentId, this.form.value)
        : this.environmentService.createEnvironment(this.form.value);

      request$.subscribe({
        next: () => {
          this.router.navigate(['/environments']);
        },
        error: (err) => {
          this.error = err.error?.message || 'Failed to save environment';
          this.loading = false;
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/environments']);
  }
}
