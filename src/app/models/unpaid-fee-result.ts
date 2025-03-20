import { CollectionType } from './create-collection-demand';

export interface UnpaidFeeResultDto {
  id: string;
  apartmentNumber: string;
  amount: number;
  requestForDate: Date;
  dueDate: Date;
  forWhat: CollectionType;
  comment: string | null;
}
