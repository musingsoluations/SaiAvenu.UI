import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ExpenseService } from '../../services/expense/expense.service';
import { ExpenseType, CreateExpenseDto } from '../../models/expense';

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

  ngOnInit(): void {}

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
