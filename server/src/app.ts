import express from 'express';
import type { Db } from './db/connection.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFoundHandler } from './middleware/notFound.js';
import { createItemsRepository } from './modules/items/items.repository.js';
import { createItemsRouter } from './modules/items/items.router.js';
import { createItemsService } from './modules/items/items.service.js';

export function createApp(db: Db) {
  const app = express();

  app.use(express.json());

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  const itemsService = createItemsService(createItemsRepository(db));
  app.use('/api/items', createItemsRouter(itemsService));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
