import { PrismaClient, UserRoleEnum } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Seed Database: create admin
 */
export async function main(): Promise<void> {
  /**
   * Create admin users
   */
  await prisma.user.upsert({
    where: {
      username: 'polo',
    },
    update: {},
    create: {
      username: 'polo',
      email: 'dev@guess-the-game.com',
      roles: [UserRoleEnum.Admin],
      passwordHash: '$2a$08$7YAbrO83em590j7yyb6gWes.c.KBHOm8734eWBLOuFijTxxq6MlOe',
    },
  })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
