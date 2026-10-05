export type OperationType = 'income' | 'expense';

export interface Operation {
  id: string;
  date: string; // ISO yyyy-mm-dd
  type: OperationType;
  amount: number;
  category: string;
  comment?: string;
}

export interface AppSettings {
  initial_balance: number;
  use_initial_balance: boolean;
}

export type PeriodType =
  | 'today'
  | 'week'
  | 'month'
  | 'lastMonth'
  | 'year'
  | 'custom';

export interface PeriodRange {
  start: string; // yyyy-mm-dd
  end: string; // yyyy-mm-dd
}
