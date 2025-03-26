import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ExpenseGridComponent } from '../../shared/components/expense-grid/expense-grid.component';
import { ExpenseService } from '../../services/expense/expense.service';
import { ExpenseType, CreateExpenseDto, ExpenseDto } from '../../models/expense';

@Component({
  selector: 'app-expense',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    ExpenseGridComponent,
  ],
  templateUrl: './expense.component.html',
  styleUrls: ['./expense.component.css']
})
export class ExpenseComponent implements OnInit {
  expenseForm: FormGroup;
  expenseTypes = [
    { value: ExpenseType.recurring, label: 'Recurring' },
    { value: ExpenseType.adHoc, label: 'Ad Hoc' }
  ];

  expenses: ExpenseDto[] = [];
  displayedColumns: string[] = ['name', 'type', 'amount', 'date'];
  totalExpense: number = 0;

  currentMonth = new Date().getMonth() + 1;
  currentYear = new Date().getFullYear();

  months = Array.from({length: 12}, (_, i) => ({ value: i + 1, label: new Date(0, i).toLocaleString('default', { month: 'long' }) }));
  years = Array.from({length: 5}, (_, i) => this.currentYear - 2 + i);

  constructor(
    private fb: FormBuilder,
    private expenseService: ExpenseService,
    private snackBar: MatSnackBar
  ) {
    this.expenseForm = this.fb.group({
      name: ['', [Validators.required]],
      type: ['', [Validators.required]],
      amount: ['', [Validators.required, Validators.min(0)]],
      date: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.loadExpenses();
  }

  loadExpenses(): void {
    this.expenseService.getExpenses(this.currentMonth, this.currentYear).subscribe({
      next: (expenses) => {
        this.expenses = expenses;
        this.totalExpense = expenses.reduce((sum, expense) => sum + expense.amount, 0);
      },
      error: (error) => {
        this.snackBar.open('Failed to load expenses', 'Close', { duration: 6000 });
        console.error('Load expenses error:', error);
      }
    });
  }

  onMonthChange(month: number): void {
    this.currentMonth = month;
    this.loadExpenses();
  }

  onYearChange(year: number): void {
    this.currentYear = year;
    this.loadExpenses();
  }

  getExpenseTypeLabel(type: ExpenseType): string {
    return this.expenseTypes.find(t => t.value === type)?.label || '';
  }

  private formatDateForServer(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  onSubmit(): void {
    if (this.expenseForm.valid) {
      const formValue = this.expenseForm.value;

      const expense: CreateExpenseDto = {
        name: formValue.name,
        type: formValue.type,
        amount: formValue.amount,
        date: this.formatDateForServer(formValue.date)
      };

      this.expenseService.createExpense(expense).subscribe({
        next: () => {
          this.snackBar.open('Expense created successfully', 'Close', { duration: 3000 });
          this.expenseForm.reset();
        },
        error: (error) => {
          this.snackBar.open('Failed to create expense', 'Close', { duration: 6000 });
          console.error('Create expense error:', error);
        }
      });
    } else {
      Object.keys(this.expenseForm.controls).forEach(key => {
        const control = this.expenseForm.get(key);
        control?.markAsTouched();
      });
    }
  }
}
