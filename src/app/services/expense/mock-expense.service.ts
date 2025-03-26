import { ExpenseDto, ExpenseType } from '../../models/expense';

export class MockExpenseService {
  private static mockExpenses: ExpenseDto[] = [
    {
      id: '1',
      name: 'Electricity Bill',
      type: ExpenseType.recurring,
      amount: 2500,
      date: '2024-01-15'
    },
    {
      id: '2',
      name: 'Water Bill',
      type: ExpenseType.recurring,
      amount: 800,
      date: '2024-01-10'
    },
    {
      id: '3',
      name: 'Security Service',
      type: ExpenseType.recurring,
      amount: 15000,
      date: '2024-02-01'
    },
    {
      id: '4',
      name: 'Garden Maintenance',
      type: ExpenseType.recurring,
      amount: 5000,
      date: '2024-02-15'
    },
    {
      id: '5',
      name: 'Lift Repair',
      type: ExpenseType.adHoc,
      amount: 25000,
      date: '2023-12-20'
    },
    {
      id: '6',
      name: 'Painting Work',
      type: ExpenseType.adHoc,
      amount: 50000,
      date: '2023-12-05'
    },
    {
      id: '7',
      name: 'Generator Maintenance',
      type: ExpenseType.recurring,
      amount: 3000,
      date: '2024-03-10'
    },
    {
      id: '8',
      name: 'Plumbing Work',
      type: ExpenseType.adHoc,
      amount: 7500,
      date: '2024-03-20'
    }
  ];

  static getExpenses(month: number, year: number): ExpenseDto[] {
    return this.mockExpenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() + 1 === month && expenseDate.getFullYear() === year;
    });
  }
}