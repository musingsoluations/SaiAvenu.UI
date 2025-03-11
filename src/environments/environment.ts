import { InjectionToken } from '@angular/core';

export interface Environment {
  production: boolean;
  apiUrl: string;
}

export const environment: Environment = {
  production: false,
  apiUrl: 'https://mysocietyhub-test.azurewebsites.net/'
};

export const API_ENV = new InjectionToken<Environment>('app.environment');
