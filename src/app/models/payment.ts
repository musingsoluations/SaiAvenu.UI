export enum PaymentMethod {
  Cash = 'Cash',
  Online = 'Online'
}

export interface Payment {
  amount: number;
  paymentDate: Date;
  feeCollectionId: string;
  paymentMethod: PaymentMethod;
}
