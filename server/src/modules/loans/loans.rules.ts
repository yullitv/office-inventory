import { addDays, toDateOnly } from '../../utils/date.js';
import type { LoanRecord } from './loans.repository.js';

export const MAX_LOAN_DAYS = 365;

export function isOverdue(loan: Pick<LoanRecord, 'dueDate' | 'returnedAt'>, today: string) {
  return loan.returnedAt === null && loan.dueDate < today;
}

export function latestDueDate(today: string) {
  return toDateOnly(addDays(new Date(`${today}T00:00:00`), MAX_LOAN_DAYS));
}
