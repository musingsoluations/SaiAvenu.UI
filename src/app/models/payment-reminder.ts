export interface PaymentReminderRequestDto {
  apartmentName: string;
  requiredAmount: number;
  requiredFor: string| undefined;
  forMonth: string;
  paymentDueDate: string;
}
