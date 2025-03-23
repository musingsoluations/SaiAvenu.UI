export interface UnpaidFeeDto {
  id: string;
  apartmentNumber: string;
  amount: number;
  requestForDate: Date;
  dueDate: Date;
  remainingAmount: number;
  forWhat: string;
  comment?: string;
}
