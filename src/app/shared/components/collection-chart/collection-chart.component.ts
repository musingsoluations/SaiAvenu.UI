import { Component, Input, CUSTOM_ELEMENTS_SCHEMA, OnInit, AfterViewInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
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
    <div class="stats-container">
      <div class="stats-summary">
        <div class="stat-item">
          <div class="stat-label">TOTAL DEMAND</div>
          <div class="stat-value">{{formatCurrency(totalDemand)}}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">TOTAL COLLECTION</div>
          <div class="stat-value">{{formatCurrency(totalCollection)}}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">COLLECTION RATE</div>
          <div class="stat-value">{{collectionPercentage | number:'1.1-1'}}%</div>
        </div>
      </div>
      <div #chartContainer class="chart-container">
        <ngx-charts-bar-vertical-2d
          [view]="chartDimensions"
          [scheme]="'ocean'"
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
    </div>
  `,
  styleUrls: ['./collection-chart.component.css']
})
export class CollectionChartComponent implements OnInit, AfterViewInit {
  @Input() chartData: ChartDataPoint[] = [];
  @ViewChild('chartContainer', { static: true }) chartContainer!: ElementRef;

  chartDimensions: [number, number] = [800, 400];
  private resizeObserver: ResizeObserver;

  constructor(private cdr: ChangeDetectorRef) {
    this.resizeObserver = new ResizeObserver(() => this.updateDimensions());
  }

  ngOnInit() {
    // Initial dimensions update
    setTimeout(() => this.updateDimensions(), 0);
  }

  ngAfterViewInit() {
    // Start observing the container for size changes
    this.resizeObserver.observe(this.chartContainer.nativeElement);

    // Update dimensions after view init
    setTimeout(() => {
      this.updateDimensions();
      this.cdr.detectChanges();
    }, 100);
  }

  ngOnDestroy() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }

  private updateDimensions() {
    if (this.chartContainer) {
      const { clientWidth, clientHeight } = this.chartContainer.nativeElement;
      this.chartDimensions = [
        Math.max(clientWidth, 300), // Minimum width
        Math.max(clientHeight, 300)  // Minimum height
      ];
      this.cdr.detectChanges();
    }
  }

  get totalDemand(): number {
    return this.chartData.reduce((total, month) => {
      const demand = month.series.find(item => item.name === 'Total Demand');
      return total + (demand?.value || 0);
    }, 0);
  }

  get totalCollection(): number {
    return this.chartData.reduce((total, month) => {
      const collection = month.series.find(item => item.name === 'Total Collection');
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
