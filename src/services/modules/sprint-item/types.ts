export interface SprintItem {
  SprintID: number
  Name: string
  sprintID:string
  WorkSpaceID: number
  groupID:number
  additionalColumnID:string
  sprintGroupID:number
  StatusID:number
  SprintGroupID: number
  TaskGroupID:number
  BugID:number
  Goals: string
  SprintStatus: 'Not Started' | 'Active' | 'Paused' | 'Completed'
  SprintTimelineStart: Date
  SprintTimelineEnd: Date
  IsDelete: boolean
  DeletedDate: any
  Deletedby: any
  CreateDate: string
  CreateBy: number
  UpdatedDate: string
  UpdateBy: number
  SprintTimeElapsedInSeconds: number,
   additionalValues: AdditionalValue[]
}
export interface AdditionalValue {
  DynamicID: number
  additionalColumnID:number
  DynamicColumnValues?: string
  Columntype: number
  CreateDate: string
  CreateBy: number
  dynamicDropdownValueList:any
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
export interface TColumnType {
  ColumnTypeID: number
  Key: 'USR' | 'TXT' | 'DDL' | 'DPK' | 'LBL' | 'NUM' | 'FLE'
  Title: string
}
export interface Role {
  RoleID: number
  RoleName: string
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
  WorkSpaceID: number
  ColumnType: ColumnType
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
