import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CollectionChartComponent } from '../../shared/components/collection-chart/collection-chart.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, CollectionChartComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  chartData = [
    {
      "name": "January",
      "series": [
        { "name": "Demand", "value": 100000 },
        { "name": "Collection", "value": 90000 }
      ]
    },
    {
      "name": "February",
      "series": [
        { "name": "Demand", "value": 120000 },
        { "name": "Collection", "value": 110000 }
      ]
    },
    {
      "name": "March",
      "series": [
        { "name": "Demand", "value": 95000 },
        { "name": "Collection", "value": 85000 }
      ]
    },
    {
      "name": "April",
      "series": [
        { "name": "Demand", "value": 130000 },
        { "name": "Collection", "value": 125000 }
      ]
    },
    {
      "name": "May",
      "series": [
        { "name": "Demand", "value": 140000 },
        { "name": "Collection", "value": 135000 }
      ]
    }
  ];
}
