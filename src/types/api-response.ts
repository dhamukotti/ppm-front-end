export type ApiResponse<T = any> = {
  status: boolean
  statusCode: number
  message: string
  data: T
}

export type CookieEncData = {
  token: string
  tokenTime: number
  refreshTokenTime: number
  refreshToken: string
}
