import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
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
import { ChartDataItem } from '../../models/collection-expense';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

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
    MatNativeDateModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './collection.component.html',
  styleUrls: ['./collection.component.css']
})
export class CollectionComponent implements OnInit, AfterViewInit {
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
  chartData: ChartDataItem[] = [];
  isLoading = true;
  totalDemand = 0;
  totalCollection = 0;
  collectionRate = 0;

  constructor(
    private fb: FormBuilder,
    private collectionService: CollectionService,
    private apartmentService: ApartmentService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
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
    Promise.all([
      this.fetchUnpaidFees(),
      this.fetchApartments(),
      this.fetchChartData()
    ]).finally(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
    });
  }

  ngAfterViewInit() {
    // Force a layout recalculation after view initialization
    setTimeout(() => {
      this.cdr.detectChanges();
    }, 0);
  }

  private fetchApartments(): Promise<void> {
    return new Promise((resolve) => {
      this.collectionService.getApartmentNumbers().subscribe({
        next: (apartments) => {
          this.apartments = apartments;
          this.demandForm.patchValue({
            apartmentName: [...this.apartments]
          });
          resolve();
        },
        error: (err) => {
          console.error('Failed to load apartments:', err);
          resolve();
        }
      });
    });
  }

  private fetchChartData(): Promise<void> {
    return new Promise((resolve) => {
      this.collectionService.getCollectionExpenses(new Date().getFullYear()).subscribe({
        next: (data) => {
          this.chartData = data;
          this.calculateStatistics(data);
          resolve();
        },
        error: (err) => {
          console.error('Failed to load chart data:', err);
          resolve();
        }
      });
    });
  }

  private calculateStatistics(data: ChartDataItem[]): void {
    this.totalDemand = data.reduce((sum, item) => {
      const demand = item.series.find(s => s.name === 'Total Demand');
      return sum + (demand?.value || 0);
    }, 0);

    this.totalCollection = data.reduce((sum, item) => {
      const collection = item.series.find(s => s.name === 'Total Collection');
      return sum + (collection?.value || 0);
    }, 0);

    this.collectionRate = this.totalDemand > 0
      ? (this.totalCollection / this.totalDemand) * 100
      : 0;
  }

  private fetchUnpaidFees(): Promise<void> {
    return new Promise((resolve) => {
      this.collectionService.getUnpaidFees().subscribe({
        next: (fees) => {
          this.unpaidFees = fees;
          this.paymentForms.clear();
          fees.forEach((fee) => this.paymentForms.push(this.fb.group({
            receivedDate: ['', Validators.required],
            paymentAmount: [fee.remainingAmount, [Validators.required, Validators.min(0), Validators.max(fee.remainingAmount)]],
            paymentMethod: ['', [Validators.required]]
          })));
          resolve();
        },
        error: (err) => {
          console.error('Failed to load unpaid fees:', err);
          resolve();
        }
      });
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
      this.demandForm.get('apartmentName')?.setValue([]);
    } else {
      this.demandForm.get('apartmentName')?.setValue([...this.apartments]);
    }
    this.allSelected = !this.allSelected;
  }

  onSubmit(): void {
    if (this.demandForm.valid) {
      const formValue = this.demandForm.value;

      const demand: CreateCollectionDemandDto = {
        apartmentName: formValue.apartmentName,
        amount: formValue.amount,
        requestForDate: formValue.requestForDate,
        dueDate: formValue.dueDate,
        forWhat: formValue.forWhat,
        comment: formValue.comment
      };

      this.collectionService.createDemand(demand).subscribe({
        next: (response) => {
          this.snackBar.open('Demand created successfully', 'Close', { duration: 3000 });
          this.demandForm.reset();
          // Reset apartment selection to all apartments
          this.demandForm.patchValue({
            apartmentName: [...this.apartments]
          });
          // Refresh the unpaid fees list
          this.fetchUnpaidFees();
        },
        error: (error) => {
          this.snackBar.open('Failed to create demand', 'Close', { duration: 6000 });
          console.error('Create demand error:', error);
        }
      });
    } else {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.demandForm.controls).forEach(key => {
        const control = this.demandForm.get(key);
        control?.markAsTouched();
      });
    }
  }
}
