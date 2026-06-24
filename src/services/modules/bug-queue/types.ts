export interface BugQueueListAPI {
  BugID: number
  BugName: string
  BugDescription: any
  Reporter: any
  IsDelete: number
  TimerStart: boolean
  StatusID: any
  PriorityID: number
  Priority: Priority
  CreateDate: string
  CreateBy: number
  DeletedDate: any
  Deletedby: any
  TimeResolution: string | null
  SprintTaskID: any
  SprintID: any
  WorkSpaceID: any
  createdBy: CreatedBy
}

export interface CreatedBy {
  UserID: number
  Name: string
  Email: string
  Pwd: string
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

export interface Priority {
  PriorityID: number
  PriorityName: string
  Colorcode: string
}

export interface BugPriorityList {
  PriorityID: number
  PriorityName: string
  Colorcode: string
  CreateDate: string
  CreatedBy: number
  IsDelete: number
  IsDefault: number
  TaskgroupID: number
}
