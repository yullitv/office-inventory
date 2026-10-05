import { Router } from 'express';
import type { DashboardService } from './dashboard.service.js';

export function createDashboardRouter(service: DashboardService) {
  const router = Router();

  router.get('/', (_req, res) => {
    res.json(service.getSummary());
  });

  return router;
}
