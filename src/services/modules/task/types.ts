export interface TaskListItemType {
  TaskID: number
  Taskname: string
  TaskDescription: any
  Taskowner: number
  IsDelete: number
  StatusID: number
  PriorityID: number
  TimelineStartDate: string
  TimelineEndDate: string
  groupID:number
  BugID:number
  CreateDate: string
  CreateBy: number
  TaskGroupID: number
  ProjectID: number
  WorkspaceID: number
  Status: Status
  Priority: Priority
  Owner: Owner
  additionalValues: AdditionalValue[]
}

export interface Status {
  StatusID: number
  Statusname: string
  Colorcode: string
}

export interface Priority {
  PriorityID: number
  PriorityName: string
  Colorcode: string
}

export interface Owner {
  Email: string
  Name: string
  UserID: number
  ProfilePicture: string
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
  TaskID: number
  TaskGroupID: number
  WorkspaceID: number
  ProjectID: number
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

export interface ColumnType {
  ID: number
  Title: string
  Keyname: string
  IsDelete: number
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

export interface TColumnType {
  ColumnTypeID: number
  Key: 'USR' | 'TXT' | 'DDL' | 'DPK' | 'LBL' | 'NUM' | 'FLE'
  Title: string
}

export interface RecentActivityListType {
  RecentActivityID: number
  TaskMasterID: number
  SubTasksID: any
  AdditionalColumnID: any
  DoneBy: number
  DoneAt: string
  Title: string
  Description: string
  ActivityType: string
  PreviousState: string
  NewState: string
  IsCritical: boolean
  doneBy: DoneBy
}

export interface DoneBy {
  Email: string
  Name: string
  UserID: number
  ProfilePicture: string
}
