import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators, ReactiveFormsModule, FormArray, FormControl } from '@angular/forms';
import { ApartmentService } from '../../services/building/apartment-service';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatRadioModule } from '@angular/material/radio';
import { MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { CollectionType, CreateCollectionDemandDto } from '../../models/create-collection-demand';
import { CollectionService } from '../../services/collection/collection.service';
import { CollectionChartComponent, ChartDataPoint } from '../../shared/components/collection-chart/collection-chart.component';
import { UnpaidFeeDto } from '../../models/unpaid-fee.dto';

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
    CollectionChartComponent,
    MatTableModule // Required for Angular Material table
  ],
  templateUrl: './collection.component.html',
  styleUrls: ['./collection.component.css']
})
export class CollectionComponent implements OnInit {
  demandForm: FormGroup;
  apartments: string[] = [];
  allSelected = true;
  collectionTypes = CollectionType;
  unpaidFees: UnpaidFeeDto[] = [];
  displayedColumns: string[] = ['apartmentNumber', 'amount', 'requestForDate', 'dueDate', 'forWhat', 'comment', 'receivedDate', 'actions'];
  paymentForms: FormArray<FormGroup<{ receivedDate: FormControl<string | null> }>>;
  collectionTypeOptions = [
    { value: CollectionType.MonthlyMaintenance, label: 'Monthly Maintenance' },
    { value: CollectionType.AdhocExpense, label: 'Adhoc Expense' }
  ];

  // Chart data
  chartData = [
    {
      "name": "January",
      "series": [
        { "name": "Demand", "value": 100000 },
        { "name": "Collection", "value": 90000 }
      ]
    },
    {
      "name": "February",
      "series": [
        { "name": "Demand", "value": 120000 },
        { "name": "Collection", "value": 110000 }
      ]
    },
    {
      "name": "March",
      "series": [
        { "name": "Demand", "value": 95000 },
        { "name": "Collection", "value": 85000 }
      ]
    },
    {
      "name": "April",
      "series": [
        { "name": "Demand", "value": 130000 },
        { "name": "Collection", "value": 125000 }
      ]
    },
    {
      "name": "May",
      "series": [
        { "name": "Demand", "value": 140000 },
        { "name": "Collection", "value": 135000 }
      ]
    }
  ];

  constructor(private fb: FormBuilder, private collectionService: CollectionService) {
    this.paymentForms = this.fb.array<FormGroup<{ receivedDate: FormControl<string | null> }>>([]);
    this.demandForm = this.fb.group({
      apartmentName: [[], [Validators.required]],
      amount: ['', [Validators.required, Validators.min(0)]],
      requestForDate: ['', [Validators.required]],
      dueDate: ['', [Validators.required]],
      paidDate: [null],
      isPaid: [false],
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
    this.fetchUnpaidFees();
    this.collectionService.getApartmentNumbers().subscribe(x => {
      this.apartments = x;
      this.demandForm.patchValue({
        apartmentName: [...this.apartments]
      });
    });
  }

  fetchUnpaidFees() {
    this.collectionService.getUnpaidFees().subscribe({
      next: (fees) => {
        this.unpaidFees = fees;
        this.paymentForms.clear();
        fees.forEach(() => this.paymentForms.push(this.fb.group({
          receivedDate: new FormControl<string>('', Validators.required)
        })));
      },
      error: (err) => console.error('Failed to load unpaid fees:', err)
    });
  }

  markAsPaid(index: number) {
    const receivedDate = this.paymentForms.at(index).value.receivedDate;
    console.log('Marking payment as received on:', receivedDate);
    // TODO: Implement API call
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
}
