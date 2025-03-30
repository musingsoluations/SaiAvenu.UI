import { Component, OnInit, AfterViewInit, ChangeDetectorRef, ViewChild, ElementRef, HostListener } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators, ReactiveFormsModule, FormArray, FormControl } from '@angular/forms';
import { ApartmentService } from '../../services/building/apartment-service';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconButton } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatRadioModule } from '@angular/material/radio';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
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
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-collection',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconButton,
    MatCheckboxModule,
    MatDividerModule,
    MatRadioModule,
    CollectionChartComponent,
    MatTableModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatIconModule
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

  selectedApartmentFilter: string = '';
  filteredUnpaidFees: UnpaidFeeDto[] = [];
  dataSource: MatTableDataSource<UnpaidFeeDto>;
  @ViewChild('filterInput') filterInput!: ElementRef;
  showFilter = false;
  // Map to track the original indices of fees after filtering
  filteredIndices: Map<number, number> = new Map();

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

    this.dataSource = new MatTableDataSource<UnpaidFeeDto>();

    // Configure the filter predicate for partial matches
    this.dataSource.filterPredicate = (data: UnpaidFeeDto, filter: string) => {
      return data.apartmentNumber.toLowerCase().includes(filter.toLowerCase());
    };
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
      this.collectionService.getCollectionPayment(new Date().getFullYear()).subscribe({
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

  filterUnpaidFees() {
    if (!this.selectedApartmentFilter) {
      this.filteredUnpaidFees = this.unpaidFees;
    } else {
      this.filteredUnpaidFees = this.unpaidFees.filter(
        fee => fee.apartmentNumber === this.selectedApartmentFilter
      );
    }
  }

  private fetchUnpaidFees(): Promise<void> {
    return new Promise((resolve) => {
      this.collectionService.getUnpaidFees().subscribe({
        next: (fees) => {
          this.unpaidFees = fees;
          this.dataSource.data = fees; // Update the data source
          this.paymentForms.clear();
          fees.forEach((fee) => this.paymentForms.push(this.fb.group({
            paymentAmount: [fee.remainingAmount, [Validators.required, Validators.min(0), Validators.max(fee.amount)]],
            paymentMethod: ['', [Validators.required]],
            receivedDate: ['', [Validators.required]]
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

  private formatDateForServer(date: Date): string {
    // Adjust for timezone to keep the date as selected by user
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  markAsPaid(index: number): void {
    const paymentForm = this.paymentForms.at(index);
    const fee = this.unpaidFees[index];

    console.log('Fee object:', fee);
    console.log('Fee Id:', fee.id);

    if (paymentForm.valid) {
      const payment = {
        amount: paymentForm.get('paymentAmount')?.value,
        paymentDate: this.formatDateForServer(paymentForm.get('receivedDate')?.value),
        feeCollectionId: fee.id,
        paymentMethod: paymentForm.get('paymentMethod')?.value
      };

      console.log('Payment object:', payment);

      this.collectionService.makePayment(payment).subscribe({
        next: () => {
          this.snackBar.open('Payment recorded successfully', 'Close', { duration: 3000 });
          this.fetchUnpaidFees(); // Refresh the list
          // Clear the filter after successful payment
          this.dataSource.filter = '';
          if (this.filterInput) {
            this.filterInput.nativeElement.value = '';
          }
          this.showFilter = false;
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
        requestForDate: this.formatDateForServer(formValue.requestForDate),
        dueDate: this.formatDateForServer(formValue.dueDate),
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

  toggleFilter(event: Event): void {
    event.stopPropagation();
    this.showFilter = !this.showFilter;
    if (this.showFilter) {
      setTimeout(() => {
        this.filterInput.nativeElement.focus();
      });
    } else {
      this.dataSource.filter = '';
      if (this.filterInput) {
        this.filterInput.nativeElement.value = '';
      }
      this.filteredIndices.clear(); // Clear the filtered indices map
    }
  }

  @HostListener('document:click', ['$event'])
  closeFilter(event: Event): void {
    if (this.showFilter && !this.filterInput.nativeElement.contains(event.target)) {
      this.showFilter = false;
      this.dataSource.filter = '';
      this.filterInput.nativeElement.value = '';
      this.filteredIndices.clear(); // Clear the filtered indices map
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    // Update the filteredIndices map to maintain the relationship between
    // the visible rows in the filtered table and their original indices
    this.filteredIndices.clear();
    if (this.dataSource.filteredData) {
      this.dataSource.filteredData.forEach((filteredItem, filteredIndex) => {
        // Find the original index of this item in the unpaidFees array
        const originalIndex = this.unpaidFees.findIndex(fee => fee.id === filteredItem.id);
        if (originalIndex !== -1) {
          this.filteredIndices.set(filteredIndex, originalIndex);
        }
      });
    }
  }

  dateFilter = (date: Date | null): boolean => {
    if (!date) return false;
    // Remove time part from the date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today;
  };
}
