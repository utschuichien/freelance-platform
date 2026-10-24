export interface ApiResponse<T> {
  data: T;
  message?: string;
  statusCode?: number;
}

export interface CursorPaginatedResponse<T> {
  data: T[];
  nextCursor?: string | null;
  hasMore?: boolean;
}

export interface OffsetPaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
