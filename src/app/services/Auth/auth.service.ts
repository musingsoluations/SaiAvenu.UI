import { Injectable, inject } from '@angular/core';
import { interval } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, tap } from 'rxjs';
import { Router } from '@angular/router';
import { AuthResponse } from '../../models/auth-response';
import { CurrentUser } from '../../models/current-user';
import { API_ENV } from '../../../environments/environment';
import { UserLogin } from '../../models/user-login';
import { Environment } from '../../../environments/environment.interface';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  private rolesSubject = new BehaviorSubject<string[]>([]);
  private readonly environment: Environment = inject(API_ENV);
  currentUserData?: CurrentUser;

  get isLoggedIn() {
    return this.isLoggedInSubject.getValue();
  }

  isLoggedIn$ = this.isLoggedInSubject.asObservable();

  private readonly AUTH_API = `${this.environment.apiUrl}/api/User/login`;
  private readonly TOKEN_KEY = 'jwt_token';

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {
    // Initialize auth state from storage
    const token = this.getToken();
    if (token) {
      const payload = this.decodeToken(token);
      this.rolesSubject.next(payload.roles || []);
      this.isLoggedInSubject.next(true);
    }
    // Periodic token validation
    interval(30000).subscribe(() => {
      const currentToken = this.getToken();
      if (currentToken && this.isTokenExpired(currentToken)) {
        this.logout();
      }
    });
  }

  login(loginInfo: UserLogin) {
    return this.http.post<AuthResponse>(this.AUTH_API, loginInfo).pipe(
      tap(response => {
        this.setToken(response.jwtToken);
        this.extractUserData(response);
        const payload = this.decodeToken(response.jwtToken);
        this.rolesSubject.next(payload.roles || []);
        this.isLoggedInSubject.next(true);
      }),
    );
  }

  getToken(): string | null {
    const token = localStorage.getItem(this.TOKEN_KEY);
    if (token && this.isTokenExpired(token)) {
      this.logout();
      return null;
    }
    return token;
  }

  private decodeToken(token: string): { roles: string[]; exp: number } {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      return { roles: [], exp: 0 };
    }
  }

  private isTokenExpired(token: string): boolean {
    const payload = this.decodeToken(token);
    return payload.exp < Date.now() / 1000;
  }

  private setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  get roles$() {
    return this.rolesSubject.asObservable();
  }

  removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem('user');
    this.isLoggedInSubject.next(false);
    this.router.navigate(['/login']);
  }

  //extract current user data from response
  private extractUserData(response: AuthResponse): CurrentUser {
    this.currentUserData = {
      firstName: response.firstName,
      lastName: response.lastName,
      email: response.email,
      mobile: response.mobile,
      displayNameText:
        `${response.firstName.charAt(0)} ${response.lastName.charAt(0)}`.toLocaleUpperCase(),
    };
    return this.currentUserData;
  }
}
