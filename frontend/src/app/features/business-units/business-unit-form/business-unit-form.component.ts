import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { BusinessUnitService } from '../business-unit.service';

@Component({
  selector: 'app-business-unit-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './business-unit-form.component.html',
  styleUrls: ['./business-unit-form.component.scss']
})
export class BusinessUnitFormComponent implements OnInit {
  form: FormGroup;
  loading = false;
  error = '';
  isEditMode = false;
  businessUnitId?: string;

  constructor(
    private fb: FormBuilder,
    private businessUnitService: BusinessUnitService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(255)]],
      description: ['']
    });
  }

  ngOnInit(): void {
    this.businessUnitId = this.route.snapshot.paramMap.get('id') || undefined;
    this.isEditMode = !!this.businessUnitId;

    if (this.isEditMode && this.businessUnitId) {
      this.loadBusinessUnit(this.businessUnitId);
    }
  }

  loadBusinessUnit(id: string): void {
    this.loading = true;
    this.businessUnitService.getBusinessUnit(id).subscribe({
      next: (bu) => {
        this.form.patchValue(bu);
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load business unit';
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.loading = true;
      this.error = '';

      const request$ = this.isEditMode && this.businessUnitId
        ? this.businessUnitService.updateBusinessUnit(this.businessUnitId, this.form.value)
        : this.businessUnitService.createBusinessUnit(this.form.value);

      request$.subscribe({
        next: () => {
          this.router.navigate(['/business-units']);
        },
        error: (err) => {
          this.error = err.error?.message || 'Failed to save business unit';
          this.loading = false;
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/business-units']);
  }
}
