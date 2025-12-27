import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CollectionChartComponent } from '../../shared/components/collection-chart/collection-chart.component';
import { CollectionService } from '../../services/collection/collection.service';
import { ChartDataItem } from '../../models/collection-expense';
import { ExpenseGridComponent } from '../../shared/components/expense-grid/expense-grid.component';
import { ExpenseService } from '../../services/expense/expense.service';
import { ExpenseDto } from '../../models/expense';
import { UserPaymentsGridComponent } from '../../shared/components/user-payments-grid/user-payments-grid.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatSelectModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    CollectionChartComponent,
    ExpenseGridComponent,
    UserPaymentsGridComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})

export class DashboardComponent implements OnInit {
  chartData: ChartDataItem[] = [];
  chartDataSelf: ChartDataItem[] = [];
  expenses: ExpenseDto[] = [];
  selectedYear: number = new Date().getFullYear();
  years: number[] = [];
  isLoadingChartData = true;
  isLoadingChartDataSelf = true;

  constructor(
    private collectionService: CollectionService,
    private expenseService: ExpenseService
  ) { }

  ngOnInit(): void {
    // Generate years from 2025 to 2035 (10 years ahead)
    const startYear = 2025;
    const endYear = startYear + 10;
    this.years = Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);
    this.loadCollectionData(this.selectedYear);
    this.loadExpenses();
  }

  onYearChange(year: number): void {
    this.selectedYear = year;
    this.loadCollectionData(year);
  }

  private loadCollectionData(year: number): void {
    this.isLoadingChartData = true;
    this.isLoadingChartDataSelf = true;

    this.collectionService.getCollectionPayment(year).subscribe({
      next: (data) => {
        this.chartData = data ?? [];
        this.isLoadingChartData = false;
      },
      error: () => {
        this.isLoadingChartData = false;
      }
    });

    this.collectionService.getCollectionPaymentSelf(year).subscribe({
      next: (selfData) => {
        this.chartDataSelf = selfData ?? [];
        this.isLoadingChartDataSelf = false;
      },
      error: () => {
        this.isLoadingChartDataSelf = false;
      }
    });
  }

  loadExpenses(): void {
    const currentDate = new Date();
    this.expenseService.getExpenses(currentDate.getMonth() + 1, currentDate.getFullYear()).subscribe({
      next: (expenses) => {
        this.expenses = expenses ?? [];
      },
      error: (error) => {
        console.error('Load expenses error:', error);
      }
    });
  }
}

