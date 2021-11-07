import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import { v4 } from 'uuid'

import { CreateTokenAuthControllerRequest } from '../../src/modules/auth/controllers/create-tokens.controller'
import { createTestApp } from '../utils/create-test-app'
import { newUnregisteredUser, newUser, newUserWithoutEmail } from '../utils/fixtures/user'
import { prisma } from '../utils/prisma'

describe('POST /auth/tokens', () => {
  let app: INestApplication

  beforeAll(async () => {
    app = await createTestApp()
  })

  afterAll(async () => {
    await app?.close()
  })

  function callApi(body: CreateTokenAuthControllerRequest) {
    return request(app.getHttpServer()).post('/auth/tokens').send(body)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function expectSuccess(response: any) {
    expect(response).toEqual({
      body: {
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
      },
      statusCode: 201,
    })

    const accessToken = response.body.accessToken
    const refreshToken = response.body.refreshToken

    await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .send()
      .expect(200)

    await request(app.getHttpServer()).put('/auth/tokens').send({ refreshToken }).expect(200)
  }

  function expect401(response: unknown) {
    expect(response).toEqual({
      body: {
        message: 'Unauthorized',
        statusCode: 401,
      },
      statusCode: 401,
    })
  }

  describe('Using username / password', () => {
    it('should return tokens if correct username/password combination', async () => {
      // Create user
      const user = newUserWithoutEmail()
      await prisma.user.create({ data: user })

      // Log the user
      const { statusCode, body } = await callApi({
        username: user.username,
        password: 'password',
      })

      // Should be successful
      await expectSuccess({ statusCode, body })
    })

    it('should return tokens if correct email/password combination', async () => {
      // Create user
      const user = newUser()
      await prisma.user.create({ data: user })

      // Log the user
      const { statusCode, body } = await callApi({
        username: user.email,
        password: 'password',
      })

      // Should be successful
      await expectSuccess({ statusCode, body })
    })

    it('should throw a 401 error if password is wrong', async () => {
      const user = newUser()
      await prisma.user.create({ data: user })

      const { statusCode, body } = await callApi({
        username: user.username,
        password: 'wrong-password',
      })

      expect401({ statusCode, body })
    })

    it('should throw if provided password is empty', async () => {
      const { statusCode, body } = await callApi({ username: v4(), password: '' })

      expect401({ statusCode, body })
    })

    it('should throw a 401 error if user has no password', async () => {
      const username = v4()
      await prisma.user.create({ data: { username } })

      const { statusCode, body } = await callApi({
        username,
        password: 'password',
      })

      expect401({ statusCode, body })
    })

    it('should throw a 401 error if user does not exist', async () => {
      const { statusCode, body } = await callApi({
        username: v4(),
        password: 'password',
      })

      expect401({ statusCode, body })
    })
  })

  describe('Using browserToken', () => {
    it('should return tokens if browserToken is valid', async () => {
      const user = newUnregisteredUser()
      await prisma.user.create({ data: user })

      // Log the user
      const { statusCode, body } = await callApi({
        browserToken: user.browserToken,
      })

      // Should be successful
      await expectSuccess({ statusCode, body })
    })
    it('should throw if browser token is invalid', async () => {
      const { statusCode, body } = await callApi({
        browserToken: v4(),
      })

      expect401({ statusCode, body })
    })
  })

  describe('Invalid body', () => {
    it('should throw if no username and no browser token is provided', async () => {
      const { statusCode, body } = await callApi({})

      expect401({ statusCode, body })
    })
  })
})
