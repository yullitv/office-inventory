import type { LoanRecord } from './loans.repository.js';

export function isOverdue(loan: Pick<LoanRecord, 'dueDate' | 'returnedAt'>, today: string) {
  return loan.returnedAt === null && loan.dueDate < today;
}
