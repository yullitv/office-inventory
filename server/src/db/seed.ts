import { env } from '../config/env.js';
import { addDays, toDateOnly } from '../utils/date.js';
import { createDatabase } from './connection.js';
import { transaction } from './transaction.js';

type SeedItem = {
  name: string;
  category: string;
  inventoryNumber: string;
  description: string | null;
  status: 'available' | 'in_repair' | 'lost';
};

type SeedLoan = {
  item: string;
  employee: number;
  issuedDaysAgo: number;
  dueInDays: number;
  returnedDaysAgo?: number;
  note?: string;
};

const employees = [
  { fullName: 'Олена Коваленко', email: 'o.kovalenko@example.com', department: 'Маркетинг' },
  { fullName: 'Андрій Шевченко', email: 'a.shevchenko@example.com', department: 'Розробка' },
  { fullName: 'Марія Бондаренко', email: 'm.bondarenko@example.com', department: 'Дизайн' },
  { fullName: 'Дмитро Ткаченко', email: 'd.tkachenko@example.com', department: 'Розробка' },
  { fullName: 'Ірина Кравченко', email: 'i.kravchenko@example.com', department: 'HR' },
  { fullName: 'Олег Мельник', email: 'o.melnyk@example.com', department: 'Продажі' },
  { fullName: 'Наталія Олійник', email: 'n.oliinyk@example.com', department: 'Бухгалтерія' },
  { fullName: 'Сергій Поліщук', email: 's.polishchuk@example.com', department: 'Розробка' },
  { fullName: 'Анна Лисенко', email: 'a.lysenko@example.com', department: 'Маркетинг' },
  { fullName: 'Максим Руденко', email: 'm.rudenko@example.com', department: 'Продажі' },
  { fullName: 'Катерина Савченко', email: 'k.savchenko@example.com', department: 'Дизайн' },
  { fullName: 'Віктор Мороз', email: 'v.moroz@example.com', department: 'Адміністрація' },
];

const items: SeedItem[] = [
  {
    name: 'MacBook Pro 14" M3',
    category: 'Ноутбуки',
    inventoryNumber: 'LT-001',
    description: '16 GB RAM, 512 GB SSD',
    status: 'available',
  },
  {
    name: 'MacBook Air 13" M2',
    category: 'Ноутбуки',
    inventoryNumber: 'LT-002',
    description: null,
    status: 'available',
  },
  {
    name: 'Lenovo ThinkPad T14',
    category: 'Ноутбуки',
    inventoryNumber: 'LT-003',
    description: 'Не тримає заряд батарея',
    status: 'in_repair',
  },
  {
    name: 'Dell Latitude 5440',
    category: 'Ноутбуки',
    inventoryNumber: 'LT-004',
    description: null,
    status: 'available',
  },
  {
    name: 'Epson EB-W51',
    category: 'Проєктори',
    inventoryNumber: 'PR-001',
    description: 'Пульт і HDMI-кабель у чохлі',
    status: 'available',
  },
  {
    name: 'Sony ZV-E10',
    category: 'Камери',
    inventoryNumber: 'CM-001',
    description: 'Обʼєктив 16–50 мм',
    status: 'available',
  },
  {
    name: 'GoPro HERO12',
    category: 'Камери',
    inventoryNumber: 'CM-002',
    description: null,
    status: 'lost',
  },
  {
    name: 'Xiaomi Power Bank 20000',
    category: 'Павербанки',
    inventoryNumber: 'PB-001',
    description: null,
    status: 'available',
  },
  {
    name: 'Anker PowerCore 10000',
    category: 'Павербанки',
    inventoryNumber: 'PB-002',
    description: null,
    status: 'available',
  },
  {
    name: 'Baseus 30000',
    category: 'Павербанки',
    inventoryNumber: 'PB-003',
    description: null,
    status: 'available',
  },
  {
    name: 'Каркасон',
    category: 'Настільні ігри',
    inventoryNumber: 'BG-001',
    description: null,
    status: 'available',
  },
  {
    name: 'Кодові імена',
    category: 'Настільні ігри',
    inventoryNumber: 'BG-002',
    description: null,
    status: 'available',
  },
  {
    name: 'Монополія',
    category: 'Настільні ігри',
    inventoryNumber: 'BG-003',
    description: 'Бракує двох фішок',
    status: 'available',
  },
  {
    name: 'Парасоля чорна',
    category: 'Парасолі',
    inventoryNumber: 'UM-001',
    description: null,
    status: 'available',
  },
  {
    name: 'Парасоля жовта',
    category: 'Парасолі',
    inventoryNumber: 'UM-002',
    description: null,
    status: 'available',
  },
];

const loans: SeedLoan[] = [
  { item: 'LT-001', employee: 0, issuedDaysAgo: 3, dueInDays: 4 },
  { item: 'PR-001', employee: 1, issuedDaysAgo: 1, dueInDays: 0 },
  { item: 'PB-001', employee: 2, issuedDaysAgo: 10, dueInDays: -3 },
  { item: 'BG-001', employee: 3, issuedDaysAgo: 6, dueInDays: -1 },
  { item: 'UM-001', employee: 4, issuedDaysAgo: 0, dueInDays: 1 },
  { item: 'LT-001', employee: 5, issuedDaysAgo: 20, dueInDays: -14, returnedDaysAgo: 15 },
  { item: 'CM-001', employee: 6, issuedDaysAgo: 12, dueInDays: -9, returnedDaysAgo: 8 },
  {
    item: 'LT-003',
    employee: 1,
    issuedDaysAgo: 9,
    dueInDays: -5,
    returnedDaysAgo: 5,
    note: 'Повернуто з несправною батареєю',
  },
  { item: 'CM-002', employee: 7, issuedDaysAgo: 30, dueInDays: -25, returnedDaysAgo: 25 },
];

const db = createDatabase(env.DB_PATH);
const now = new Date();
const daysAgoIso = (days: number) => addDays(now, -days).toISOString();
const dueIn = (days: number) => toDateOnly(addDays(now, days));

transaction(db, () => {
  db.exec('DELETE FROM loans; DELETE FROM items; DELETE FROM employees;');

  const insertEmployee = db.prepare(
    'INSERT INTO employees (full_name, email, department) VALUES (?, ?, ?)',
  );
  const employeeIds = employees.map((employee) =>
    Number(
      insertEmployee.run(employee.fullName, employee.email, employee.department).lastInsertRowid,
    ),
  );

  const insertItem = db.prepare(
    `INSERT INTO items (name, category, inventory_number, description, status)
     VALUES (@name, @category, @inventoryNumber, @description, @status)`,
  );
  const itemIds = new Map(
    items.map((item) => [item.inventoryNumber, Number(insertItem.run(item).lastInsertRowid)]),
  );

  const insertLoan = db.prepare(
    `INSERT INTO loans (item_id, employee_id, issued_at, due_date, returned_at, note)
     VALUES (?, ?, ?, ?, ?, ?)`,
  );
  for (const loan of loans) {
    const itemId = itemIds.get(loan.item);
    if (itemId === undefined) {
      throw new Error(`Seed loan references unknown item ${loan.item}`);
    }

    insertLoan.run(
      itemId,
      employeeIds[loan.employee],
      daysAgoIso(loan.issuedDaysAgo),
      dueIn(loan.dueInDays),
      loan.returnedDaysAgo === undefined ? null : daysAgoIso(loan.returnedDaysAgo),
      loan.note ?? null,
    );
  }
});

db.close();

console.log(`Seeded ${employees.length} employees, ${items.length} items, ${loans.length} loans`);
