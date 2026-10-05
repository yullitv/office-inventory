import type { ItemState } from '../api/types';

export const itemStateLabels: Record<ItemState, string> = {
  available: 'Доступна',
  on_loan: 'На руках',
  in_repair: 'У ремонті',
  lost: 'Загублена',
};

export function isItemState(value: string | null): value is ItemState {
  return value !== null && Object.hasOwn(itemStateLabels, value);
}

export const itemStateColors: Record<ItemState, string> = {
  available: 'green',
  on_loan: 'blue',
  in_repair: 'orange',
  lost: 'gray',
};

export function todayDateOnly(): string {
  return dateFromToday(0);
}

export function formatDate(dateOnly: string): string {
  const [year, month, day] = dateOnly.split('-');
  return `${day}.${month}.${year}`;
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('uk-UA', { dateStyle: 'short', timeStyle: 'short' });
}

function daysBetween(from: string, to: string): number {
  return Math.round((Date.parse(to) - Date.parse(from)) / 86_400_000);
}

export function describeDueDate(dueDate: string): string {
  const days = daysBetween(todayDateOnly(), dueDate);
  if (days < 0) return `прострочено на ${-days} дн.`;
  if (days === 0) return 'сьогодні';
  if (days === 1) return 'завтра';
  return `через ${days} дн.`;
}

export function dateFromToday(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}
