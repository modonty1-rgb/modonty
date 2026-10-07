/** `?page=` as a number: anything that is not a whole page past the first reads as page 1. */
export function parsePageNumber(pageParam: string | undefined): number {
  return Number.isFinite(Number(pageParam)) && Number(pageParam) > 1 ? Number(pageParam) : 1;
}
