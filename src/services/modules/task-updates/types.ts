export interface TaskUpdatesListItemType {
  UpdateID: number
  TaskID: number
  ParentUpdateID: any
  Message: string
  IsDelete: number
  CreatedAt: string
  CreatedBy: number
  createdBy: CreatedBy
  taskUpdateLikes: TaskUpdateLike[]
  isLiked: boolean
  replies: Reply[]
}

export interface CreatedBy {
  Name: string
  ProfilePicture: string
  UserID: number
  Email: string
}

export interface TaskUpdateLike {
  UserID: number
}

export interface Reply {
  UpdateID: number
  TaskID: number
  ParentUpdateID: number
  Message: string
  IsDelete: number
  CreatedAt: string
  CreatedBy: number
  createdBy: CreatedBy2
  taskUpdateLikes: any[]
}

export interface CreatedBy2 {
  Name: string
  ProfilePicture: string
  UserID: number
  Email: string
}
