import { prisma } from './utils/prisma'

/**
 * https://jestjs.io/docs/configuration#globalsetup-string
 */
export default async function setup(): Promise<void> {
  // Disconnect, as there might be unclosed connection from previous runs unclosed properly
  await prisma.$disconnect()
}
