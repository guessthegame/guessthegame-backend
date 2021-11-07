import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'

import { DeleteTokensAuthRequest } from '../../src/modules/auth/controllers/delete-tokens.controller'
import { createTestApp } from '../utils/create-test-app'
import { newUnregisteredUser } from '../utils/fixtures/user'
import { prisma } from '../utils/prisma'

describe('POST /auth/delete-tokens', () => {
  let app: INestApplication

  beforeAll(async () => {
    app = await createTestApp()
  })

  afterAll(async () => {
    await app?.close()
  })

  function callApi(accessToken: string, body: DeleteTokensAuthRequest) {
    return request(app.getHttpServer())
      .delete('/auth/tokens')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(body)
  }

  function login(browserToken: string) {
    return request(app.getHttpServer()).post('/auth/tokens').send({ browserToken })
  }

  it('should delete provided refresh token', async () => {
    const user = await prisma.user.create({ data: newUnregisteredUser() })

    // login
    const { body } = await login(user.browserToken as string)

    // User should have a refresh token
    const refreshTokens = await prisma.userRefreshToken.findMany({ where: { userId: user.id } })
    expect(refreshTokens.length).toEqual(1)

    // Log out
    await callApi(body.accessToken, { refreshToken: refreshTokens[0].token })

    // Refresh token should have been deleted
    const count = await prisma.userRefreshToken.count({ where: { userId: user.id } })
    expect(count).toEqual(0)
  })

  it('should not delete the token of another user', async () => {
    const user1 = await prisma.user.create({ data: newUnregisteredUser() })
    const user2 = await prisma.user.create({ data: newUnregisteredUser() })

    // login
    const { body: body1 } = await login(user1.browserToken as string)
    const { body: body2 } = await login(user2.browserToken as string)

    // Log out
    const { body: body3 } = await callApi(body1.accessToken, { refreshToken: body2.refreshToken })
    expect(body3).toEqual({ success: false })

    // Both tokens should still be there
    const count = await prisma.userRefreshToken.count({ where: { userId: user1.id } })
    expect(count).toEqual(1)
    const count2 = await prisma.userRefreshToken.count({ where: { userId: user2.id } })
    expect(count2).toEqual(1)
  })
})
