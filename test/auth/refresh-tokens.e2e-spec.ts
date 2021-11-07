import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import { v4 } from 'uuid'

import { RefreshTokenAuthControllerRequest } from '../../src/modules/auth/controllers/refresh-token.controller'
import { createTestApp } from '../utils/create-test-app'
import { newUser } from '../utils/fixtures/user'
import { prisma } from '../utils/prisma'

describe('PUT /auth/tokens', () => {
  let app: INestApplication

  beforeAll(async () => {
    app = await createTestApp()
  })

  afterAll(async () => {
    await app?.close()
  })

  function callApi(body: RefreshTokenAuthControllerRequest) {
    return request(app.getHttpServer()).put('/auth/tokens').send(body)
  }

  describe('with existing customer user', () => {
    it('should refresh the token and delete the old one', async () => {
      // Get a first refresh token
      const user = await prisma.user.create({ data: newUser() })
      const oldRefreshToken = await prisma.userRefreshToken.create({
        data: {
          token: v4(),
          userId: user.id,
          expirationDate: new Date(Date.now() + 99000),
        },
      })

      // Refresh the token
      const { body } = await callApi({ refreshToken: oldRefreshToken.token }).expect(200)

      const refreshToken = await prisma.userRefreshToken.findFirst({
        where: { userId: user.id },
        select: { token: true, creationDate: true, expirationDate: true },
      })
      if (!refreshToken) {
        throw new Error('missing newRefreshToken')
      }
      expect(refreshToken.token).toEqual(body.refreshToken)
      expect(refreshToken.expirationDate.getTime()).toEqual(
        refreshToken.creationDate.getTime() + 30 * 24 * 3600 * 1000
      )

      // Old token should have been deleted
      expect(
        await prisma.userRefreshToken.findUnique({
          where: { token: oldRefreshToken.token },
        })
      ).toEqual(null)

      // We should be able to use new token to get new tokens
      await callApi({ refreshToken: refreshToken.token }).expect(200)

      // New refresh token should have been deleted
      expect(
        await prisma.userRefreshToken.findUnique({
          where: { token: refreshToken.token },
        })
      ).toEqual(null)
    })
  })

  describe('invalid refresh token', () => {
    it('does not exist', async () => {
      // Refresh the token
      await callApi({ refreshToken: v4() })
        .expect({ statusCode: 401, message: 'Unauthorized' })
        .expect(401)
    })
    it('expired token', async () => {
      const refreshToken = await prisma.userRefreshToken.create({
        data: {
          token: v4(),
          user: { create: newUser() },
          expirationDate: new Date(Date.now() - 1000000),
        },
      })

      // Refresh the token
      await callApi({ refreshToken: refreshToken.token })
        .expect({ statusCode: 401, message: 'Unauthorized' })
        .expect(401)
    })
  })
})
