export interface PaginatedResponse<T> {
  items: T[]
  total_pages: number
  page: number
  total_count: number
}
