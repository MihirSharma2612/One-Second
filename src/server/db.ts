import { PrismaClient } from '@prisma/client';

const globalDatabase = globalThis as unknown as { oneSecondDatabase?: PrismaClient };
export const db = globalDatabase.oneSecondDatabase ?? new PrismaClient({ log: ['error'] });
if (process.env.NODE_ENV !== 'production') globalDatabase.oneSecondDatabase = db;
