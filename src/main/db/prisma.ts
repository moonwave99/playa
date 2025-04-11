/* eslint-disable @typescript-eslint/no-explicit-any */
import { PrismaClient } from '@prisma/client-generated';

function getPrisma() {
  return typeof window === 'undefined' ? new PrismaClient() : null;
}

const prisma = (global as any).prisma || getPrisma();

if (process.env.NODE_ENV === 'development') {
  (global as any).prisma = prisma;
}

export default prisma;