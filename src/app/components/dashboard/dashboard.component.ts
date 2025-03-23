import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CollectionChartComponent } from '../../shared/components/collection-chart/collection-chart.component';
import { CollectionService } from '../../services/collection/collection.service';
import { ChartDataItem } from '../../models/collection-expense';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, CollectionChartComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})

export class DashboardComponent implements OnInit {
  chartData: ChartDataItem[] = [];

  constructor(private collectionService: CollectionService) { }

  ngOnInit(): void {
    this.collectionService.getCollectionExpenses(new Date().getFullYear()).subscribe(data => {
      this.chartData = data;
    });
  }
}

