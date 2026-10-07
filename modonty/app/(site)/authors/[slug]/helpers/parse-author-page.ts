export function parseAuthorPage(value: string | string[] | undefined): number {
  const page = Number.parseInt(Array.isArray(value) ? value[0] : value || "", 10);
  return Number.isFinite(page) && page > 1 ? page : 1;
}
