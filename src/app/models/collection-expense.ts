export interface SeriesItem {
  name: string;
  value: number;
}


export interface ChartDataItem {
  name: string;
  series: SeriesItem[];
}

export interface CollectionTotals {
  totalPayments: number;
  totalExpenses: number;
  totalCarryForwardPayments: number;
}
