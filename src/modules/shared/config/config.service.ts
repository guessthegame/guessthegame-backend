import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

type ConfigType = {
  api: {
    jwtSecret: string
    jwtExpiresIn: string
  }
  logs: {
    level: string
  }
}

@Injectable()
export class LocalConfigService {
  public config: ConfigType

  constructor(private configService: ConfigService) {
    this.config = {
      api: {
        jwtSecret: this.getEnvString('API_JWT_SECRET'),
        jwtExpiresIn: this.getEnvString('API_JWT_EXPIRES_IN'),
      },
      logs: {
        level: this.getEnvString('LOGS_LEVEL'),
      },
    }
  }

  /**
   * Retrieves a string env variable
   */
  private getEnvString(name: string): string {
    return this.getEnv(name)
  }

  /**
   * Retrieves a number type env variable
   */
  private getEnvNumber(name: string): number {
    const value = Number(this.getEnv(name))
    if (isNaN(value)) {
      throw new Error(`${name} needs to be a number`)
    }
    return value
  }

  /**
   * Retrieves an env variable from .env or .env.local files
   * Throws an error if the variable is empty
   */
  private getEnv(name: string): string {
    const value = this.configService.get(name)
    if (!value) {
      throw new Error(`${name} is not defined`)
    }
    return value
  }
}
