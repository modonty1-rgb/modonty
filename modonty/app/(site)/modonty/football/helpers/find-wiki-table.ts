/** The first `wikitable` on the page whose header row contains every one of `headers`. */
export function findWikiTable(pageHtml: string, headers: string[]): string | null {
  for (const [table] of pageHtml.matchAll(/<table[^>]*wikitable[^>]*>[\s\S]*?<\/table>/g)) {
    if (headers.every((h) => table.includes(`>${h}<`))) return table;
  }
  return null;
}
