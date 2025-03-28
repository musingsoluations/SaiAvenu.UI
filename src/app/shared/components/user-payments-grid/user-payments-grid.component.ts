import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { UserPayment, UserPaymentsService } from '../../../services/user-payments/user-payments.service';

@Component({
  selector: 'app-user-payments-grid',
  standalone: true,
  imports: [CommonModule, MatTableModule],
  template: `
    <table mat-table [dataSource]="payments" class="payments-table">
      <!-- Amount Column -->
      <ng-container matColumnDef="amount">
        <th mat-header-cell *matHeaderCellDef>Amount</th>
        <td mat-cell *matCellDef="let payment">{{payment.amount | currency:'INR'}}</td>
      </ng-container>

      <!-- Date Column -->
      <ng-container matColumnDef="paidDate">
        <th mat-header-cell *matHeaderCellDef>Paid Date</th>
        <td mat-cell *matCellDef="let payment">{{payment.paidDate | date}}</td>
      </ng-container>

      <!-- Payment Method Column -->
      <ng-container matColumnDef="paymentMethod">
        <th mat-header-cell *matHeaderCellDef>Payment Method</th>
        <td mat-cell *matCellDef="let payment">{{payment.paymentMethod}}</td>
      </ng-container>

      <!-- Apartment Number Column -->
      <ng-container matColumnDef="apartmentNumber">
        <th mat-header-cell *matHeaderCellDef>Apartment</th>
        <td mat-cell *matCellDef="let payment">{{payment.apartmentNumber}}</td>
      </ng-container>

      <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
      <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
    </table>
  `,
  styles: [`
    .payments-table {
      width: 100%;
      background: white;
      box-shadow: none;
    }

    .mat-mdc-row:nth-child(even) {
      background-color: #f5f5f5;
    }

    .mat-mdc-row:hover {
      background-color: #eeeeee;
    }

    .mat-mdc-header-cell {
      font-weight: bold;
      color: #333;
    }

    .mat-mdc-cell {
      color: #666;
    }
  `]
})
export class UserPaymentsGridComponent implements OnInit {
  payments: UserPayment[] = [];
  displayedColumns: string[] = ['amount', 'paidDate', 'paymentMethod', 'apartmentNumber'];

  constructor(private userPaymentsService: UserPaymentsService) {}

  ngOnInit(): void {
    this.loadPayments();
  }

  private loadPayments(): void {
    this.userPaymentsService.getUserPayments().subscribe({
      next: (payments) => {
        this.payments = payments;
      },
      error: (error) => {
        console.error('Load payments error:', error);
      }
    });
  }
}