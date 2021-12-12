import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'

import { GetUnsolvedScreenshotControllerRequest } from '../../../../src/modules/clients/play/controllers/get-unsolved-screenshot.controller'
import { createAndLogUser } from '../../../utils/auth'
import { createTestApp } from '../../../utils/create-test-app'
import { newImage } from '../../../utils/fixtures/image'
import { newScreenshot, newValidatedScreenshot } from '../../../utils/fixtures/screenshot'
import { newUser } from '../../../utils/fixtures/user'
import { prisma } from '../../../utils/prisma'

describe('POST /frontend/play/get-unsolved-screenshot', () => {
  let token: string
  let app: INestApplication

  beforeAll(async () => {
    app = await createTestApp()
    const { accessToken } = await createAndLogUser(app)
    token = accessToken
  })

  afterAll(async () => {
    await app?.close()
  })

  describe('Unauthenticated', () => {
    function callApi(body: GetUnsolvedScreenshotControllerRequest) {
      return request(app.getHttpServer())
        .post('/frontend/play/unsolved-screenshot-unauthenticated')
        .send(body)
    }

    it('should return a radom unseen screenshot', async () => {
      await prisma.screenshot.create({
        data: {
          ...newValidatedScreenshot(),
          addedBy: { create: newUser() },
          image: { create: newImage() },
        },
      })
      const unvalidatedScreenshot = await prisma.screenshot.create({
        data: {
          ...newScreenshot(),
          addedBy: { create: newUser() },
          image: { create: newImage() },
        },
      })

      const { body, statusCode } = await callApi({ exclude: [] })

      expect({ body, statusCode }).toEqual({
        statusCode: 201,
        body: { id: expect.any(Number) },
      })
      expect(body.id).not.toEqual(unvalidatedScreenshot.id)
    })

    it('should exclude given ids', async () => {
      await prisma.screenshot.create({
        data: {
          ...newValidatedScreenshot(),
          addedBy: { create: newUser() },
          image: { create: newImage() },
        },
      })
      const unsolvedScreenshot = await prisma.screenshot.create({
        data: {
          ...newValidatedScreenshot(),
          addedBy: { create: newUser() },
          image: { create: newImage() },
        },
      })

      const exclusions = await prisma.screenshot.findMany({
        where: {
          NOT: { id: unsolvedScreenshot.id },
        },
        select: { id: true },
      })

      const { body, statusCode } = await callApi({ exclude: exclusions.map(({ id }) => id) })

      expect({ body, statusCode }).toEqual({
        statusCode: 201,
        body: { id: expect.any(Number) },
      })
      expect(body.id).toEqual(unsolvedScreenshot.id)
    })
  })

  describe('Authenticated', () => {
    function callApi(body: GetUnsolvedScreenshotControllerRequest) {
      return request(app.getHttpServer())
        .post('/frontend/play/unsolved-screenshot-authenticated')
        .set('Authorization', `Bearer ${token}`)
        .send(body)
    }

    it('should return a radom unsolved screenshot', async () => {
      await prisma.screenshot.create({
        data: {
          ...newValidatedScreenshot(),
          addedBy: { create: newUser() },
          image: { create: newImage() },
        },
      })
      const unvalidatedScreenshot = await prisma.screenshot.create({
        data: {
          ...newScreenshot(),
          addedBy: { create: newUser() },
          image: { create: newImage() },
        },
      })

      const { body, statusCode } = await callApi({ exclude: [] })

      expect({ body, statusCode }).toEqual({
        statusCode: 201,
        body: { id: expect.any(Number) },
      })
      expect(body.id).not.toEqual(unvalidatedScreenshot.id)
    })

    it('should reject if not logged in', async () => {
      const { body, statusCode } = await request(app.getHttpServer())
        .post('/frontend/play/unsolved-screenshot-authenticated')
        .send({})

      expect({ body, statusCode }).toEqual({
        body: {
          message: 'Unauthorized',
          statusCode: 401,
        },
        statusCode: 401,
      })
    })
  })
})
