export interface ProjectListItem {
  ID: number
  ProjectName: string
  WorkSpaceID: number
  DeletedDate: any
  DeletedBy: any
  IsDelete: number
  CreateDate: string
  CreateBy: number
  UpdatedDate: any
  UpdateBy: any
  IsOpen: boolean
  userProjects: UserProject[]
}

export interface UserProject {
  UserProjectID: number
  UserID: number
  WorkspaceID: number
  ProjectID: number
  RoleID: number
  JoinDate: string
  AddedBy: number
  UpdatedBy: any
  UpdatedDate: any
}

export interface ProjectViewData {
  ID: number
  ProjectName: string
  WorkSpaceID: number
  DeletedDate: any
  DeletedBy: any
  IsDelete: number
  CreateDate: string
  CreateBy: number
  UpdatedDate: any
  UpdateBy: any
  IsOpen: boolean
  CreatedBy: CreatedBy
  additionalColumns: AdditionalColumn[]
  userProjects: UserProjects
}
export interface CreatedBy {
  Name: string
  Email: string
  OrganizationName: string
  Address: string
}

export interface AdditionalColumn {
  AdditionalColumnID: number
  additionalColumnID:number
  ColumnName: string
  AdditionalColumnTypeID: number
  CreateDate: string
  CreateBy: number
  DeletedDate: any
  DeletedBy: any
  IsDelete: number
  ModifiedBy: any
  ModifiedDate: any
  TaskGroupID: number
  WorkspaceID: number
  ProjectID: number
  ColumnType: ColumnType
}

export interface ColumnType {
  ID: number
  Title: string
  Keyname: 'USR' | 'TXT' | 'DDL' | 'DPK' | 'LBL' | 'NUM' | 'FLE'
  IsDelete: number
}

export interface UserProjects {
  UserProjectID: number
  RoleID: number
  Role: Role
}

export interface Role {
  RoleID: number
  RoleName: string
}
