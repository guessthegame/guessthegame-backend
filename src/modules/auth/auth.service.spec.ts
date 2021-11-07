import { UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { UserRoleEnum } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

import { PrismaService } from '../shared/prisma/prisma.service'
import { AuthService } from './auth.service'

describe('AuthService', () => {
  let authService: AuthService
  let prismaService: PrismaService
  let jwtService: JwtService

  beforeEach(() => {
    prismaService = new PrismaService()
    jwtService = new JwtService({})
    authService = new AuthService(prismaService, jwtService)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  /**
   * checkPassword Suite
   */
  describe('checkPassword', () => {
    const user = { passwordHash: 'hash' }

    it('should throw if passwords do not match', () => {
      jest.spyOn(bcrypt, 'compareSync').mockReturnValue(false)

      expect(() => authService.checkPassword('password', user.passwordHash)).toThrow(
        UnauthorizedException
      )
      expect(bcrypt.compareSync).toHaveBeenCalledWith('password', 'hash')
    })

    it('should throw if passwords do not match', () => {
      jest.spyOn(bcrypt, 'compareSync').mockReturnValue(true)

      expect(authService.checkPassword('password', user.passwordHash)).toEqual(undefined)
      expect(bcrypt.compareSync).toHaveBeenCalledWith('password', 'hash')
    })
  })

  /**
   * Login Suite
   */
  describe('generateTokens', () => {
    it('should generate a JWT and a refresh token from user', async () => {
      const user = {
        id: 1,
        uuid: '1',
        customerId: 12,
        evUserId: 24,
        roles: [UserRoleEnum.Player],
      }

      const generatedJwt = 'super-generated-jwt'
      jest.spyOn(jwtService, 'sign').mockReturnValue(generatedJwt)
      jest.spyOn(prismaService.userRefreshToken, 'create').mockResolvedValue({
        id: 1,
        userId: 1,
        creationDate: new Date(),
        expirationDate: new Date(Date.now() + 30 * 24 * 3600 * 1000),
        token: 'random-string-abc123',
      })

      expect(await authService.generateTokens(user)).toEqual({
        refreshToken: expect.any(String),
        accessToken: generatedJwt,
      })
      expect(jwtService.sign).toHaveBeenCalledWith({
        id: 1,
        uuid: '1',
      })
    })
  })
})
