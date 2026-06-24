export interface RecentActivityResponseData {
  recentlyVisited: RecentlyVisited[]
  myWorkspaces: MyWorkspace[]
  recentActivities: RecentActivity[]
}

export interface RecentlyVisited {
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
  workspace: Workspace
}

export interface Workspace {
  WorkspaceName: string
}

export interface MyWorkspace {
  WorkspaceID: number
  WorkspaceName: string
  OrganizationID: number
  CreateDate: string
  CreatedBy: number
  DeletedDate: string
  Deletedby: number
  IsDelete: number
  UpdatedBy: any
}

export interface RecentActivity {
  RecentActivityID: number
  TaskMasterID: number
  SubTasksID: any
  AdditionalColumnID?: number
  DoneBy: number
  DoneAt: string
  Title: string
  Description: string
  ActivityType: string
  PreviousState?: string
  NewState: string
  IsCritical: boolean
  doneBy: DoneBy
}

export interface DoneBy {
  Name: string
  Email: string
}
