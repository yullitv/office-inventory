export const migrations: string[] = [
  `
  CREATE TABLE employees (
    id INTEGER PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    department TEXT NOT NULL
  );

  CREATE TABLE items (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    inventory_number TEXT UNIQUE,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'available'
      CHECK (status IN ('available', 'in_repair', 'lost')),
    archived_at TEXT,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
  );

  CREATE INDEX idx_items_category ON items (category);

  CREATE TABLE loans (
    id INTEGER PRIMARY KEY,
    item_id INTEGER NOT NULL REFERENCES items (id),
    employee_id INTEGER NOT NULL REFERENCES employees (id),
    issued_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    due_date TEXT NOT NULL,
    returned_at TEXT,
    note TEXT
  );

  CREATE INDEX idx_loans_item ON loans (item_id);
  CREATE UNIQUE INDEX idx_loans_one_active_per_item ON loans (item_id) WHERE returned_at IS NULL;
  `,
  `
  ALTER TABLE loans ADD COLUMN return_note TEXT;
  `,
];
