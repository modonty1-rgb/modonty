/** `previous`/`next` for the metadata `pagination` field — chunk 2 points back at the bare author URL. */
export function buildAuthorPaginationLinks(baseAuthorUrl: string, page: number, hasMore: boolean) {
  return {
    previous: page > 1 ? (page === 2 ? baseAuthorUrl : `${baseAuthorUrl}?page=${page - 1}`) : undefined,
    next: hasMore ? `${baseAuthorUrl}?page=${page + 1}` : undefined,
  };
}
