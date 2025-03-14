import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { API_ENV } from '../../../environments/environment';
import { Environment } from '../../../environments/environment.interface';
import { UserProfile } from '../../models/user-profile';

@Injectable({
  providedIn: 'root'
})
export class UserprofileService {
  constructor(private httpClinet: HttpClient) {
  }
  private readonly environment: Environment = inject(API_ENV);
  getUserProfile() {
    var getUserProfile = `${this.environment.apiUrl}/api/User/profile`;
    return this.httpClinet.get<UserProfile>(getUserProfile);
  }
}
