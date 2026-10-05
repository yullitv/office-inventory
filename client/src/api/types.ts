export type ItemStatus = 'available' | 'in_repair' | 'lost';
export type ItemState = ItemStatus | 'on_loan';

export type CurrentLoan = {
  id: number;
  employeeId: number;
  employeeName: string;
  issuedAt: string;
  dueDate: string;
  isOverdue: boolean;
};

export type Item = {
  id: number;
  name: string;
  category: string;
  inventoryNumber: string | null;
  description: string | null;
  status: ItemStatus;
  state: ItemState;
  createdAt: string;
  updatedAt: string;
  currentLoan: CurrentLoan | null;
};

export type ItemInput = {
  name: string;
  category: string;
  inventoryNumber: string | null;
  description: string | null;
  status: ItemStatus;
};

export type ItemFilters = {
  q?: string;
  category?: string;
  state?: ItemState;
};

export type Employee = {
  id: number;
  fullName: string;
  email: string;
  department: string;
};

export type Loan = {
  id: number;
  itemId: number;
  itemName: string;
  inventoryNumber: string | null;
  employeeId: number;
  employeeName: string;
  issuedAt: string;
  dueDate: string;
  returnedAt: string | null;
  note: string | null;
  returnNote: string | null;
  isOverdue: boolean;
};

export type LoanInput = {
  itemId: number;
  employeeId: number;
  dueDate: string;
  note: string | null;
};

export type ReturnInput = {
  itemStatus: ItemStatus;
  note: string | null;
};

export type Dashboard = {
  counts: Record<ItemState, number> & { total: number };
  overdue: Loan[];
  dueSoon: Loan[];
  inRepair: Item[];
};
