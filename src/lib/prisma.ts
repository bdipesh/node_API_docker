import { PrismaClient, Prisma } from '@prisma/client';

// Create a single PrismaClient instance for the whole app
// This avoids spawning multiple connections and makes error handling consistent
const prisma = new PrismaClient();

export type KnownPrismaInitError = InstanceType<typeof Prisma.PrismaClientInitializationError>;

export function isPrismaInitError(err: unknown): err is KnownPrismaInitError {
  return (
    !!err &&
    typeof err === 'object' &&
    // @ts-ignore access name if available
    (err as any).name === 'PrismaClientInitializationError'
  );
}

export default prisma;
