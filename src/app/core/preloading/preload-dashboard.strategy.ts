import { Injectable } from '@angular/core';
import { PreloadingStrategy, Route } from '@angular/router';
import { Observable, EMPTY, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PreloadDashboardStrategy implements PreloadingStrategy {
  preload(route: Route, fn: () => Observable<any>): Observable<any> {
    // Check if the route path is 'dashboard' and preload it
    if (route.path === 'dashboard') {
      return fn(); // Call the function to preload the module/component
    } else {
      // Don't preload other routes
      return EMPTY;
    }
  }
}
