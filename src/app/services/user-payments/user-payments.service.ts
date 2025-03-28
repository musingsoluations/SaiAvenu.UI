import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENV, environment } from '../../../environments/environment';
import { Environment } from '../../../environments/environment.interface';

export interface UserPayment {
  id: string;
  amount: number;
  paidDate: string;
  feeCollectionId: string;
  paymentMethod: string;
  apartmentNumber: string;
  forWhat: number;
  comment: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserPaymentsService {
  private baseUrl = environment.apiUrl;
  private readonly environment: Environment = inject(API_ENV);

  constructor(private http: HttpClient) {}

  getUserPayments(): Observable<UserPayment[]> {
    return this.http.get<UserPayment[]>(`${this.environment.apiUrl}/api/Collections/user-payments`);
  }
}