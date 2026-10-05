import { Router } from 'express';
import {
  createLoanSchema,
  listLoansQuerySchema,
  loanIdParamsSchema,
  returnLoanSchema,
} from './loans.schemas.js';
import type { LoansService } from './loans.service.js';

export function createLoansRouter(service: LoansService) {
  const router = Router();

  router.get('/', (req, res) => {
    const query = listLoansQuerySchema.parse(req.query);
    res.json(service.list(query));
  });

  router.post('/', (req, res) => {
    const input = createLoanSchema.parse(req.body);
    res.status(201).json(service.issue(input));
  });

  router.post('/:id/return', (req, res) => {
    const { id } = loanIdParamsSchema.parse(req.params);
    const input = returnLoanSchema.parse(req.body ?? {});
    res.json(service.return(id, input));
  });

  return router;
}
