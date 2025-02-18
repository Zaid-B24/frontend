export interface PaginatedResponse<T> {
    items: T[];
    totalItems: number;
    currentPage: number;
    pageSize: number;
    totalPages: number;
}