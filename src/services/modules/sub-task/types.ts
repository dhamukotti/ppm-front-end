import type { ColumnType, Dropdown, Owner, Status, Status2, User } from '../task/types'

export interface SubTaskListItemType {
  SubTaskID: number
  TaskMasterID: number
  SubTaskName: string
  SubtaskOwner: number
  StatusID: number
  CreateDate: string
  Createby: number
  IsDelete: number
  DeletedDate: any
  Deletedby: any
  Effort: string
  TimelineStartDate: any
  TimelineEndDate: any
  Status: Status
  Owner: Owner
  additionalValues: AdditionalValueSubTask[]
}

export interface AdditionalValueSubTask {
  DynamicID: number
  DynamicColumnValues?: string
  Columntype: number
  SubTaskID: number
  TaskID: number
  ProjectID: number
  IsDelete: number
  CreateDate: string
  CreateBy: number
  DeletedDate: any
  DeletedBy: any
  WorkspaceID: number
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

export interface SubTaskColumnType {
  AdditionalColumnID: number
  ColumnName: string
  AdditionalColumnTypeID: number
  CreateBy: number
  CreateDate: string
  ModifiedDate: any
  ModifiedBy: any
  IsDelete: number
  DeletedBy: any
  DeletedDate: any
  TaskGroupID: number
  WorkspaceID: number
  ProjectID: number
  TaskID: number
  ColumnType: ColumnType
}

export interface AdditionalSubTaskListItem extends SubTaskListItemType {
  TaskGroupID: number
  groupID:number
SprintID:number
SprintGroupID:number
StatusID:number
  BugID:number
  TaskID: number
}
