import { readSnapshot, type Snapshot } from "../../data/read-snapshot";
import { leadText } from "../helpers/lead-text";
import { parseArxivFeed } from "../helpers/parse-arxiv-feed";
import { SOURCE_USER_AGENT } from "../helpers/source-user-agent";
import type { Paper } from "../helpers/types";
import { getArabicBriefs } from "./get-arabic-briefs";

const HOURS_12 = 12 * 60 * 60 * 1000;

/**
 * The newest arXiv papers on Arabic in computational linguistics (cs.CL). Their metadata is CC0;
 * the papers stay on arXiv and we link to them (arXiv API terms). The terms allow one request every
 * three seconds — a copy that lives 12 hours stays far below that.
 */
async function loadPapers(): Promise<Paper[]> {
  const res = await fetch(
    "https://export.arxiv.org/api/query?search_query=cat:cs.CL+AND+abs:arabic&sortBy=submittedDate&sortOrder=descending&max_results=5",
    { headers: { "User-Agent": SOURCE_USER_AGENT }, cache: "no-store" },
  );
  if (!res.ok) throw new Error(`arxiv ${res.status}`);
  const papers = parseArxivFeed(await res.text());
  if (!papers.length) throw new Error("arxiv: no entries");

  const briefs = await getArabicBriefs("arxiv", papers.map((p) => ({ id: `arxiv:${p.id}`, text: leadText(p.summary) })));
  return papers.map(({ summary: _summary, ...p }) => ({ ...p, brief: briefs[`arxiv:${p.id}`] ?? null }));
}

export function getArabicPapers(): Promise<Snapshot<Paper[]>> {
  return readSnapshot("ai:arxiv:arabic", () => HOURS_12, loadPapers);
}
