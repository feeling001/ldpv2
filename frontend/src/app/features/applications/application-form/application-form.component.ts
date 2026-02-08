import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ApplicationService } from '../application.service';
import { BusinessUnitService } from '../../business-units/business-unit.service';
import { ApplicationStatus } from '../../../shared/models/application.model';
import { BusinessUnit } from '../../../shared/models/business-unit.model';
import { Page } from '../../../shared/models/environment.model';

@Component({
  selector: 'app-application-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './application-form.component.html',
  styleUrls: ['./application-form.component.scss']
})
export class ApplicationFormComponent implements OnInit {
  form: FormGroup;
  loading = false;
  error = '';
  isEditMode = false;
  applicationId?: string;
  
  businessUnits: BusinessUnit[] = [];
  statusOptions = Object.values(ApplicationStatus);

  constructor(
    private fb: FormBuilder,
    private applicationService: ApplicationService,
    private businessUnitService: BusinessUnitService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(255)]],
      description: [''],
      status: [ApplicationStatus.IDEA, [Validators.required]],
      businessUnitId: ['', [Validators.required]],
      endOfSupportDate: [''],
      endOfLifeDate: ['']
    });
  }

  ngOnInit(): void {
    this.applicationId = this.route.snapshot.paramMap.get('id') || undefined;
    this.isEditMode = !!this.applicationId;

    this.loadBusinessUnits();

    if (this.isEditMode && this.applicationId) {
      this.loadApplication(this.applicationId);
    }
  }

  loadBusinessUnits(): void {
    this.businessUnitService.getBusinessUnits(0, 100).subscribe({
      next: (data: Page<BusinessUnit>) => {
        this.businessUnits = data.content;
      },
      error: (err) => {
        this.error = 'Failed to load business units';
      }
    });
  }

  loadApplication(id: string): void {
    this.loading = true;
    this.applicationService.getApplication(id).subscribe({
      next: (app) => {
        this.form.patchValue({
          name: app.name,
          description: app.description,
          status: app.status,
          businessUnitId: app.businessUnit.id,
          endOfSupportDate: app.endOfSupportDate ? this.formatDateForInput(app.endOfSupportDate) : '',
          endOfLifeDate: app.endOfLifeDate ? this.formatDateForInput(app.endOfLifeDate) : ''
        });
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load application';
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
      const endOfSupport = this.form.value.endOfSupportDate;
      const endOfLife = this.form.value.endOfLifeDate;
      
      if (endOfSupport && endOfLife) {
        const supportDate = new Date(endOfSupport);
        const lifeDate = new Date(endOfLife);
        
        if (supportDate > lifeDate) {
          this.error = 'End of support date must be before end of life date';
          return;
        }
      }

      this.loading = true;
      this.error = '';

      const formData = { ...this.form.value };
      
      if (!formData.endOfSupportDate) {
        formData.endOfSupportDate = null;
      }
      if (!formData.endOfLifeDate) {
        formData.endOfLifeDate = null;
      }

      const request$ = this.isEditMode && this.applicationId
        ? this.applicationService.updateApplication(this.applicationId, formData)
        : this.applicationService.createApplication(formData);

      request$.subscribe({
        next: () => {
          this.router.navigate(['/applications']);
        },
        error: (err) => {
          this.error = err.error?.message || 'Failed to save application';
          this.loading = false;
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/applications']);
  }

  getStatusDisplay(status: ApplicationStatus): string {
    const displays: Record<ApplicationStatus, string> = {
      [ApplicationStatus.IDEA]: 'Idea',
      [ApplicationStatus.IN_DEVELOPMENT]: 'In Development',
      [ApplicationStatus.IN_SERVICE]: 'In Service',
      [ApplicationStatus.MAINTENANCE]: 'Maintenance',
      [ApplicationStatus.DECOMMISSIONED]: 'Decommissioned'
    };
    return displays[status] || status;
  }
}
