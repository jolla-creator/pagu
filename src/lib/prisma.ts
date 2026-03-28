import { PrismaClient } from '@prisma/client'

let client: PrismaClient

if (process.env.NODE_ENV === 'production') {
  client = new PrismaClient()
} else {
  // Avoid creating many instances in development due to HMR
  if (!(global as any).prisma) {
    ;(global as any).prisma = new PrismaClient()
  }
  client = (global as any).prisma
}

export { client as prisma }
