export enum CollectionType {
  MonthlyMaintenance = 1,
  AdhocExpense = 2
}

export interface CreateCollectionDemandDto {
  apartmentName: string[];
  amount: number;
  requestForDate: string;
  dueDate: string;
  forWhat: CollectionType;
  comment: string;
}
