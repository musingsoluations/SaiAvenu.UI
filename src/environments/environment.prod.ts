// src/environments/environment.prod.ts
import { Environment } from './environment.interface';
import { InjectionToken } from '@angular/core';

export const environment: Environment = {
  production: true,
  apiUrl: '${API_URL}'
};

export const API_ENV = new InjectionToken<Environment>('api.environment', {
  providedIn: 'root',
  factory: () => environment,
});
