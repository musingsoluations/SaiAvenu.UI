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
import { PaymentReminderRequestDto } from '../../models/payment-reminder';
import { animate, state, style, transition, trigger } from '@angular/animations';

// Define interface for display rows
interface DisplayRow {
  isGroupHeader: boolean;
  apartmentNumber: string; // Present for both header and detail
  fee?: UnpaidFeeDto;        // Present for detail rows
  originalIndex?: number;  // Present for detail rows (index in original unpaidFees/paymentForms)
  level: number;           // 0 for group, 1 for detail
  isExpanded?: boolean;    // Present for group headers
  feeCount?: number;       // Optional: Number of fees in the group
  totalAmount?: number;    // Optional: Total amount for the group
  totalRemaining?: number; // Optional: Total remaining for the group
}

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
  styleUrls: ['./collection.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0', visibility: 'hidden' })),
      state('expanded', style({ height: '*', visibility: 'visible' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class CollectionComponent implements OnInit, AfterViewInit {
  demandForm: FormGroup;
  apartments: string[] = [];
  allSelected = true;
  collectionTypes = CollectionType;
  unpaidFees: UnpaidFeeDto[] = [];
  originalUnpaidFees: UnpaidFeeDto[] = [];
  displayedColumnsGroup: string[] = ['expander', 'groupApartmentNumber', 'feeCount', 'groupAmount', 'groupRemainingAmount', 'groupActions'];
  displayedColumnsDetail: string[] = [
    'spacer',
    'amount',
    'remainingAmount',
    'requestForDate',
    'dueDate',
    'forWhat',
    'comment',
    'paymentAmount',
    'paymentMethod',
    'receivedDate',
    'actions',
    'sendReminder'
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

  dataSource = new MatTableDataSource<DisplayRow>();
  @ViewChild('filterInput') filterInput!: ElementRef;
  showFilter = false;
  reminderButtonDisabled: Map<string, boolean> = new Map();
  expansionState = new Map<string, boolean>();
  groupedFees = new Map<string, UnpaidFeeDto[]>();

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

  private fetchUnpaidFees(): Promise<void> {
    this.isLoading = true;
    return new Promise((resolve) => {
      this.collectionService.getUnpaidFees().subscribe({
        next: (fees) => {
          this.originalUnpaidFees = fees;
          this.paymentForms.clear();
          this.originalUnpaidFees.forEach((fee, index) => {
            this.paymentForms.push(this.fb.group({
              paymentAmount: [fee.remainingAmount, [Validators.required, Validators.min(0.01), Validators.max(fee.remainingAmount)]],
              paymentMethod: ['', [Validators.required]],
              receivedDate: ['', [Validators.required]]
            }));
            if (!this.reminderButtonDisabled.has(fee.id)) {
              this.reminderButtonDisabled.set(fee.id, false);
            }
          });

          this.applyFilter();
          resolve();
        },
        error: (err) => {
          console.error('Failed to load unpaid fees:', err);
          this.snackBar.open('Failed to load unpaid fees.', 'Close', { duration: 3000 });
          this.originalUnpaidFees = [];
          this.applyFilter();
          resolve();
        }
      });
    });
  }

  private groupFees(fees: UnpaidFeeDto[]): Map<string, UnpaidFeeDto[]> {
    const groups = new Map<string, UnpaidFeeDto[]>();
    fees.forEach(fee => {
      const group = groups.get(fee.apartmentNumber);
      if (group) {
        group.push(fee);
      } else {
        groups.set(fee.apartmentNumber, [fee]);
      }
    });
    return new Map([...groups.entries()].sort((a, b) => a[0].localeCompare(b[0], undefined, { numeric: true })));
  }

  private buildDisplayData(): void {
    const displayData: DisplayRow[] = [];
    this.groupedFees.forEach((fees, apartmentNumber) => {
      const isExpanded = this.expansionState.get(apartmentNumber) ?? false;
      const totalAmount = fees.reduce((sum, fee) => sum + fee.amount, 0);
      const totalRemaining = fees.reduce((sum, fee) => sum + fee.remainingAmount, 0);

      displayData.push({
        isGroupHeader: true,
        apartmentNumber: apartmentNumber,
        level: 0,
        isExpanded: isExpanded,
        feeCount: fees.length,
        totalAmount: totalAmount,
        totalRemaining: totalRemaining
      });

      if (isExpanded) {
        fees.forEach(fee => {
          const originalIndex = this.originalUnpaidFees.findIndex(originalFee => originalFee.id === fee.id);
          if (originalIndex !== -1) {
            displayData.push({
              isGroupHeader: false,
              apartmentNumber: fee.apartmentNumber,
              fee: fee,
              originalIndex: originalIndex,
              level: 1,
            });
          } else {
            console.warn(`Could not find original index for fee id ${fee.id} in apartment ${fee.apartmentNumber}`);
          }
        });
      }
    });
    this.dataSource.data = displayData;
    this.isLoading = false;
    this.cdr.detectChanges();
  }

  applyFilter(event?: Event) {
    const filterValue = event ? (event.target as HTMLInputElement).value.trim().toLowerCase() : '';
    this.isLoading = true;

    const filteredFees = filterValue
      ? this.originalUnpaidFees.filter(fee => fee.apartmentNumber.toLowerCase().includes(filterValue))
      : [...this.originalUnpaidFees];

    this.groupedFees = this.groupFees(filteredFees);

    const currentExpansion = new Map(this.expansionState);
    this.expansionState.clear();
    this.groupedFees.forEach((_, apartmentNumber) => {
      if (currentExpansion.has(apartmentNumber)) {
        this.expansionState.set(apartmentNumber, currentExpansion.get(apartmentNumber)!);
      } else {
        this.expansionState.set(apartmentNumber, false);
      }
    });

    this.buildDisplayData();
  }

  toggleFilter(event: Event): void {
    event.stopPropagation();
    this.showFilter = !this.showFilter;
    if (this.showFilter) {
      setTimeout(() => this.filterInput.nativeElement.focus());
    } else {
      this.filterInput.nativeElement.value = '';
      this.applyFilter();
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (this.showFilter && !this.filterInput.nativeElement.contains(event.target as Node)) {
      const clickedElement = event.target as Element;
      const filterButton = document.querySelector('.filter-button');
      if (!filterButton || !filterButton.contains(clickedElement)) {
        this.showFilter = false;
      }
    }
  }

  toggleExpansion(apartmentNumber: string): void {
    const currentState = this.expansionState.get(apartmentNumber) ?? false;
    this.expansionState.set(apartmentNumber, !currentState);
    this.buildDisplayData();
  }

  isGroupRow = (index: number, item: DisplayRow): boolean => item.isGroupHeader;
  isDetailRow = (index: number, item: DisplayRow): boolean => !item.isGroupHeader;

  markAsPaid(originalIndex: number): void {
    const paymentForm = this.paymentForms.at(originalIndex);
    const fee = this.originalUnpaidFees[originalIndex];

    if (!fee) {
      console.error(`Fee not found at original index ${originalIndex}`);
      this.snackBar.open(`Error: Fee not found.`, 'Close', { duration: 3000 });
      return;
    }
    if (paymentForm.invalid) {
      this.snackBar.open('Please fill in all payment details correctly.', 'Close', { duration: 3000 });
      paymentForm.markAllAsTouched();
      return;
    }

    const paymentAmount = paymentForm.get('paymentAmount')?.value;
    const paymentMethod = paymentForm.get('paymentMethod')?.value;
    const receivedDateRaw = paymentForm.get('receivedDate')?.value;

    if (paymentAmount <= 0) {
      this.snackBar.open('Payment amount must be positive.', 'Close', { duration: 3000 });
      return;
    }
    if (paymentAmount > fee.remainingAmount) {
      this.snackBar.open(`Payment (${paymentAmount}) cannot exceed remaining amount (${fee.remainingAmount}).`, 'Close', { duration: 5000 });
      return;
    }

    const paymentDetails = {
      amount: paymentAmount,
      paymentMethod: paymentMethod,
      paymentDate: this.formatDateForServer(new Date(receivedDateRaw)),
      feeCollectionId: fee.id
    };

    this.isLoading = true;
    this.collectionService.makePayment(paymentDetails).subscribe({
      next: (response) => {
        this.snackBar.open('Payment recorded successfully!', 'Close', { duration: 3000 });
        this.fetchUnpaidFees().finally(() => this.isLoading = false);
        this.fetchChartData();
      },
      error: (err) => {
        console.error('Payment failed:', err);
        this.snackBar.open(`Payment failed: ${err.error?.message || 'Server error'}`, 'Close', { duration: 5000 });
        this.isLoading = false;
      }
    });
  }

  sendReminder(originalIndex: number): void {
    const fee = this.originalUnpaidFees[originalIndex];
    if (!fee || this.isReminderButtonDisabled(fee.id)) {
      return;
    }

    const reminderRequest: PaymentReminderRequestDto = {
      apartmentName: fee.apartmentNumber,
      requiredAmount: fee.remainingAmount,
      requiredFor: fee.comment || '',
      forMonth: this.formatDateForServer(new Date(fee.requestForDate)),
      paymentDueDate: this.formatDateForServer(new Date(fee.dueDate))
    };
    this.reminderButtonDisabled.set(fee.id, true);

    this.collectionService.sendReminder(reminderRequest).subscribe({
      next: () => {
        this.snackBar.open(`Reminder sent for Apartment ${fee.apartmentNumber}.`, 'Close', { duration: 3000 });
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Failed to send reminder:', err);
        this.snackBar.open(`Failed to send reminder: ${err.error?.message || 'Server error'}`, 'Close', { duration: 5000 });
        this.reminderButtonDisabled.set(fee.id, false);
        this.cdr.detectChanges();
      }
    });
  }

  isReminderButtonDisabled(feeId: string): boolean {
    return this.reminderButtonDisabled.get(feeId) ?? false;
  }

  private formatDateForServer(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  dateFilter = (date: Date | null): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date ? date <= today : false;
  };

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
          this.demandForm.patchValue({
            apartmentName: [...this.apartments]
          });
          this.fetchUnpaidFees();
        },
        error: (error) => {
          this.snackBar.open('Failed to create demand', 'Close', { duration: 6000 });
          console.error('Create demand error:', error);
        }
      });
    } else {
      Object.keys(this.demandForm.controls).forEach(key => {
        const control = this.demandForm.get(key);
        control?.markAsTouched();
      });
    }
  }

  trackByRow(index: number, item: DisplayRow): string {
    if (item.isGroupHeader) {
      return `group-${item.apartmentNumber}`;
    } else {
      return `fee-${item.fee?.id ?? index}`;
    }
  }
}
