import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateCollectionDemandDto } from '../../models/create-collection-demand';
import { UnpaidFeeDto } from '../../models/unpaid-fee.dto';
import { API_ENV } from '../../../environments/environment';
import { Environment } from '../../../environments/environment.interface';
import { Payment } from '../../models/payment';
import { ChartDataItem } from '../../models/collection-expense';

@Injectable({
  providedIn: 'root'
})
export class CollectionService {
  private readonly baseUrl = 'api/collections';

  constructor(private http: HttpClient) { }

  private readonly environment: Environment = inject(API_ENV);

  createDemand(demand: CreateCollectionDemandDto): Observable<string[]> {
    return this.http.post<string[]>(`${this.environment.apiUrl}/api/Collections/demand`, demand);
  }

  getUnpaidFees(): Observable<UnpaidFeeDto[]> {
    return this.http.get<UnpaidFeeDto[]>(`${this.environment.apiUrl}/api/Collections/unpaid`);
  }

  getApartmentNumbers(): Observable<string[]> {
    return this.http.get<string[]>(`${this.environment.apiUrl}/api/Apartment/GetApartmentNumbers`);
  }

  makePayment(payment: Payment): Observable<void> {
    return this.http.post<void>(`${this.environment.apiUrl}/api/Collections/payment`, payment);
  }

  getCollectionPayment(year: number): Observable<ChartDataItem[]> {
    return this.http.post<ChartDataItem[]>(`${this.environment.apiUrl}/api/Collections/collection-payment`, year);
  }

  getCollectionPaymentSelf(year: number): Observable<ChartDataItem[]> {
    return this.http.post<ChartDataItem[]>(`${this.environment.apiUrl}/api/Collections/demand-paid-self`, year);
  }
}
