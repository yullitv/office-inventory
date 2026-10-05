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
  isOverdue: boolean;
};
