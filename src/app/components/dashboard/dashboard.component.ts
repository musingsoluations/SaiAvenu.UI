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
      "name": "Demand",
      "series": [
        { "name": "January", "value": 100000 },
        { "name": "February", "value": 120000 },
        { "name": "March", "value": 95000 },
        { "name": "April", "value": 130000 },
        { "name": "May", "value": 140000 }
      ]
    },
    {
      "name": "Collection",
      "series": [
        { "name": "January", "value": 90000 },
        { "name": "February", "value": 110000 },
        { "name": "March", "value": 85000 },
        { "name": "April", "value": 125000 },
        { "name": "May", "value": 135000 }
      ]
    }
  ];
}
