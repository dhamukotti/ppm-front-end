export interface WorkspaceListItem {
  WorkspaceID: number
  WorkspaceName: string
  OrganizationID: number
  CreateDate: string
  CreatedBy: number
  DeletedDate: any
  Deletedby: any
  IsDelete: number
  UpdatedBy: any
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
