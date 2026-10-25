import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

// Agregamos prisma al objeto global en desarrollo para prevenir múltiples instancias debido a recargas en caliente.
declare global {
  var prisma: PrismaClient | undefined;
}

const prismaClientSingleton = () => {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is not defined in environment variables. Please check your .env file.');
  }
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
};

export const prisma = global.prisma || prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}
