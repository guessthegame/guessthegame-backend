import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'

import { createTestApp } from './utils/create-test-app'

describe('AppController (e2e)', () => {
  let app: INestApplication

  beforeAll(async () => {
    app = await createTestApp()
  })

  afterAll(async () => {
    await app?.close()
  })

  it('/ (GET)', async () => {
    const { body, statusCode } = await request(app.getHttpServer()).get('/')

    expect({ body, statusCode }).toEqual({
      statusCode: 200,
      body: { app: 'guessthegame-backend', version: expect.any(String) },
    })
  })
})
