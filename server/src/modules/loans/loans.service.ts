import { AppError } from '../../errors/AppError.js';
import { toDateOnly } from '../../utils/date.js';
import type { EmployeesRepository } from '../employees/employees.repository.js';
import type { ItemsRepository } from '../items/items.repository.js';
import type { LoanRecord, LoansRepository } from './loans.repository.js';
import type { CreateLoanInput, ListLoansQuery, ReturnLoanInput } from './loans.schemas.js';
import type { Loan } from './loans.types.js';

export function isOverdue(loan: Pick<LoanRecord, 'dueDate' | 'returnedAt'>, today: string) {
  return loan.returnedAt === null && loan.dueDate < today;
}

type LoansServiceDeps = {
  loansRepository: LoansRepository;
  itemsRepository: ItemsRepository;
  employeesRepository: EmployeesRepository;
  today?: () => string;
};

export function createLoansService({
  loansRepository,
  itemsRepository,
  employeesRepository,
  today = () => toDateOnly(new Date()),
}: LoansServiceDeps) {
  function toLoan(record: LoanRecord): Loan {
    return { ...record, isOverdue: isOverdue(record, today()) };
  }

  function getOrThrow(id: number): Loan {
    const record = loansRepository.findById(id);
    if (!record) {
      throw new AppError(404, 'LOAN_NOT_FOUND', `Loan ${id} not found`);
    }
    return toLoan(record);
  }

  return {
    list(query: ListLoansQuery): Loan[] {
      return loansRepository.findMany(query).map(toLoan);
    },

    issue(input: CreateLoanInput): Loan {
      const item = itemsRepository.findById(input.itemId);
      if (!item) {
        throw new AppError(404, 'ITEM_NOT_FOUND', `Item ${input.itemId} not found`);
      }
      if (!employeesRepository.findById(input.employeeId)) {
        throw new AppError(404, 'EMPLOYEE_NOT_FOUND', `Employee ${input.employeeId} not found`);
      }
      if (item.currentLoan) {
        throw new AppError(
          409,
          'ITEM_ALREADY_ON_LOAN',
          `Item is already on loan to ${item.currentLoan.employeeName}`,
        );
      }
      if (item.status !== 'available') {
        throw new AppError(409, 'ITEM_NOT_AVAILABLE', `Item cannot be issued: ${item.status}`);
      }
      if (input.dueDate < today()) {
        throw new AppError(400, 'DUE_DATE_IN_PAST', 'Due date cannot be in the past');
      }

      const id = loansRepository.create(input);
      return getOrThrow(id);
    },

    return(id: number, input: ReturnLoanInput): Loan {
      const loan = getOrThrow(id);
      if (loan.returnedAt) {
        throw new AppError(409, 'LOAN_ALREADY_RETURNED', 'Loan is already returned');
      }

      loansRepository.markReturned(loan, input.itemStatus, input.note);
      return getOrThrow(id);
    },
  };
}

export type LoansService = ReturnType<typeof createLoansService>;
