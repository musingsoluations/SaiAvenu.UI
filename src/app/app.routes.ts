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
        path: 'apartment',
        loadComponent: () =>
          import('./components/apartment/apartment.component').then(
            m => m.ApartmentComponent,
          ),
        data: { requiredRoles: ['Admin'] },
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./components/profile/profile.component').then(m => m.ProfileComponent),
      },
      {
        path: 'collection',
        loadComponent: () =>
          import('./components/collection/collection.component').then(m => m.CollectionComponent),
      },
      {
        path: 'expense',
        loadComponent: () =>
          import('./components/expense/expense.component').then(m => m.ExpenseComponent),
        data: { requiredRoles: ['Admin'] },
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
