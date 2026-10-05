import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from './endpoints';
import type { ItemFilters, ItemInput, LoanInput, ReturnInput } from './types';

export const queryKeys = {
  dashboard: ['dashboard'] as const,
  items: ['items'] as const,
  itemList: (filters: ItemFilters) => ['items', 'list', filters] as const,
  item: (id: number) => ['items', 'detail', id] as const,
  categories: ['items', 'categories'] as const,
  loans: ['loans'] as const,
  loanList: (filters: { itemId?: number; active?: boolean }) => ['loans', filters] as const,
  employees: ['employees'] as const,
};

export const useDashboard = () =>
  useQuery({ queryKey: queryKeys.dashboard, queryFn: api.getDashboard });

export const useItems = (filters: ItemFilters) =>
  useQuery({ queryKey: queryKeys.itemList(filters), queryFn: () => api.getItems(filters) });

export const useItem = (id: number) =>
  useQuery({ queryKey: queryKeys.item(id), queryFn: () => api.getItem(id) });

export const useCategories = () =>
  useQuery({ queryKey: queryKeys.categories, queryFn: api.getCategories });

export const useEmployees = () =>
  useQuery({ queryKey: queryKeys.employees, queryFn: api.getEmployees });

export const useLoans = (filters: { itemId?: number; active?: boolean }) =>
  useQuery({ queryKey: queryKeys.loanList(filters), queryFn: () => api.getLoans(filters) });

function useInvalidateInventory() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.items }),
      queryClient.invalidateQueries({ queryKey: queryKeys.loans }),
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard }),
    ]);
}

export function useCreateItem() {
  const invalidate = useInvalidateInventory();
  return useMutation({
    mutationFn: (input: ItemInput) => api.createItem(input),
    onSuccess: invalidate,
  });
}

export function useUpdateItem(id: number) {
  const invalidate = useInvalidateInventory();
  return useMutation({
    mutationFn: (input: Partial<ItemInput>) => api.updateItem(id, input),
    onSuccess: invalidate,
  });
}

export function useDeleteItem() {
  const invalidate = useInvalidateInventory();
  return useMutation({
    mutationFn: (id: number) => api.deleteItem(id),
    onSuccess: invalidate,
  });
}

export function useIssueLoan() {
  const invalidate = useInvalidateInventory();
  return useMutation({
    mutationFn: (input: LoanInput) => api.issueLoan(input),
    onSuccess: invalidate,
  });
}

export function useReturnLoan(id: number) {
  const invalidate = useInvalidateInventory();
  return useMutation({
    mutationFn: (input: ReturnInput) => api.returnLoan(id, input),
    onSuccess: invalidate,
  });
}
