/** Reads the categories page's own query string into the shape the page renders from. */
export function parseCategorySearchParams(params: Record<string, string | string[] | undefined>) {
  const search = typeof params.search === 'string' ? params.search : undefined;
  const sort = typeof params.sort === 'string' &&
    ['name', 'articles', 'trending', 'recent'].includes(params.sort)
    ? params.sort as 'name' | 'articles' | 'trending' | 'recent'
    : undefined;
  const view = typeof params.view === 'string' && ['grid', 'list'].includes(params.view)
    ? params.view as 'grid' | 'list'
    : 'grid';
  const featured = typeof params.featured === 'string' ? params.featured : undefined;

  return { search, sort, view, featured };
}
