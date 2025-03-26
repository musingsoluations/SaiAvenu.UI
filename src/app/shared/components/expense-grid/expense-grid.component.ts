import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { ExpenseDto, ExpenseType } from '../../../models/expense';
import { ExpenseService } from '../../../services/expense/expense.service';

@Component({
  selector: 'app-expense-grid',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatSelectModule
  ],
  templateUrl: './expense-grid.component.html',
  styleUrls: ['./expense-grid.component.css']
})
export class ExpenseGridComponent implements OnInit {
  @Input() expenses: ExpenseDto[] = [];
  @Output() expensesChange = new EventEmitter<ExpenseDto[]>();

  displayedColumns: string[] = ['name', 'type', 'amount', 'date'];
  totalExpense: number = 0;

  currentMonth = new Date().getMonth() + 1;
  currentYear = new Date().getFullYear();

  months = Array.from({length: 12}, (_, i) => ({ value: i + 1, label: new Date(0, i).toLocaleString('default', { month: 'long' }) }));
  years = Array.from({length: 5}, (_, i) => this.currentYear - 2 + i);

  expenseTypes = [
    { value: ExpenseType.recurring, label: 'Recurring' },
    { value: ExpenseType.adHoc, label: 'Ad Hoc' }
  ];

  constructor(private expenseService: ExpenseService) {}

  ngOnInit(): void {
    this.loadExpenses();
  }

  loadExpenses(): void {
    this.expenseService.getExpenses(this.currentMonth, this.currentYear).subscribe({
      next: (expenses) => {
        this.expenses = expenses;
        this.expensesChange.emit(expenses);
        this.calculateTotal();
      },
      error: (error) => {
        console.error('Load expenses error:', error);
      }
    });
  }

  calculateTotal(): void {
    this.totalExpense = this.expenses.reduce((sum, expense) => sum + expense.amount, 0);
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
}