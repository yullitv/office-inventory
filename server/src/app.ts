import express from 'express';
import type { Db } from './db/connection.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFoundHandler } from './middleware/notFound.js';
import { createDashboardRouter } from './modules/dashboard/dashboard.router.js';
import { createDashboardService } from './modules/dashboard/dashboard.service.js';
import { createEmployeesRepository } from './modules/employees/employees.repository.js';
import { createEmployeesRouter } from './modules/employees/employees.router.js';
import { createItemsRepository } from './modules/items/items.repository.js';
import { createItemsRouter } from './modules/items/items.router.js';
import { createItemsService } from './modules/items/items.service.js';
import { createLoansRepository } from './modules/loans/loans.repository.js';
import { createLoansRouter } from './modules/loans/loans.router.js';
import { createLoansService } from './modules/loans/loans.service.js';

export function createApp(db: Db) {
  const app = express();

  app.disable('x-powered-by');

  app.use(express.json());

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  const itemsRepository = createItemsRepository(db);
  const employeesRepository = createEmployeesRepository(db);
  const loansRepository = createLoansRepository(db);

  const itemsService = createItemsService(itemsRepository);
  const loansService = createLoansService({
    loansRepository,
    itemsRepository,
    employeesRepository,
  });
  const dashboardService = createDashboardService(itemsService, loansService);

  app.use('/api/items', createItemsRouter(itemsService));
  app.use('/api/employees', createEmployeesRouter(employeesRepository));
  app.use('/api/loans', createLoansRouter(loansService));
  app.use('/api/dashboard', createDashboardRouter(dashboardService));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
