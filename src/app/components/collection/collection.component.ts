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
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { PaymentMethod } from '../../models/payment';
import { MatSnackBar } from '@angular/material/snack-bar';

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
    MatTableModule,
    MatDatepickerModule,
    MatNativeDateModule
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
  displayedColumns: string[] = [
    'apartmentNumber',
    'amount',
    'remainingAmount',
    'requestForDate',
    'dueDate',
    'forWhat',
    'comment',
    'paymentAmount',
    'paymentMethod',
    'receivedDate',
    'actions'
  ];
  paymentForms: FormArray;
  collectionTypeOptions = [
    { value: CollectionType.MonthlyMaintenance, label: 'Monthly Maintenance' },
    { value: CollectionType.AdhocExpense, label: 'Adhoc Expense' }
  ];

  paymentMethods = [
    { value: PaymentMethod.Cash, label: 'Cash' },
    { value: PaymentMethod.Online, label: 'Online' }
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

  constructor(
    private fb: FormBuilder,
    private collectionService: CollectionService,
    private apartmentService: ApartmentService,
    private snackBar: MatSnackBar
  ) {
    this.paymentForms = this.fb.array([]);
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

  getCollectionTypeLabel(type: CollectionType): string {
    return this.collectionTypeOptions.find(option => option.value === type)?.label || 'Unknown';
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
        console.log('Received unpaid fees:', fees); // Debug log
        this.unpaidFees = fees;
        this.paymentForms.clear();
        fees.forEach((fee) => this.paymentForms.push(this.fb.group({
          receivedDate: ['', Validators.required],
          paymentAmount: [fee.amount, [Validators.required, Validators.min(0), Validators.max(fee.remainingAmount)]],
          paymentMethod: ['', [Validators.required]]
        })));
      },
      error: (err) => console.error('Failed to load unpaid fees:', err)
    });
  }

  markAsPaid(index: number): void {
    const paymentForm = this.paymentForms.at(index);
    const fee = this.unpaidFees[index];

    console.log('Fee object:', fee);
    console.log('Fee Id:', fee.id);

    if (paymentForm.valid) {
      const payment = {
        amount: paymentForm.get('paymentAmount')?.value,
        paymentDate: paymentForm.get('receivedDate')?.value,
        feeCollectionId: fee.id,
        paymentMethod: paymentForm.get('paymentMethod')?.value
      };

      console.log('Payment object:', payment);

      this.collectionService.makePayment(payment).subscribe({
        next: () => {
          this.snackBar.open('Payment recorded successfully', 'Close', { duration: 3000 });
          this.fetchUnpaidFees(); // Refresh the list
        },
        error: (error) => {
          this.snackBar.open('Failed to record payment', 'Close', { duration: 6000 });
          console.error('Payment error:', error);
        }
      });
    }
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
