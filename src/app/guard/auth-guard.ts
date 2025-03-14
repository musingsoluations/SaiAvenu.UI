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
    const requiredRoles = route.firstChild?.data['requiredRoles'] as string[] | undefined;

    if (requiredRoles) {
      const userRoles = authService.getRoles();
      const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));

      if (!hasRequiredRole) {
        console.log('User lacks required roles, redirecting to dashboard');
        router.navigate(['/dashboard']);
        return false;
      }
    }
    return true;
  }

  console.log('Redirecting to login');
  authService.logout();
  router.navigate(['/login']);
  return false;
};
