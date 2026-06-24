export interface UserData {
  UserID: number
  Name: string
  Email: string
  Accountsource: any
  CreateDate: string
  CountryID: number
  Latitude: string
  Longtitude: string
  UpdatedDate: any
  UpdateBy: any
  OrganizationName: string
  OrganizationSize: string
  Address: string
  OrganizationID: number
  IsDelete: number
  ProfilePicture: string
  ResetOTP: any
  OtpExpireAt: any
}

export interface User {
  id: number
  userData: UserData
  tokenTime: number
}
