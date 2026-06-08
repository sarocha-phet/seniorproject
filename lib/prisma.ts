// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query'], // เอาไว้ดู Log SQL เวลาทำงาน (เอาออกได้ถ้ารำคาญ)
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma