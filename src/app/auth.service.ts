import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, tap } from 'rxjs';

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
  get isLoggedIn() {
    return this.isLoggedInSubject.getValue();
  }

  isLoggedIn$ = this.isLoggedInSubject.asObservable();

  private readonly AUTH_API = `https://mysocietyhub-test.azurewebsites.net/api/User/login`;
  private readonly TOKEN_KEY = 'jwt_token';

  constructor(private http: HttpClient) { }

  login(mobileNumber: string, password: string) {
    return this.http.post<{ jwtToken: string }>(this.AUTH_API, { mobileNumber, password }).pipe(
      tap(response => {
        this.setToken(response.jwtToken);
        this.isLoggedInSubject.next(true);
      })
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

  private isTokenExpired(token: string): boolean {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp < (Date.now() / 1000);
  }

  private setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
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
