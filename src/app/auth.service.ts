import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  isLoggedIn$ = this.isLoggedInSubject.asObservable();

  constructor() { }

  login(username: string, password: string): boolean {
    const isValid = username === 'user' && password === 'user';
    this.isLoggedInSubject.next(isValid);
    return isValid;
  }

  logout() {
    this.isLoggedInSubject.next(false);
  }
}
