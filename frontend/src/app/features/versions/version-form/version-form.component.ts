import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { VersionService } from '../version.service';

@Component({
  selector: 'app-version-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './version-form.component.html',
  styleUrls: ['./version-form.component.scss']
})
export class VersionFormComponent implements OnInit {
  form: FormGroup;
  loading = false;
  error = '';
  isEditMode = false;
  applicationId!: string;
  versionId?: string;

  constructor(
    private fb: FormBuilder,
    private versionService: VersionService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.form = this.fb.group({
      versionIdentifier: ['', [Validators.required, Validators.maxLength(100)]],
      externalReference: ['', [Validators.maxLength(500)]],
      releaseDate: ['', [Validators.required]],
      endOfLifeDate: ['']
    });
  }

  ngOnInit(): void {
    this.applicationId = this.route.snapshot.paramMap.get('applicationId')!;
    this.versionId = this.route.snapshot.paramMap.get('versionId') || undefined;
    this.isEditMode = !!this.versionId;

    if (this.isEditMode && this.versionId) {
      this.loadVersion();
    } else {
      // Default release date to today
      const today = new Date().toISOString().split('T')[0];
      this.form.patchValue({ releaseDate: today });
    }
  }

  loadVersion(): void {
    if (!this.versionId) return;
    
    this.loading = true;
    this.versionService.getVersion(this.applicationId, this.versionId).subscribe({
      next: (version) => {
        this.form.patchValue({
          versionIdentifier: version.versionIdentifier,
          externalReference: version.externalReference,
          releaseDate: this.formatDateForInput(version.releaseDate),
          endOfLifeDate: version.endOfLifeDate ? this.formatDateForInput(version.endOfLifeDate) : ''
        });
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load version';
        this.loading = false;
      }
    });
  }

  formatDateForInput(date: Date): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  onSubmit(): void {
    if (this.form.valid) {
      const releaseDate = new Date(this.form.value.releaseDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (releaseDate > today) {
        this.error = 'Release date cannot be in the future';
        return;
      }

      if (this.form.value.endOfLifeDate) {
        const eolDate = new Date(this.form.value.endOfLifeDate);
        if (eolDate <= releaseDate) {
          this.error = 'End of life date must be after release date';
          return;
        }
      }

      this.loading = true;
      this.error = '';

      const formData = { ...this.form.value };
      if (!formData.endOfLifeDate) {
        formData.endOfLifeDate = null;
      }
      if (!formData.externalReference) {
        formData.externalReference = null;
      }

      const request$ = this.isEditMode && this.versionId
        ? this.versionService.updateVersion(this.applicationId, this.versionId, formData)
        : this.versionService.createVersion(this.applicationId, formData);

      request$.subscribe({
        next: () => {
          this.router.navigate(['/applications', this.applicationId]);
        },
        error: (err) => {
          this.error = err.error?.message || 'Failed to save version';
          this.loading = false;
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/applications', this.applicationId]);
  }
}
