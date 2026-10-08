import { PrismaClient } from '@prisma/client';

const globalDatabase = globalThis as unknown as { oneSecondDatabase?: PrismaClient };
// Catalogue handlers emit sanitized diagnostics; do not print raw Prisma errors.
export const db = globalDatabase.oneSecondDatabase ?? new PrismaClient({ log: [] });
if (process.env.NODE_ENV !== 'production') globalDatabase.oneSecondDatabase = db;
