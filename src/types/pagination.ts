/** 分页请求参数 */
export interface SkipTakeParams {
  skip?: number
  take?: number
}

/** 分页响应 */
export interface Pagination {
  skip: number
  take: number
}

/** 统一列表响应 */
export interface PaginatedResponse<T> {
  data: T[]
  total?: number
  pagination: Pagination
}

/** 统一单数据响应 */
export interface ApiResponse<T> {
  data: T
}
