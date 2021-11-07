import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'

import { LocalConfigService } from '../../shared/config/config.service'
import { AccessTokenContentType, UserSessionType } from '../auth.types'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: LocalConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.config.api.jwtSecret,
    })
  }

  /**
   * Retrieve user session data from a JWT payload
   */
  validate(payload: AccessTokenContentType): UserSessionType {
    return {
      id: payload.id,
      uuid: payload.uuid,
    }
  }
}
