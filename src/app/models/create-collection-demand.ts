export enum CollectionType {
  MonthlyMaintenance = 1,
  AdhocExpense = 2
}

export interface CreateCollectionDemandDto {
  apartmentName: string[];
  amount: number;
  requestForDate: Date;
  dueDate: Date;
  paidDate: Date | null;
  isPaid: boolean;
  forWhat: CollectionType;
  comment: string | null;
}
