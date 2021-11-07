import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import { v4 } from 'uuid'

import { RegisterAuthControllerRequest } from '../../src/modules/auth/controllers/register.controller'
import { createTestApp } from '../utils/create-test-app'
import { newUnregisteredUser, newUser } from '../utils/fixtures/user'
import { prisma } from '../utils/prisma'

describe('POST /auth/register', () => {
  let app: INestApplication

  beforeAll(async () => {
    app = await createTestApp()
  })

  afterAll(async () => {
    await app?.close()
  })

  function callApi(body: RegisterAuthControllerRequest) {
    return request(app.getHttpServer()).post('/auth/register').send(body)
  }

  async function shouldBeSuccessful(req: RegisterAuthControllerRequest) {
    const { body, statusCode } = await callApi(req)
    expect({ body, statusCode }).toEqual({
      statusCode: 201,
      body: {
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
      },
    })

    return await prisma.user.findUnique({
      where: { username: req.username },
      select: { id: true, username: true, passwordHash: true, email: true, creationDate: true },
    })
  }

  describe('without browserToken', () => {
    it('should create the user', async () => {
      const username = v4()

      const user = await shouldBeSuccessful({
        username,
        password: 'password',
      })

      expect(user).toEqual({
        id: expect.any(Number),
        username,
        passwordHash: expect.any(String),
        email: null,
        creationDate: expect.any(Date),
      })
    })

    it('should create the user (with email)', async () => {
      const username = v4()
      const email = `${username}@email.com`

      const user = await shouldBeSuccessful({
        username,
        email,
        password: 'password',
      })

      expect(user).toEqual({
        id: expect.any(Number),
        username,
        email,
        passwordHash: expect.any(String),
        creationDate: expect.any(Date),
      })
    })
  })

  describe('with browserToken', () => {
    it('should update existing user', async () => {
      const user = await prisma.user.create({ data: newUnregisteredUser() })
      const username = v4()

      const registeredUser = await shouldBeSuccessful({
        username,
        password: 'password',
        browserToken: user.browserToken as string,
      })

      expect(registeredUser).toEqual({
        id: user.id,
        username,
        email: null,
        passwordHash: expect.any(String),
        creationDate: expect.any(Date),
      })
    })

    it('should update existing user (with email)', async () => {
      const user = await prisma.user.create({ data: newUnregisteredUser() })
      const username = v4()
      const email = `${username}@email.com`

      const registeredUser = await shouldBeSuccessful({
        username,
        email,
        password: 'password',
        browserToken: user.browserToken as string,
      })

      expect(registeredUser).toEqual({
        id: user.id,
        username,
        email,
        passwordHash: expect.any(String),
        creationDate: expect.any(Date),
      })
    })

    it('should throw a 404 if token does not match a user', async () => {
      const { statusCode, body } = await callApi({
        username: v4(),
        password: 'password',
        browserToken: v4(),
      })

      expect({ statusCode, body }).toEqual({
        statusCode: 404,
        body: {
          error: 'Not Found',
          message: 'BROWSER_TOKEN_MATCHES_NO_USER',
          statusCode: 404,
        },
      })
    })
  })

  describe('username taken', () => {
    it('should return a 401', async () => {
      const user = newUser()
      await prisma.user.create({ data: user })

      const { statusCode, body } = await callApi({
        username: user.username,
        password: 'password',
      })
      expect({ statusCode, body }).toEqual({
        statusCode: 400,
        body: {
          error: 'Bad Request',
          message: 'USERNAME_TAKEN',
          statusCode: 400,
        },
      })
    })

    it('should not matter if user if the one matching the browserToken', async () => {
      const user = { ...newUnregisteredUser(), username: v4() }
      await prisma.user.create({ data: user })

      await shouldBeSuccessful({
        username: user.username,
        browserToken: user.browserToken,
        password: 'password',
      })
    })
  })
})
