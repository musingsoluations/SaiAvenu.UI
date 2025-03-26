import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { CreateExpenseDto, ExpenseDto } from '../../models/expense';
import { MockExpenseService } from './mock-expense.service';

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {
  constructor(private http: HttpClient) { }

  createExpense(expense: CreateExpenseDto): Observable<string> {
    return of('mock-expense-id');
  }

  getExpenses(month: number, year: number): Observable<ExpenseDto[]> {
    return of(MockExpenseService.getExpenses(month, year));
  }
}
