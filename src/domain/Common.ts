export interface PaginationMeta {
  cursor: string | null;
  hasMore: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    pagination: PaginationMeta;
  };
}

// Generic wrapper for single-item API responses
export interface ApiResponse<T> {
  data: T;
}
