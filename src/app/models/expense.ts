export enum ExpenseType {
  recurring = 1,
  adHoc = 2
}

export interface CreateExpenseDto {
  name: string;
  type: ExpenseType;
  amount: number;
  date: string; // Will be formatted as YYYY-MM-DD for DateOnly
}
