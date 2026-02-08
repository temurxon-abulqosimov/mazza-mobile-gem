export interface PaginationMeta {
  cursor: string | null;
  hasMore: boolean;
  total?: number;
  page?: number;
  limit?: number;
  pages?: number;
}

export interface PaginatedResponse<T> {
  data: T;
  meta: {
    pagination: PaginationMeta;
  };
}

// Generic wrapper for single-item API responses
export interface ApiResponse<T> {
  data: T;
}
