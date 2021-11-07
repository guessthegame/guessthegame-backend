import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'

import { createTestApp } from '../utils/create-test-app'
import { newUser, newUserWithoutEmail } from '../utils/fixtures/user'
import { prisma } from '../utils/prisma'
import { User } from '.prisma/client'

describe('GET /auth/me', () => {
  let app: INestApplication

  beforeAll(async () => {
    app = await createTestApp()
  })

  afterAll(async () => {
    await app?.close()
  })

  function callApi(accessToken: string) {
    return request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .send()
  }

  async function createAndLogUser(userData: Pick<User, 'username' | 'passwordHash' | 'email'>) {
    const user = await prisma.user.create({ data: userData })

    // Log in the user
    const { body } = await request(app.getHttpServer())
      .post('/auth/tokens')
      .send({ username: user.username, password: 'password' })
      .expect(201)

    return { user, accessToken: body.accessToken }
  }

  it('should return logged user data', async () => {
    const { user, accessToken } = await createAndLogUser(newUser())

    await callApi(accessToken)
      .expect({
        uuid: user.uuid,
        username: user.username,
        email: user.email,
      })
      .expect(200)
  })

  it('should return logged user data (no email)', async () => {
    const { user, accessToken } = await createAndLogUser(newUserWithoutEmail())

    await callApi(accessToken)
      .expect({
        uuid: user.uuid,
        username: user.username,
        email: null,
      })
      .expect(200)
  })

  describe('deleted user', () => {
    it('should throw a 404', async () => {
      const { user, accessToken } = await createAndLogUser(newUser())

      // delete user
      await prisma.user.delete({ where: { id: user.id } })

      await callApi(accessToken).expect({ statusCode: 404, message: 'Not Found' }).expect(404)
    })
  })

  describe('With no auth', () => {
    it('should reject', async () => {
      await callApi('').expect(401)
    })
  })
})
