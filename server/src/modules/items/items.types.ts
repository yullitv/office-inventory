export const ITEM_STATUSES = ['available', 'in_repair', 'lost'] as const;
export type ItemStatus = (typeof ITEM_STATUSES)[number];

export const ITEM_STATES = ['available', 'on_loan', 'in_repair', 'lost'] as const;
export type ItemState = (typeof ITEM_STATES)[number];

export type CurrentLoan = {
  id: number;
  employeeId: number;
  employeeName: string;
  issuedAt: string;
  dueDate: string;
};

export type Item = {
  id: number;
  name: string;
  category: string;
  inventoryNumber: string | null;
  description: string | null;
  status: ItemStatus;
  createdAt: string;
  updatedAt: string;
  currentLoan: CurrentLoan | null;
};
