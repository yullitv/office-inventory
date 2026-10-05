import type { Db } from '../../db/connection.js';
import { transaction } from '../../db/transaction.js';
import type { ItemStatus } from '../items/items.types.js';
import type { CreateLoanInput, ListLoansQuery } from './loans.schemas.js';

export type LoanRecord = {
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
};

type LoanRow = {
  id: number;
  item_id: number;
  item_name: string;
  inventory_number: string | null;
  employee_id: number;
  employee_name: string;
  issued_at: string;
  due_date: string;
  returned_at: string | null;
  note: string | null;
};

const SELECT_LOANS = `
  SELECT
    l.id, l.item_id, i.name AS item_name, i.inventory_number,
    l.employee_id, e.full_name AS employee_name,
    l.issued_at, l.due_date, l.returned_at, l.note
  FROM loans l
  JOIN items i ON i.id = l.item_id
  JOIN employees e ON e.id = l.employee_id
`;

function toLoanRecord(row: LoanRow): LoanRecord {
  return {
    id: row.id,
    itemId: row.item_id,
    itemName: row.item_name,
    inventoryNumber: row.inventory_number,
    employeeId: row.employee_id,
    employeeName: row.employee_name,
    issuedAt: row.issued_at,
    dueDate: row.due_date,
    returnedAt: row.returned_at,
    note: row.note,
  };
}

export function createLoansRepository(db: Db) {
  return {
    findMany(filters: ListLoansQuery): LoanRecord[] {
      const conditions: string[] = [];
      const params: number[] = [];

      if (filters.itemId !== undefined) {
        conditions.push('l.item_id = ?');
        params.push(filters.itemId);
      }
      if (filters.active !== undefined) {
        conditions.push(filters.active ? 'l.returned_at IS NULL' : 'l.returned_at IS NOT NULL');
      }

      const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
      const orderBy = filters.active ? 'l.due_date ASC' : 'l.issued_at DESC';
      const rows = db
        .prepare(`${SELECT_LOANS} ${where} ORDER BY ${orderBy}`)
        .all(...params) as LoanRow[];

      return rows.map(toLoanRecord);
    },

    findById(id: number): LoanRecord | null {
      const row = db.prepare(`${SELECT_LOANS} WHERE l.id = ?`).get(id) as LoanRow | undefined;
      return row ? toLoanRecord(row) : null;
    },

    create(input: CreateLoanInput): number {
      const result = db
        .prepare('INSERT INTO loans (item_id, employee_id, due_date, note) VALUES (?, ?, ?, ?)')
        .run(input.itemId, input.employeeId, input.dueDate, input.note);
      return Number(result.lastInsertRowid);
    },

    markReturned(loan: LoanRecord, itemStatus: ItemStatus, note: string | null): void {
      transaction(db, () => {
        db.prepare(
          `UPDATE loans
           SET returned_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), note = COALESCE(?, note)
           WHERE id = ?`,
        ).run(note, loan.id);
        db.prepare(
          `UPDATE items
           SET status = ?, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
           WHERE id = ?`,
        ).run(itemStatus, loan.itemId);
      });
    },
  };
}

export type LoansRepository = ReturnType<typeof createLoansRepository>;
