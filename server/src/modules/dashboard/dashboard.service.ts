import { addDays, toDateOnly } from '../../utils/date.js';
import type { ItemsService } from '../items/items.service.js';
import type { ItemState } from '../items/items.types.js';
import type { LoansService } from '../loans/loans.service.js';

export function createDashboardService(itemsService: ItemsService, loansService: LoansService) {
  return {
    getSummary() {
      const tomorrow = toDateOnly(addDays(new Date(), 1));
      const items = itemsService.list({});
      const activeLoans = loansService.list({ active: true });

      const counts: Record<ItemState, number> = {
        available: 0,
        on_loan: 0,
        in_repair: 0,
        lost: 0,
      };
      items.forEach((item) => {
        counts[item.state] += 1;
      });

      return {
        counts: { total: items.length, ...counts },
        overdue: activeLoans.filter((loan) => loan.isOverdue),
        dueSoon: activeLoans.filter((loan) => !loan.isOverdue && loan.dueDate <= tomorrow),
        inRepair: items.filter((item) => item.status === 'in_repair'),
      };
    },
  };
}

export type DashboardService = ReturnType<typeof createDashboardService>;
