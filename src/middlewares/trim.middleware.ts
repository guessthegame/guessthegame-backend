import { Injectable, NestMiddleware } from '@nestjs/common'
import { Request, Response, NextFunction } from 'express'

import { deepTrim } from '../helpers/utilities/deep-trim'

@Injectable()
export class TrimMiddleware implements NestMiddleware {
  /**
   * Trim body properties for all incoming requests
   */
  use(req: Request, res: Response, next: NextFunction): void {
    if (req.body !== undefined) {
      req.body = deepTrim(req.body)
    }
    next()
  }
}
