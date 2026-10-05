import { z } from 'zod';
import { ITEM_STATUSES } from '../items/items.types.js';

export const createLoanSchema = z.object({
  itemId: z.number().int().positive(),
  employeeId: z.number().int().positive(),
  dueDate: z.iso.date(),
  note: z
    .string()
    .trim()
    .max(500)
    .nullish()
    .transform((value) => value || null),
});

export const returnLoanSchema = z.object({
  itemStatus: z.enum(ITEM_STATUSES).default('available'),
  note: z
    .string()
    .trim()
    .max(500)
    .nullish()
    .transform((value) => value || null),
});

export const listLoansQuerySchema = z.object({
  itemId: z.coerce.number().int().positive().optional(),
  active: z.stringbool().optional(),
});

export const loanIdParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export type CreateLoanInput = z.infer<typeof createLoanSchema>;
export type ReturnLoanInput = z.infer<typeof returnLoanSchema>;
export type ListLoansQuery = z.infer<typeof listLoansQuerySchema>;
