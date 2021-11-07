import { prisma } from './utils/prisma'

/**
 * After all tests, disconnect prisma
 */
afterAll(async () => {
  await prisma.$disconnect()
})
