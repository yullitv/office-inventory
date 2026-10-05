import { z } from 'zod';
import { ITEM_STATES, ITEM_STATUSES } from './items.types.js';

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .nullish()
    .transform((value) => (value === '' ? null : value));

const itemFields = {
  name: z.string().trim().min(1).max(100),
  category: z.string().trim().min(1).max(50),
  inventoryNumber: optionalText(30),
  description: optionalText(500),
  status: z.enum(ITEM_STATUSES),
};

export const createItemSchema = z.object({
  ...itemFields,
  status: itemFields.status.default('available'),
});

export const updateItemSchema = z
  .object(itemFields)
  .partial()
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: 'At least one field is required',
  });

export const listItemsQuerySchema = z.object({
  q: z.string().trim().optional(),
  category: z.string().trim().optional(),
  state: z.enum(ITEM_STATES).optional(),
});

export const itemIdParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export type CreateItemInput = z.infer<typeof createItemSchema>;
export type UpdateItemInput = z.infer<typeof updateItemSchema>;
export type ListItemsQuery = z.infer<typeof listItemsQuerySchema>;
