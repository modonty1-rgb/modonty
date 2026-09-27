export interface WikiCell {
  text: string;
  /** Title of the first wiki link in the cell (the team or player page), after the flag. */
  link: string | null;
}

const decode = (s: string) =>
  s
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;|&#160;/g, " ");

/**
 * One `wikitable` from Wikipedia's rendered HTML, as rows of cells.
 *
 * `rowspan` is expanded so every row has the same columns: the top-scorers table writes a
 * shared rank and goal count once for six players, and without the expansion those rows
 * lose two columns and the club lands in the goals column.
 *
 * Regex, not a DOM parser: the input is Wikipedia's own generated table markup, not arbitrary
 * HTML, and one server-only function does not justify a new dependency.
 */
export function readWikiTable(tableHtml: string): WikiCell[][] {
  const rows: WikiCell[][] = [];
  const carried: ({ cell: WikiCell; left: number } | null)[] = [];

  for (const [, rowHtml] of tableHtml.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/g)) {
    const cells = [...rowHtml.matchAll(/<(td|th)([^>]*)>([\s\S]*?)<\/\1>/g)].map(([, , attrs, inner]) => {
      const body = inner
        .replace(/<span class="flagicon"[\s\S]*?<\/span><\/span>/g, "")
        .replace(/<sup[\s\S]*?<\/sup>/g, "")
        .replace(/<style[\s\S]*?<\/style>/g, "");
      const link = body.match(/<a [^>]*title="([^"]+)"[^>]*>/);
      return {
        cell: {
          text: decode(body.replace(/<[^>]+>/g, "")).replace(/\s+/g, " ").trim(),
          link: link ? decode(link[1]) : null,
        },
        span: Number(attrs.match(/rowspan="(\d+)"/)?.[1] ?? 1),
      };
    });

    const row: WikiCell[] = [];
    let next = 0;
    for (let col = 0; next < cells.length || carried[col]; col++) {
      const carry = carried[col];
      if (carry && carry.left > 0) {
        row.push(carry.cell);
        carry.left--;
        continue;
      }
      const c = cells[next++];
      if (!c) break;
      row.push(c.cell);
      carried[col] = c.span > 1 ? { cell: c.cell, left: c.span - 1 } : null;
    }
    rows.push(row);
  }
  return rows;
}
