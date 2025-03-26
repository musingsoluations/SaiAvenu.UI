import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { CreateExpenseDto, ExpenseDto } from '../../models/expense';
import { MockExpenseService } from './mock-expense.service';
import { Environment } from '../../../environments/environment.interface';
import { API_ENV } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {
  constructor(private http: HttpClient) { }
  private readonly environment: Environment = inject(API_ENV);

  createExpense(expense: CreateExpenseDto): Observable<string> {
    const url = `${this.environment.apiUrl}/api/Expense/create`;
    return this.http.post<string>(`${url}`, expense);
  }

  getExpenses(month: number, year: number): Observable<ExpenseDto[]> {
    const url = `${this.environment.apiUrl}/api/Expense/monthly`;
    return this.http.get<ExpenseDto[]>(`${url}?month=${month}&year=${year}`);
  }
}
