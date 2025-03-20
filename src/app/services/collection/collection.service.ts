import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateCollectionDemandDto } from '../../models/create-collection-demand';
import { UnpaidFeeResultDto } from '../../models/unpaid-fee-result';
import { API_ENV } from '../../../environments/environment';
import { Environment } from '../../../environments/environment.interface';

@Injectable({
  providedIn: 'root'
})
export class CollectionService {
  private readonly baseUrl = 'api/collections';

  constructor(private http: HttpClient) { }

  private readonly environment: Environment = inject(API_ENV);

  createDemand(demand: CreateCollectionDemandDto): Observable<string[]> {
    return this.http.post<string[]>(`${this.environment.apiUrl}api/Collections/demand`, demand);
  }

  getUnpaidFees(): Observable<UnpaidFeeResultDto[]> {
    return this.http.get<UnpaidFeeResultDto[]>(`${this.environment.apiUrl}/api/Collections/unpaid`);
  }

  getApartmentNumbers(): Observable<string[]> {
    return this.http.get<string[]>(`${this.environment.apiUrl}/api/Apartment/GetApartmentNumbers`);
  }
}
