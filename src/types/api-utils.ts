export type MethodsType = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS'

// ** UriEndpoint Props
export type ApiEndpoint = {
  method: MethodsType
  uri: string
  headerProps?: Record<string, string>
}

export type ApiUtils = {
  uriEndPoint: ApiEndpoint
  query?: Record<string, any>
  pathParams?: Record<string, string>
  apiHostUrl?: string
  body?: any
  auth?: boolean
  nextUrl?: boolean
}

export type MakeUrl = {
  uri: string
  pathParams: Record<string, string> | undefined
  query: Record<string, any> | undefined
}
