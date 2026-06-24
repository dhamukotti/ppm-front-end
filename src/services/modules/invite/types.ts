export interface ProjectUsers {
  UserProjectID: number
  UserID: number
  WorkspaceID: number
  ProjectID: number
  RoleID: number
  JoinDate: string
  AddedBy: number
  UpdatedBy: any
  UpdatedDate: any
  User: User
  Role: Role
}

export interface User {
  Name: string
  Email: string
  UserID: number
  ProfilePicture: string
}

export interface Role {
  RoleID: number
  RoleName: string
}
