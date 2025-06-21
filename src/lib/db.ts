import { PrismaClient } from '@prisma/client'

declare global {
  var prisma: PrismaClient | undefined
}

export const prisma = globalThis.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma
}

export async function connectDB() {
  try {
    await prisma.$connect()
    console.log('📊 MySQL Database connected successfully')
    return prisma
  } catch (error) {
    console.error('❌ Database connection error:', error)
    throw error
  }
}

export async function disconnectDB() {
  await prisma.$disconnect()
}

export default prisma
