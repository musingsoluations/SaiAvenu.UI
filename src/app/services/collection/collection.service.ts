import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateCollectionDemandDto } from '../../models/create-collection-demand';
import { UnpaidFeeResultDto } from '../../models/unpaid-fee-result';

@Injectable({
  providedIn: 'root'
})
export class CollectionService {
  private readonly baseUrl = 'api/collections';

  constructor(private http: HttpClient) { }

  createDemand(demand: CreateCollectionDemandDto): Observable<string[]> {
    return this.http.post<string[]>(`${this.baseUrl}/demand`, demand);
  }

  getUnpaidFees(): Observable<UnpaidFeeResultDto[]> {
    return this.http.get<UnpaidFeeResultDto[]>(`${this.baseUrl}/unpaid`);
  }
}
