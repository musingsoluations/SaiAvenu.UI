import { Component, Input, CUSTOM_ELEMENTS_SCHEMA, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxChartsModule } from '@swimlane/ngx-charts';

export interface SeriesItem {
  name: string;
  value: number;
}

export interface ChartDataPoint {
  name: string;
  series: SeriesItem[];
}

@Component({
  selector: 'app-collection-chart',
  standalone: true,
  imports: [CommonModule, NgxChartsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="stats-summary">
      <div class="stat-item">
        <div class="stat-label">Total Demand</div>
        <div class="stat-value">{{formatCurrency(totalDemand)}}</div>
      </div>
      <div class="stat-item">
        <div class="stat-label">Total Collection</div>
        <div class="stat-value">{{formatCurrency(totalCollection)}}</div>
      </div>
      <div class="stat-item">
        <div class="stat-label">Collection Rate</div>
        <div class="stat-value">{{collectionPercentage | number:'1.0-1'}}%</div>
      </div>
    </div>
    <div class="chart-container">
      <ngx-charts-bar-vertical-2d
        [view]="[width, height]"
        [scheme]="'cool'"
        [results]="chartData"
        [gradient]="false"
        [xAxis]="true"
        [yAxis]="true"
        [legend]="true"
        [showXAxisLabel]="true"
        [showYAxisLabel]="true"
        [xAxisLabel]="'Month'"
        [yAxisLabel]="'Amount (₹)'"
        [barPadding]="8"
        [groupPadding]="16"
        [roundDomains]="true"
        [animations]="true">
      </ngx-charts-bar-vertical-2d>
    </div>
  `,
  styleUrls: ['./collection-chart.component.css']
})
export class CollectionChartComponent implements OnInit, AfterViewInit {
  @Input() chartData: ChartDataPoint[] = [];

  width = 800;
  height = 400;

  ngOnInit() {
    this.updateDimensions();
  }

  ngAfterViewInit() {
    this.updateDimensions();
    window.addEventListener('resize', () => this.updateDimensions());
  }

  private updateDimensions() {
    const container = document.querySelector('.chart-container');
    if (container) {
      this.width = container.clientWidth;
      this.height = container.clientHeight;
    }
  }

  get totalDemand(): number {
    return this.chartData.reduce((total, month) => {
      const demand = month.series.find(item => item.name === 'Demand');
      return total + (demand?.value || 0);
    }, 0);
  }

  get totalCollection(): number {
    return this.chartData.reduce((total, month) => {
      const collection = month.series.find(item => item.name === 'Collection');
      return total + (collection?.value || 0);
    }, 0);
  }

  get collectionPercentage(): number {
    return this.totalDemand ? (this.totalCollection / this.totalDemand) * 100 : 0;
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  }
}
