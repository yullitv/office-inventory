import { Router } from 'express';
import type { EmployeesRepository } from './employees.repository.js';

export function createEmployeesRouter(repository: EmployeesRepository) {
  const router = Router();

  router.get('/', (_req, res) => {
    res.json(repository.findAll());
  });

  return router;
}
