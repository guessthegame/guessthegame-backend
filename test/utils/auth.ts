import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import { v4 } from 'uuid'

import { prisma } from '../utils/prisma'
import { User } from '.prisma/client'

export async function createAndLogUser(
  app: INestApplication,
  userData?: Pick<User, 'username' | 'email'>
) {
  const user = await prisma.user.create({
    data: {
      username: userData?.username || v4(),
      email: userData?.email !== undefined ? userData.email : `${v4()}@email.com`,
      passwordHash: '$2a$08$7YAbrO83em590j7yyb6gWes.c.KBHOm8734eWBLOuFijTxxq6MlOe',
    },
  })

  // Log in the user
  const { body } = await request(app.getHttpServer())
    .post('/auth/tokens')
    .send({ username: user.username, password: 'password' })
    .expect(201)

  return { user, accessToken: body.accessToken }
}
