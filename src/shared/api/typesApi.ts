export type ApiResponse<TData, TMeta = null> = {
  data: TData;
  meta: TMeta;
};

export type PaginationMeta = {
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  totalCount: number;
};
