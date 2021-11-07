import { Request } from 'express'

export type AuthTokensType = {
  accessToken: string
  refreshToken: string
}

export type AccessTokenContentType = UserSessionType

export type UserSessionType = {
  id: number
  uuid: string
}
export type RequestContainingUser = Request & {
  user: UserSessionType
}
