/**
 * Turning a driver-level failure into something a writer can act on.
 *
 * When a required relation points at a deleted row, Prisma refuses the ENTIRE query and
 * throws `Inconsistent query result: Field X is required to return data, got null instead`.
 * Until now that error was caught, turned into `null`, and read by the page as "article
 * does not exist" — so the editor was bounced back to the list with nothing to report.
 *
 * The raw message names the broken field but says nothing about what to do, so it is kept
 * as `detail` (for the ticket) and paired with a `summary` a non-engineer can read.
 */

/** Prisma names the field, not the model — the field alone identifies the link well enough. */
const RELATION_LABELS: Record<string, string> = {
  tag: "a tag",
  category: "a category",
  author: "an author",
  client: "a client",
  media: "an image",
  featuredImage: "a featured image",
  article: "an article",
  related: "a related article",
};

export interface ArticleLoadProblem {
  /** One line, no jargon: what is wrong with this article's data. */
  summary: string;
  /** The raw driver message — what the admin team needs to locate the row. */
  detail: string;
}

/** `Field tag is required to return data, got `null` instead.` */
const MISSING_RELATION = /Field (\w+) is required to return data/;

/**
 * Prisma prefixes the real message with the failing invocation — under Turbopack that is
 * a mangled chunk path and a code frame from generated output, which tells the admin team
 * nothing and buries the one line that does. Keep the diagnosis, drop the frame.
 */
function meaningfulDetail(raw: string): string {
  const diagnosis = raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .find((line) => line.startsWith("Inconsistent query result:"));

  return diagnosis ?? raw.trim();
}

export function describeArticleLoadProblem(error: unknown): ArticleLoadProblem {
  const detail = meaningfulDetail(error instanceof Error ? error.message : String(error));
  const missing = MISSING_RELATION.exec(detail);

  if (missing) {
    const label = RELATION_LABELS[missing[1]] ?? `a ${missing[1]}`;
    return {
      summary:
        `This article is still linked to ${label} that no longer exists in the database. ` +
        `The link was left behind when the original record was deleted, and it blocks the ` +
        `whole article from loading.`,
      detail,
    };
  }

  return {
    summary: "This article could not be read from the database.",
    detail,
  };
}

/** A status outside the schema's enum — also a data defect, also worth naming. */
export function describeInvalidStatus(status: string): ArticleLoadProblem {
  return {
    summary:
      `This article has the status "${status}", which is not one of the statuses the ` +
      `workflow recognises. It cannot be displayed until the status is corrected.`,
    detail: `Unknown ArticleStatus: ${status}`,
  };
}
