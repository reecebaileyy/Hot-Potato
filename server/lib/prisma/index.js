const { PrismaClient } = require('@prisma/client');

const globalForPrisma = globalThis.prisma === undefined ? {} : { prisma: globalThis.prisma };

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

module.exports = {
  prisma,
};
