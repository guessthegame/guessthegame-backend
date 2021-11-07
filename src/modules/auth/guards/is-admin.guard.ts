import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common'
import { UserRoleEnum } from '@prisma/client'

import { PrismaService } from '../../shared/prisma/prisma.service'
import { UserSessionType } from '../auth.types'

@Injectable()
export class IsAdminGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Guard validates if user has role Admin
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{ user: UserSessionType }>()

    // No user in request: Unauthorize
    if (!request.user) {
      return false
    }

    // Retrieve the roles from the DB
    const user = await this.prisma.user.findUnique({
      where: { id: request.user.id },
      select: { roles: true },
    })

    // User does not exist: Unauthorize
    if (!user) {
      return false
    }

    return user.roles.includes(UserRoleEnum.Admin)
  }
}
