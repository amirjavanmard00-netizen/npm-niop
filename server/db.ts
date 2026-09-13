import { PrismaClient } from '@prisma/client';

// Singleton instance to prevent multiple client connections in development
declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

export const prisma = global.__prisma || new PrismaClient({
  log: ['warn', 'error']
});

if (process.env.NODE_ENV !== 'production') {
  global.__prisma = prisma;
}

export async function logSystemEvent(
  level: 'info' | 'warn' | 'error',
  action: string,
  message: string,
  details?: Record<string, any> | string
) {
  try {
    await prisma.systemLog.create({
      data: {
        level,
        action,
        message,
        details: typeof details === 'object' ? JSON.stringify(details) : details || null
      }
    });
  } catch (err) {
    console.error(`[SystemLog failed] ${action}: ${message}`, err);
  }
}
