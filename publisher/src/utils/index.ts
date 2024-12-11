export interface PaginationParams {
    page: number;
    limit: number;
    skip: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    metadata: {
        total: number;
        currentPage: number;
        pageSize: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
    };
}

export class PaginationUtils {
    static readonly DEFAULT_PAGE = 1;
    static readonly DEFAULT_LIMIT = 10;
    static readonly MAX_LIMIT = 100;
  
  
    static createPaginatedResponse<T>(
      data: T[],
      total: number,
      { page, limit }: PaginationParams
    ): PaginatedResponse<T> {
      const totalPages = Math.ceil(total / limit);
  
      return {
        data,
        metadata: {
          total,
          currentPage: page,
          pageSize: limit,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1
        }
      };
    }
  }