import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/Auth/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const token = authService.getToken();
  const isLoggedIn = authService.isLoggedIn;

  console.log('AuthGuard check:', { token, isLoggedIn });

  if (token && isLoggedIn) {
    return true;
  }

  console.log('Redirecting to login');
  authService.logout();
  router.navigate(['/login']);
  return false;
};
