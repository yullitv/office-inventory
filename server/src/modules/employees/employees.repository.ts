import type { Db } from '../../db/connection.js';

export type Employee = {
  id: number;
  fullName: string;
  email: string;
  department: string;
};

type EmployeeRow = {
  id: number;
  full_name: string;
  email: string;
  department: string;
};

function toEmployee(row: EmployeeRow): Employee {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    department: row.department,
  };
}

export function createEmployeesRepository(db: Db) {
  return {
    findAll(): Employee[] {
      const rows = db.prepare('SELECT * FROM employees').all() as EmployeeRow[];
      return rows.map(toEmployee).sort((a, b) => a.fullName.localeCompare(b.fullName, 'uk'));
    },

    findById(id: number): Employee | null {
      const row = db.prepare('SELECT * FROM employees WHERE id = ?').get(id) as
        EmployeeRow | undefined;
      return row ? toEmployee(row) : null;
    },
  };
}

export type EmployeesRepository = ReturnType<typeof createEmployeesRepository>;
