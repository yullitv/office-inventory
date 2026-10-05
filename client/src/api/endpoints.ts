import { http, toQueryString } from './http';
import type {
  Dashboard,
  Employee,
  Item,
  ItemFilters,
  ItemInput,
  Loan,
  LoanInput,
  ReturnInput,
} from './types';

export const api = {
  getDashboard: () => http<Dashboard>('/dashboard'),

  getItems: (filters: ItemFilters) => http<Item[]>(`/items${toQueryString(filters)}`),
  getItem: (id: number) => http<Item>(`/items/${id}`),
  getCategories: () => http<string[]>('/items/categories'),
  createItem: (input: ItemInput) =>
    http<Item>('/items', { method: 'POST', body: JSON.stringify(input) }),
  updateItem: (id: number, input: Partial<ItemInput>) =>
    http<Item>(`/items/${id}`, { method: 'PATCH', body: JSON.stringify(input) }),
  deleteItem: (id: number) => http<void>(`/items/${id}`, { method: 'DELETE' }),

  getEmployees: () => http<Employee[]>('/employees'),

  getLoans: (filters: { itemId?: number; active?: boolean }) =>
    http<Loan[]>(
      `/loans${toQueryString({ itemId: filters.itemId, active: filters.active?.toString() })}`,
    ),
  issueLoan: (input: LoanInput) =>
    http<Loan>('/loans', { method: 'POST', body: JSON.stringify(input) }),
  returnLoan: (id: number, input: ReturnInput) =>
    http<Loan>(`/loans/${id}/return`, { method: 'POST', body: JSON.stringify(input) }),
};
