export interface UnpaidFeeDto {
  apartmentNumber: string;
  amount: number;
  requestForDate: Date;
  dueDate: Date;
  forWhat: string;
  comment?: string;
}
