export interface BranchType {
  _id?: string
  branchName: string
  location: string
  description: string
  createdAt?: string
  updatedAt?: string
}

export interface CreateBranchType {
  branchName: string
  location: string
  description: string
}

export interface UpdateBranchType {
  branchName?: string
  location?: string
  description?: string
}

export interface BranchResponseType {
 branches: BranchType[],
}

export interface BranchCreateResponseType {
  status: boolean
  message: string
  data?: BranchType
}

export interface BranchDeleteResponseType {
  status: boolean
  message: string
}

export interface BranchPaginationResponseType {
  status: boolean
  message: string
  data?: {
    branches: BranchType[]
    totalRecords: number
    currentPage: number
    totalPages: number
    limit: number
  }
}