// src/environments/environment.ts
import { InjectionToken } from '@angular/core';

export interface Environment {
  production: boolean;
  apiUrl: string;
}

export const environment: Environment = {
  production: false,
  apiUrl: 'http://localhost:5206'
};

export const API_ENV = new InjectionToken<Environment>('api.environment', {
  providedIn: 'root',
  factory: () => environment,
});
