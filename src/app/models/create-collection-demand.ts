export enum CollectionType {
  MonthlyMaintenance = 1,
  AdhocExpense = 2
}

export interface CreateCollectionDemandDto {
  apartmentName: string[];
  amount: number;
  requestForDate: Date;
  dueDate: Date;
  forWhat: CollectionType;
  comment: string | null;
}
