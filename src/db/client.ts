import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@/generated/prisma/client'

// ב-dev, Next.js מרענן מודולים בכל שינוי קוד. בלי מטמון גלובלי כאן, כל ריענון
// היה פותח PrismaClient (וחיבור pool) חדש, עד לדלדול חיבורי ה-pooler של Supabase.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
