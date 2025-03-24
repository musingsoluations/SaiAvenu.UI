export enum PaymentMethod {
  Cash = 'Cash',
  Online = 'Online'
}

export interface Payment {
  amount: number;
  paymentDate: string;
  feeCollectionId: string;
  paymentMethod: PaymentMethod;
}
