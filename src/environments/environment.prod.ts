// src/environments/environment.prod.ts
import { Environment } from './environment';
import { InjectionToken } from '@angular/core';

export const environment: Environment = {
  production: true,
  apiUrl: 'https://mysocietyhub-test.azurewebsites.net/'  // Your production API URL
};

export const API_ENV = new InjectionToken<Environment>('api.environment', {
  providedIn: 'root',
  factory: () => environment,
});
