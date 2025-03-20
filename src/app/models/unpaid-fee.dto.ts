export interface UnpaidFeeDto {
  Id: string;
  apartmentNumber: string;
  amount: number;
  requestForDate: Date;
  dueDate: Date;
  forWhat: string;
  comment?: string;
}
