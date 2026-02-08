import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { PersonService } from '../person.service';

@Component({
  selector: 'app-person-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './person-form.component.html',
  styleUrls: ['./person-form.component.scss']
})
export class PersonFormComponent implements OnInit {
  form: FormGroup;
  loading = false;
  error = '';
  isEditMode = false;
  personId?: string;

  constructor(
    private fb: FormBuilder,
    private personService: PersonService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.form = this.fb.group({
      firstName: ['', [Validators.required, Validators.maxLength(100)]],
      lastName: ['', [Validators.required, Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.maxLength(50)]]
    });
  }

  ngOnInit(): void {
    this.personId = this.route.snapshot.paramMap.get('id') || undefined;
    this.isEditMode = !!this.personId;

    if (this.isEditMode && this.personId) {
      this.loadPerson(this.personId);
    }
  }

  loadPerson(id: string): void {
    this.loading = true;
    this.personService.getPerson(id).subscribe({
      next: (person) => {
        this.form.patchValue(person);
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load person';
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.loading = true;
      this.error = '';

      const request$ = this.isEditMode && this.personId
        ? this.personService.updatePerson(this.personId, this.form.value)
        : this.personService.createPerson(this.form.value);

      request$.subscribe({
        next: () => {
          this.router.navigate(['/persons']);
        },
        error: (err) => {
          this.error = err.error?.message || 'Failed to save person';
          this.loading = false;
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/persons']);
  }
}
