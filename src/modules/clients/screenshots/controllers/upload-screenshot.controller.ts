import * as fs from 'fs'

import {
  BadRequestException,
  Body,
  Controller,
  NotFoundException,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger'
import { IsArray, IsInt, IsNotEmpty, Max, Min } from 'class-validator'
import { Express } from 'express'
import { uniq } from 'lodash'
import * as sharp from 'sharp'
import { v4 } from 'uuid'

import { toPhonetics } from '../../../../helpers/phonetics/phonetics'
import { getRandomInt } from '../../../../helpers/utilities/random'
import { RequestContainingUser } from '../../../auth/auth.types'
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard'
import { PrismaService } from '../../../shared/prisma/prisma.service'

const UPLOAD_FOLDER = 'uploads'

const UPLOAD_MAX_FILE_SIZE = 4 * 1024 * 1024 // 4 Mo

export class UploadScreenshotControllerRequest {
  @IsNotEmpty()
  imageId!: string

  @IsNotEmpty()
  originalName!: string

  @IsInt()
  @Min(1950)
  @Max(2050)
  year!: number

  @IsArray()
  alternativeNames!: string[]
}

export class UploadScreenshotControllerResponse {
  id!: number
}

@Controller()
export class UploadScreenshotController {
  constructor(private readonly prisma: PrismaService) {}

  @Post('/screenshots')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiResponse({ type: UploadScreenshotControllerResponse })
  async create(
    @Req() req: RequestContainingUser,
    @Body() body: UploadScreenshotControllerRequest
  ): Promise<UploadScreenshotControllerResponse> {
    /**
     * Check uploaded image
     */
    const image = await this.prisma.image.findUnique({
      where: { uuid: body.imageId },
      select: { id: true },
    })
    if (!image) {
      throw new NotFoundException('IMAGE_NOT_FOUND')
    }

    /**
     * List all game names into one list
     */
    const allNames = uniq(
      [body.originalName]
        .concat(body.alternativeNames)
        .map((name) => name.trim())
        .filter((name) => name)
    )
    if (allNames.length === 0) {
      throw new BadRequestException('EMPTY_NAMES')
    }

    /**
     * Compile the names into phonetic names
     */
    const phoneticNames = allNames.map((name) => ({
      originalName: name,
      phoneticName: toPhonetics(name),
    }))

    /**
     * Create the screenshot
     */
    const screenshot = await this.prisma.screenshot.create({
      data: {
        gameName: body.originalName,
        year: body.year,
        addedByUserId: req.user.id,
        phoneticNames: { createMany: { data: phoneticNames } },
        imageId: image.id,
      },
      select: {
        id: true,
      },
    })

    return screenshot
  }

  @Post('/screenshots/image')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(
    FileInterceptor('file', {
      dest: `./${UPLOAD_FOLDER}`,
      limits: { fileSize: UPLOAD_MAX_FILE_SIZE },
    })
  )
  async upload(@UploadedFile() file: Express.Multer.File) {
    /**
     * Save original file
     */
    const uuid = v4()
    await sharp(file.path)
      .resize(1280, 720, { fit: 'contain', background: '#000000' })
      .jpeg({ mozjpeg: true, quality: 90 })
      .toFile(`${UPLOAD_FOLDER}/${uuid}.jpg`)

    /**
     * Save transformed version
     */
    const transformations = {
      angle: getRandomInt(8, 15),
      top: getRandomInt(10, 30),
      bottom: getRandomInt(10, 30),
      left: getRandomInt(10, 30),
      right: getRandomInt(10, 30),
      flipY: true,
      invert: true,
    }
    await sharp(file.path)
      .resize(1280, 720, { fit: 'contain', background: '#000000' })
      .flip()
      .negate({ alpha: false })
      .rotate(transformations.angle, { background: '#6b196e' })
      .extend({
        top: transformations.top,
        bottom: transformations.bottom,
        left: transformations.left,
        right: transformations.right,
        background: '#657e9f',
      })
      .jpeg({ mozjpeg: true, quality: 90 })
      .toFile(`${UPLOAD_FOLDER}/${uuid}.transformed.jpg`)

    fs.unlinkSync(file.path)

    await this.prisma.image.create({
      data: {
        uuid,
        transformations,
      },
    })

    return {
      uuid,
    }
  }
}
