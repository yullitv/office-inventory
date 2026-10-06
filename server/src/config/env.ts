import { existsSync } from 'node:fs';
import { z } from 'zod';

if (existsSync('.env')) {
  process.loadEnvFile();
}

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3000),
  DB_PATH: z.string().min(1).default('data/inventory.db'),
});

export const env = envSchema.parse(process.env);
