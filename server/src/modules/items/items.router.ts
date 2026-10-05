import { Router } from 'express';
import {
  createItemSchema,
  itemIdParamsSchema,
  listItemsQuerySchema,
  updateItemSchema,
} from './items.schemas.js';
import type { ItemsService } from './items.service.js';

export function createItemsRouter(service: ItemsService) {
  const router = Router();

  router.get('/', (req, res) => {
    const query = listItemsQuerySchema.parse(req.query);
    res.json(service.list(query));
  });

  router.get('/categories', (_req, res) => {
    res.json(service.listCategories());
  });

  router.get('/:id', (req, res) => {
    const { id } = itemIdParamsSchema.parse(req.params);
    res.json(service.getById(id));
  });

  router.post('/', (req, res) => {
    const input = createItemSchema.parse(req.body);
    res.status(201).json(service.create(input));
  });

  router.patch('/:id', (req, res) => {
    const { id } = itemIdParamsSchema.parse(req.params);
    const input = updateItemSchema.parse(req.body);
    res.json(service.update(id, input));
  });

  router.delete('/:id', (req, res) => {
    const { id } = itemIdParamsSchema.parse(req.params);
    service.remove(id);
    res.status(204).end();
  });

  return router;
}
