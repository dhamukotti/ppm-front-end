export interface TaskGroup {
  TaskGroupID: number
  TaskGroupName: string
  ProjectID: number
  CreateDate: string
  CreateBy: number
  DeletedDate: any
  Deleteby: any
  IsDelete: number
  UpdateBy: any
  UpdatedDate: any
  additionalColumns: AdditionalColumn[]
}

export interface AdditionalColumn {
  AdditionalColumnID: number
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
  Keyname: string
  IsDelete: number
}

export interface DynamicDropdownList {
  Dynamic_ddl_ID: number
  Valuetxt: string
  IsDelete: number
  TaskID: number
  additionalColumnID:number
  TaskGroupID: number
  WorkspaceID: number
  ProjectID: number
}
