import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'

import { LocalConfigModule } from '../shared/config/config.module'
import { LocalConfigService } from '../shared/config/config.service'
import { PrismaModule } from '../shared/prisma/prisma.module'
import { AuthService } from './auth.service'
import { CreateTokenAuthController } from './controllers/create-tokens.controller'
import { DeleteTokensAuthController } from './controllers/delete-tokens.controller'
import { MeAuthController } from './controllers/me.controller'
import { RefreshTokenAuthController } from './controllers/refresh-token.controller'
import { RegisterAuthController } from './controllers/register.controller'
import { JwtStrategy } from './guards/jwt.strategy'

@Module({
  imports: [
    PrismaModule,
    LocalConfigModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [LocalConfigModule],
      inject: [LocalConfigService],
      useFactory: ({ config }: LocalConfigService) => ({
        secret: config.api.jwtSecret,
        signOptions: { expiresIn: config.api.jwtExpiresIn },
      }),
    }),
  ],
  controllers: [
    RegisterAuthController,
    CreateTokenAuthController,
    RefreshTokenAuthController,
    DeleteTokensAuthController,
    MeAuthController,
  ],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
