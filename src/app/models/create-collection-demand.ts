export enum CollectionType {
  MonthlyMaintenance,
  AdhocExpense
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
