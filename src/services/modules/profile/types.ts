export interface ProfileData {
  Name: string
  UserID: number
  Email: string
  Address: string
  ProfilePicture: string
  country: Country
}

export interface Country {
  ID: number
  Name: string
  Code: string
  CreateDate: string
}
