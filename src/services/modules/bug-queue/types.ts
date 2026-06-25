export interface BugQueueListAPI {
  BugID: string
  BugName: string
  bugID:String
  BugDescription: any
  Reporter: any
  groupID:string
  IsDelete: number
  // TimerStart: boolean
  timeResolution:string
  StatusID: any
  isTimerStart:boolean
  PriorityID: number
  Priority: Priority
  CreateDate: string
  CreateBy: number
  DeletedDate: any
  Deletedby: any
  TaskGroupID:string
  // TimeResolution: string | null
  SprintTaskID: any
  SprintID: any
  WorkSpaceID: any
  createdBy: CreatedBy
}
export interface AdditionalValue {
  DynamicID: number
  DynamicColumnValues?: string
  Columntype: number
  CreateDate: string
  CreateBy: number
  DeletedDate: any
  DeletedBy: any
  IsDelete: number
  SprintGroupID: number
  SprintID: number
  WorkSpaceID: number

  AdditionalColumnID: number
  DynamicUserID?: number
  DynamicDropdownID?: number
  StatusID?: number
  DisplayText?: string
  columnType: ColumnType
  User?: User
  Dropdown?: Dropdown
  Status?: Status2
}
export interface User {
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

export interface Dropdown {
  Dynamic_ddl_ID: number
  Valuetxt: string
  IsDelete: number
  TaskID: number
  TaskGroupID: number
  WorkspaceID: number
  ProjectID: number
}

export interface Status2 {
  StatusID: number
  Statusname: string
  CreateDate: string
  CreatedBy: any
  Colorcode: string
  IsDelete: number
  IsDefault: number
  TaskgroupID: any
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

export interface ColumnType {
  ID: number
  Title: string
  Keyname: string
  IsDelete: number
}

export interface AdditionalColumn {
  AdditionalColumnID: number
  ColumnName: string
  additionalColumnID:string
  AdditionalColumnTypeID: number
  CreateDate: string
  CreateBy: number
  DeletedDate: any
  DeletedBy: any
  IsDelete: number
  ModifiedBy: any
  ModifiedDate: any
  SprintGroupID: number
  SprintID: number
  dynamicDropdownValueList:any
  WorkSpaceID: number
  ColumnType: ColumnType
}

export interface TColumnType {
  ColumnTypeID: number
  Key: 'USR' | 'TXT' | 'DDL' | 'DPK' | 'LBL' | 'NUM' | 'FLE'
  Title: string
}
