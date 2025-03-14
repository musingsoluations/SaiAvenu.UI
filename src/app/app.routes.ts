import { Routes } from '@angular/router';

import { LayoutComponent } from './components/layout/layout.component';
import { authGuard } from './guard/auth-guard';
import { LoginComponent } from './components/login/login.component';
import { RegisterUserComponent } from './components/register-user/register-user.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./components/register-user/register-user.component').then(
            m => m.RegisterUserComponent,
          ),
        data: { requiredRoles: ['Admin'] },
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./components/profile/profile.component').then(m => m.ProfileComponent),
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
