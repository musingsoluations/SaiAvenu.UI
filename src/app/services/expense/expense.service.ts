import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateExpenseDto } from '../../models/expense';
import { API_ENV } from '../../../environments/environment';
import { Environment } from '../../../environments/environment.interface';

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {;

  private readonly environment: Environment = inject(API_ENV);

  constructor(private http: HttpClient) { }

  createExpense(expense: CreateExpenseDto): Observable<string> {
    const url = `${this.environment.apiUrl}/api/Expense/create`;
    return this.http.post<string>(`${url}`, expense);
  }
}
