import { Component, Input, Output, EventEmitter, CUSTOM_ELEMENTS_SCHEMA, OnInit, AfterViewInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { LegendPosition } from '@swimlane/ngx-charts';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';

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
  imports: [CommonModule, NgxChartsModule, MatSelectModule, MatFormFieldModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './collection-chart.component.html',
  styleUrls: ['./collection-chart.component.css']
})
export class CollectionChartComponent implements OnInit, AfterViewInit {
  @Input() set chartData(value: ChartDataPoint[] | null) {
    this._chartData = Array.isArray(value) ? value : [];
  }
  get chartData(): ChartDataPoint[] {
    return this._chartData;
  }
  private _chartData: ChartDataPoint[] = [];

  @Output() yearChanged = new EventEmitter<number>();

  selectedYear: number = new Date().getFullYear();
  years: number[] = [];

  @ViewChild('chartContainer', { static: true }) chartContainer!: ElementRef;

  chartDimensions: [number, number] = [800, 400];
  private resizeObserver: ResizeObserver;
  LegendPosition = LegendPosition;

  // Add methods for responsive values
  get barPadding(): number {
    return window.innerWidth <= 480 ? 4 : 8;
  }

  get groupPadding(): number {
    return window.innerWidth <= 480 ? 8 : 16;
  }

  get marginBottom(): number {
    return window.innerWidth <= 480 ? 100 : 60;
  }

  constructor(private cdr: ChangeDetectorRef) {
    this.resizeObserver = new ResizeObserver(() => this.updateDimensions());
  }

  get isValidChartData(): boolean {
    return Array.isArray(this.chartData) && this.chartData.length > 0;
  }

  ngOnInit() {
    // Generate years from 2025 to 2035 (10 years ahead)
    const currentYear = new Date().getFullYear();
    const startYear = 2025;
    const endYear = startYear + 10;
    this.years = Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);
    this.selectedYear = currentYear;
    setTimeout(() => this.updateDimensions(), 0);
  }

  ngAfterViewInit() {
    this.resizeObserver.observe(this.chartContainer.nativeElement);
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

  onYearChange(year: number): void {
    this.selectedYear = year;
    this.yearChanged.emit(year);
  }

  private updateDimensions() {
    if (this.chartContainer) {
      const { clientWidth, clientHeight } = this.chartContainer.nativeElement;
      const width = Math.max(Math.min(clientWidth, 1200), 300); // Cap width between 300 and 1200
      const height = Math.max(Math.min(clientHeight, 600), 200); // Cap height between 200 and 600

      // Adjust height based on width for better proportions
      const aspectRatio = window.innerWidth <= 480 ? 1.2 : 1.6; // More square on mobile
      const calculatedHeight = width / aspectRatio;

      this.chartDimensions = [
        width,
        Math.min(calculatedHeight, height) // Use calculated height but don't exceed container
      ];
      this.cdr.detectChanges();
    }
  }

  get totalDemand(): number {
    if (!Array.isArray(this.chartData)) return 0;
    return this.chartData.reduce((total, month) => {
      const demand = month.series?.find(item => item.name === 'Total Demand');
      return total + (demand?.value || 0);
    }, 0);
  }

  get totalCollection(): number {
    if (!Array.isArray(this.chartData)) return 0;
    return this.chartData.reduce((total, month) => {
      const collection = month.series?.find(item => item.name === 'Total Collection');
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

  formatYAxisTick = (value: number) => {
    if (value >= 1000) {
      return `${value / 1000}K`;
    }
    return value.toString();
  };
}
