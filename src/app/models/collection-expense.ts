export interface SeriesItem {
  name: string;
  value: number;
}


export interface ChartDataItem {
  name: string;
  series: SeriesItem[];
}
