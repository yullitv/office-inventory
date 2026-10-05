import { createApp } from '../src/app.js';
import { createDatabase } from '../src/db/connection.js';
import { addDays, toDateOnly } from '../src/utils/date.js';

export function createTestApp() {
  const db = createDatabase(':memory:');
  const { lastInsertRowid } = db
    .prepare('INSERT INTO employees (full_name, email, department) VALUES (?, ?, ?)')
    .run('Test User', 'test@example.com', 'QA');

  return { app: createApp(db), employeeId: Number(lastInsertRowid) };
}

export function dateFromToday(days: number) {
  return toDateOnly(addDays(new Date(), days));
}
