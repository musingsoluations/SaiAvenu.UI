import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateUser } from '../../models/create-user';
import { API_ENV } from '../../../environments/environment';
import { Environment } from '../../../environments/environment.interface';

@Injectable({ providedIn: 'root' })
export class UserAdminService {
  constructor(private http: HttpClient) { }

  private readonly environment: Environment = inject(API_ENV);

  registerUser(user: CreateUser): Observable<any> {
    var registerUsers = `${this.environment.apiUrl}/api/User/register`;
    return this.http.post(registerUsers, user);
  }
}
