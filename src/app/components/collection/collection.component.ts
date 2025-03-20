import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators, ReactiveFormsModule } from '@angular/forms';
import { ApartmentService } from '../../services/building/apartment-service';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatRadioModule } from '@angular/material/radio';
import { CommonModule } from '@angular/common';
import { CollectionType, CreateCollectionDemandDto } from '../../models/create-collection-demand';
import { CollectionService } from '../../services/collection/collection.service';
import { NgxChartsModule } from '@swimlane/ngx-charts';

@Component({
  selector: 'app-collection',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCheckboxModule,
    MatDividerModule,
    MatRadioModule,
    NgxChartsModule
  ],
  templateUrl: './collection.component.html',
  styleUrls: ['./collection.component.css']
})
export class CollectionComponent implements OnInit {
  demandForm: FormGroup;
  apartments: string[] = [];
  allSelected = true;
  collectionTypes = CollectionType;
  collectionTypeOptions = [
    { value: CollectionType.MonthlyMaintenance, label: 'Monthly Maintenance' },
    { value: CollectionType.AdhocExpense, label: 'Adhoc Expense' }
  ];

  // Chart data
  chartData = [
    {
      "name": "Jan",
      "series": [
        {
          "name": "Demand",
          "value": 95000
        },
        {
          "name": "Collection",
          "value": 85000
        }
      ]
    },
    {
      "name": "February",
      "series": [
        {
          "name": "Demand",
          "value": 95000
        },
        {
          "name": "Collection",
          "value": 85000
        }
      ]
    },
    {
      "name": "March",
      "series": [
        {
          "name": "Demand",
          "value": 95000
        },
        {
          "name": "Collection",
          "value": 85000
        }
      ]
    },
    {
      "name": "April",
      "series": [
        {
          "name": "Demand",
          "value": 130000
        },
        {
          "name": "Collection",
          "value": 125000
        }
      ]
    },
    {
      "name": "May",
      "series": [
        {
          "name": "Demand",
          "value": 140000
        },
        {
          "name": "Collection",
          "value": 135000
        }
      ]
    },
    {
      "name": "June",
      "series": [
        {
          "name": "Demand",
          "value": 140000
        },
        {
          "name": "Collection",
          "value": 135000
        }
      ]
    },
    {
      "name": "July",
      "series": [
        {
          "name": "Demand",
          "value": 140000
        },
        {
          "name": "Collection",
          "value": 135000
        }
      ]
    },
    {
      "name": "August",
      "series": [
        {
          "name": "Demand",
          "value": 140000
        },
        {
          "name": "Collection",
          "value": 135000
        }
      ]
    },
    {
      "name": "September",
      "series": [
        {
          "name": "Demand",
          "value": 140000
        },
        {
          "name": "Collection",
          "value": 135000
        }
      ]
    },
    {
      "name": "October",
      "series": [
        {
          "name": "Demand",
          "value": 140000
        },
        {
          "name": "Collection",
          "value": 135000
        }
      ]
    },
    {
      "name": "November",
      "series": [
        {
          "name": "Demand",
          "value": 140000
        },
        {
          "name": "Collection",
          "value": 135000
        }
      ]
    },
    {
      "name": "December",
      "series": [
        {
          "name": "Demand",
          "value": 140000
        },
        {
          "name": "Collection",
          "value": 135000
        }
      ]
    }
  ];

  // Chart options
  view: [number, number] = [700, 400];
  showXAxis = true;
  showYAxis = true;
  gradient = false;
  showLegend = true;
  showXAxisLabel = true;
  xAxisLabel = 'Month';
  showYAxisLabel = true;
  yAxisLabel = 'Amount (₹)';
  colorScheme = 'vivid';
  barPadding = 2;
  groupPadding = 16;

  constructor(private fb: FormBuilder, private collectionService: CollectionService) {
    this.demandForm = this.fb.group({
      apartmentName: [[], [Validators.required]], // Array for multiple selection
      amount: ['', [Validators.required, Validators.min(0)]],
      requestForDate: ['', [Validators.required]],
      dueDate: ['', [Validators.required]],
      paidDate: [null], // Default null value remains
      isPaid: [false], // Hidden field with default value false
      forWhat: ['', [Validators.required]],
      comment: ['', (control: AbstractControl) => {
        const collectionType = control.parent?.get('forWhat')?.value;
        return collectionType === CollectionType.AdhocExpense && !control.value?.trim()
          ? { required: true }
          : null;
      }]
    });

    this.demandForm.get('forWhat')?.valueChanges.subscribe(() => {
      this.demandForm.get('comment')?.updateValueAndValidity();
    });

    this.demandForm.get('apartmentName')?.valueChanges.subscribe((selectedApartments: string[]) => {
      this.allSelected = selectedApartments.length === this.apartments.length;
    });
  }

  ngOnInit(): void {
    this.collectionService.getApartmentNumbers().subscribe(x => {
      this.apartments = x;
      this.demandForm.patchValue({
        apartmentName: [...this.apartments]
      });
    });
  }

  toggleAllSelection() {
    if (this.allSelected) {
      this.demandForm.patchValue({
        apartmentName: []
      });
    } else {
      this.demandForm.patchValue({
        apartmentName: [...this.apartments]
      });
    }
  }

  onSubmit() {
    if (this.demandForm.valid) {
      const formValue = this.demandForm.value;
      const demand: CreateCollectionDemandDto = {
        ...formValue,
        requestForDate: new Date(formValue.requestForDate),
        dueDate: new Date(formValue.dueDate),
        paidDate: null,
        isPaid: false
      };
      console.log(demand);
      // Handle form submission
    }
  }

  get totalDemand(): number {
    return this.chartData.reduce((total, month) => {
      const demandValue = month.series.find(s => s.name === 'Demand')?.value || 0;
      return total + demandValue;
    }, 0);
  }

  get totalCollection(): number {
    return this.chartData.reduce((total, month) => {
      const collectionValue = month.series.find(s => s.name === 'Collection')?.value || 0;
      return total + collectionValue;
    }, 0);
  }

  get collectionPercentage(): number {
    return this.totalDemand ? (this.totalCollection / this.totalDemand) * 100 : 0;
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }
}
