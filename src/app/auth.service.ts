import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, tap } from 'rxjs';
import { Environment } from '../environments/environment.interface';
import { API_ENV } from '../environments/environment';
import { CreateUserDto } from './models/user.dto';

interface AuthResponse {
  jwtToken: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  private rolesSubject = new BehaviorSubject<string[]>([]);
  private readonly environment: Environment = inject(API_ENV);
  get isLoggedIn() {
    return this.isLoggedInSubject.getValue();
  }

  isLoggedIn$ = this.isLoggedInSubject.asObservable();

  private readonly AUTH_API = `${this.environment.apiUrl}/api/User/login`;
  private readonly TOKEN_KEY = 'jwt_token';

  constructor(private http: HttpClient) { }

  login(mobileNumber: string, password: string) {
    return this.http.post<{ jwtToken: string }>(this.AUTH_API, { mobileNumber, password }).pipe(
      tap(response => {
        this.setToken(response.jwtToken);
        const payload = this.decodeToken(response.jwtToken);
        this.rolesSubject.next(payload.roles || []);
        this.isLoggedInSubject.next(true);
      })
    );
  }

  registerUser(userData: CreateUserDto) {
    return this.http.post<{ jwtToken: string }>(
      `${this.environment.apiUrl}/api/user/register`,
      userData
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

  private decodeToken(token: string): { roles: string[], exp: number } {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      return { roles: [], exp: 0 };
    }
  }

  private isTokenExpired(token: string): boolean {
    const payload = this.decodeToken(token);
    return payload.exp < (Date.now() / 1000);
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
  }
}
