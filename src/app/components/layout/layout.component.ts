import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../services/Auth/auth.service';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { AsyncPipe, CommonModule } from '@angular/common';
import { CollectionService } from '../../services/collection/collection.service';
import { CollectionTotals } from '../../models/collection-expense';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css'],
  imports: [
    CommonModule,
    RouterModule,
    MatMenuModule,
    MatIconModule,
    MatToolbarModule,
    MatButtonModule,
    AsyncPipe,
  ],
  standalone: true,
})
export class LayoutComponent implements OnInit {
  isCollapsed = false;
  isAdmin$: Observable<boolean>;
  totals$: Observable<CollectionTotals>;
  netBalance: number = 0;

  constructor(
    private authService: AuthService,
    private collectionService: CollectionService
  ) {
    this.isAdmin$ = this.authService.roles$.pipe(
      map((roles: string[]) => roles.includes('Admin'))
    );
    this.totals$ = this.collectionService.getTotals();
  }

  ngOnInit() {
    this.totals$.subscribe(totals => {
      this.netBalance = (totals.totalPayments + totals.totalCarryForwardPayments) - totals.totalExpenses;
    });
  }

  logout() {
    this.authService.logout();
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  }
}
