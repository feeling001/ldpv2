import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { BusinessUnitService } from '../business-unit.service';
import { BusinessUnit } from '../../../shared/models/business-unit.model';

@Component({
  selector: 'app-business-unit-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './business-unit-detail.component.html',
  styleUrls: ['./business-unit-detail.component.scss']
})
export class BusinessUnitDetailComponent implements OnInit {
  businessUnit?: BusinessUnit;
  loading = false;
  error = '';

  constructor(
    private businessUnitService: BusinessUnitService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadBusinessUnit(id);
    }
  }

  loadBusinessUnit(id: string): void {
    this.loading = true;
    this.businessUnitService.getBusinessUnit(id).subscribe({
      next: (bu) => {
        this.businessUnit = bu;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load business unit';
        this.loading = false;
      }
    });
  }

  edit(): void {
    if (this.businessUnit) {
      this.router.navigate(['/business-units', this.businessUnit.id, 'edit']);
    }
  }

  delete(): void {
    if (this.businessUnit && confirm('Are you sure you want to delete this business unit?')) {
      this.businessUnitService.deleteBusinessUnit(this.businessUnit.id).subscribe({
        next: () => {
          this.router.navigate(['/business-units']);
        },
        error: (err) => {
          this.error = 'Failed to delete business unit';
        }
      });
    }
  }

  back(): void {
    this.router.navigate(['/business-units']);
  }
}
