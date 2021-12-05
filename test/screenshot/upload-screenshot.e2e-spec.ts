import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import { v4 } from 'uuid'

import { UploadScreenshotControllerRequest } from '../../src/modules/screenshots/controllers/upload-screenshot.controller'
import { createAndLogUser } from '../utils/auth'
import { createTestApp } from '../utils/create-test-app'
import { prisma } from '../utils/prisma'
import { User } from '.prisma/client'

describe('POST /auth/register', () => {
  let uploader: User
  let token: string
  let app: INestApplication

  beforeAll(async () => {
    app = await createTestApp()
    const { user, accessToken } = await createAndLogUser(app)
    token = accessToken
    uploader = user
  })

  afterAll(async () => {
    await app?.close()
  })

  function callApi(body: UploadScreenshotControllerRequest) {
    return request(app.getHttpServer())
      .post('/screenshots')
      .set('Authorization', `Bearer ${token}`)
      .send(body)
  }

  it('should create a new screenshot with phonetic names', async () => {
    const image = await prisma.image.create({ data: { transformations: {} } })
    const { body, statusCode } = await callApi({
      imageId: image.uuid,
      originalName: 'Age of Empires II: The Age of Kings',
      alternativeNames: ['Age Of Empires 2', 'Age Of Empires II', 'aoe aok', '  aoe aok  '],
      year: 1999,
    })

    expect({ body, statusCode }).toEqual({ statusCode: 201, body: { id: expect.any(Number) } })

    expect(
      await prisma.screenshot.findUnique({
        where: { id: body.id },
        include: { phoneticNames: { orderBy: { id: 'asc' } } },
      })
    ).toEqual({
      addedByUserId: uploader.id,
      creationDate: expect.any(Date),
      firstGuessedByUserId: null,
      gameName: 'Age of Empires II: The Age of Kings',
      id: body.id,
      imageId: 1,
      year: 1999,
      phoneticNames: [
        {
          id: expect.any(Number),
          originalName: 'Age of Empires II: The Age of Kings',
          phoneticName: 'AKOFEMPR0AKOFKNK',
          screenshotId: body.id,
        },
        {
          id: expect.any(Number),
          originalName: 'Age Of Empires 2',
          phoneticName: 'AKOFEMPR',
          screenshotId: body.id,
        },
        {
          id: expect.any(Number),
          originalName: 'Age Of Empires II',
          phoneticName: 'AKOFEMPR',
          screenshotId: body.id,
        },
        {
          id: expect.any(Number),
          originalName: 'aoe aok',
          phoneticName: 'AAK',
          screenshotId: body.id,
        },
      ],
    })
  })

  it('should reject if image not found', async () => {
    const { body, statusCode } = await callApi({
      imageId: v4(),
      originalName: 'bonjour',
      alternativeNames: [],
      year: 2000,
    })
    expect({ body, statusCode }).toEqual({
      body: {
        error: 'Not Found',
        message: 'IMAGE_NOT_FOUND',
        statusCode: 404,
      },
      statusCode: 404,
    })
  })

  it('should throw if empty', async () => {
    const image = await prisma.image.create({ data: { transformations: {} } })
    const { body, statusCode } = await callApi({
      imageId: image.uuid,
      originalName: '    ',
      alternativeNames: [''],
      year: 2000,
    })
    expect({ body, statusCode }).toEqual({
      body: {
        error: 'Bad Request',
        message: 'EMPTY_NAMES',
        statusCode: 400,
      },
      statusCode: 400,
    })
  })

  it('should reject if missing data', async () => {
    const { body, statusCode } = await callApi({} as UploadScreenshotControllerRequest)
    expect({ body, statusCode }).toEqual({
      body: {
        error: 'Bad Request',
        message: [
          'imageId should not be empty',
          'originalName should not be empty',
          'year must not be greater than 2050',
          'year must not be less than 1950',
          'year must be an integer number',
          'alternativeNames must be an array',
        ],
        statusCode: 400,
      },
      statusCode: 400,
    })
  })

  it('should reject if not logged in', async () => {
    const { body, statusCode } = await request(app.getHttpServer()).post('/screenshots').send({})

    expect({ body, statusCode }).toEqual({
      body: {
        message: 'Unauthorized',
        statusCode: 401,
      },
      statusCode: 401,
    })
  })
})
