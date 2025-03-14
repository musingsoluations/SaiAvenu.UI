import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { API_ENV } from '../../../environments/environment';
import { Environment } from '../../../environments/environment.interface';
import { UserProfile } from '../../models/user-profile';
import { UserProfileUpdate } from '../../models/user-profile-update';

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {
  constructor(private httpClinet: HttpClient) {
  }
  private readonly environment: Environment = inject(API_ENV);
  getUserProfile() {
    var getUserProfile = `${this.environment.apiUrl}/api/User/profile`;
    return this.httpClinet.get<UserProfile>(getUserProfile);
  }

  updateUserProfile(userProfile: UserProfileUpdate) {
    var updateUserProfile = `${this.environment.apiUrl}/api/User/profile`;
    return this.httpClinet.patch(updateUserProfile, userProfile);
  }

}
