import type { Db } from '../../db/connection.js';
import type { CreateItemInput, UpdateItemInput } from './items.schemas.js';
import type { Item, ItemStatus } from './items.types.js';

type ItemRow = {
  id: number;
  name: string;
  category: string;
  inventory_number: string | null;
  description: string | null;
  status: ItemStatus;
  created_at: string;
  updated_at: string;
  loan_id: number | null;
  employee_id: number | null;
  employee_name: string | null;
  issued_at: string | null;
  due_date: string | null;
};

const SELECT_ITEMS = `
  SELECT
    i.id, i.name, i.category, i.inventory_number, i.description, i.status,
    i.created_at, i.updated_at,
    l.id AS loan_id, l.employee_id, e.full_name AS employee_name, l.issued_at, l.due_date
  FROM items i
  LEFT JOIN loans l ON l.item_id = i.id AND l.returned_at IS NULL
  LEFT JOIN employees e ON e.id = l.employee_id
  WHERE i.archived_at IS NULL
`;

function toItem(row: ItemRow): Item {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    inventoryNumber: row.inventory_number,
    description: row.description,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    currentLoan:
      row.loan_id === null
        ? null
        : {
            id: row.loan_id,
            employeeId: row.employee_id!,
            employeeName: row.employee_name!,
            issuedAt: row.issued_at!,
            dueDate: row.due_date!,
          },
  };
}

export function createItemsRepository(db: Db) {
  return {
    findAll(): Item[] {
      const rows = db.prepare(SELECT_ITEMS).all() as ItemRow[];
      return rows.map(toItem);
    },

    findById(id: number): Item | null {
      const row = db.prepare(`${SELECT_ITEMS} AND i.id = ?`).get(id) as ItemRow | undefined;
      return row ? toItem(row) : null;
    },

    findCategories(): string[] {
      const rows = db
        .prepare('SELECT DISTINCT category FROM items WHERE archived_at IS NULL')
        .all() as { category: string }[];
      return rows.map((row) => row.category);
    },

    isInventoryNumberTaken(inventoryNumber: string, exceptId?: number): boolean {
      const row = db
        .prepare('SELECT id FROM items WHERE inventory_number = ? AND id != ?')
        .get(inventoryNumber, exceptId ?? 0);
      return row !== undefined;
    },

    create(input: CreateItemInput): number {
      const result = db
        .prepare(
          `INSERT INTO items (name, category, inventory_number, description, status)
           VALUES (?, ?, ?, ?, ?)`,
        )
        .run(
          input.name,
          input.category,
          input.inventoryNumber ?? null,
          input.description ?? null,
          input.status,
        );
      return Number(result.lastInsertRowid);
    },

    update(id: number, input: UpdateItemInput): void {
      const columns = {
        name: input.name,
        category: input.category,
        inventory_number: input.inventoryNumber,
        description: input.description,
        status: input.status,
      };
      const entries = Object.entries(columns).filter(([, value]) => value !== undefined);
      const assignments = entries.map(([column]) => `${column} = ?`).join(', ');
      const values = entries.map(([, value]) => value as string | null);

      db.prepare(
        `UPDATE items SET ${assignments}, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = ?`,
      ).run(...values, id);
    },

    archive(id: number): void {
      db.prepare(
        `UPDATE items SET archived_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = ?`,
      ).run(id);
    },
  };
}

export type ItemsRepository = ReturnType<typeof createItemsRepository>;
