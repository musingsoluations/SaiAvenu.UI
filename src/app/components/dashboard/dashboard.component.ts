import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { CollectionChartComponent } from '../../shared/components/collection-chart/collection-chart.component';
import { CollectionService } from '../../services/collection/collection.service';
import { ChartDataItem } from '../../models/collection-expense';
import { ExpenseGridComponent } from '../../shared/components/expense-grid/expense-grid.component';
import { ExpenseService } from '../../services/expense/expense.service';
import { ExpenseDto } from '../../models/expense';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatSelectModule, CollectionChartComponent, ExpenseGridComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})

export class DashboardComponent implements OnInit {
  chartData: ChartDataItem[] = [];
  chartDataSelf: ChartDataItem[] = [];
  expenses: ExpenseDto[] = [];
  constructor(
    private collectionService: CollectionService,
    private expenseService: ExpenseService
  ) { }

  ngOnInit(): void {
    const currentYear = new Date().getFullYear();
    this.collectionService.getCollectionPayment(currentYear).subscribe(data => {
      this.chartData = data;
    });
    this.collectionService.getCollectionPaymentSelf(currentYear).subscribe(selfData => {
      this.chartDataSelf = selfData;
    });
    this.loadExpenses();
  }

  loadExpenses(): void {
    const currentDate = new Date();
    this.expenseService.getExpenses(currentDate.getMonth() + 1, currentDate.getFullYear()).subscribe({
      next: (expenses) => {
        this.expenses = expenses;
      },
      error: (error) => {
        console.error('Load expenses error:', error);
      }
    });
  }
}

