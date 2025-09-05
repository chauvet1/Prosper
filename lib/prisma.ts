import { PrismaClient } from '@prisma/client'
import { withAccelerate } from '@prisma/extension-accelerate'

// Global variable to store the Prisma client instance
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Create Prisma client with Accelerate extension
export const prisma = globalForPrisma.prisma ?? 
  new PrismaClient({
    log: ['query'],
  }).$extends(withAccelerate())

// Prevent multiple instances in development
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
