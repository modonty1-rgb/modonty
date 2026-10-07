import { cacheLife } from "next/cache";

import type { AiModel, Paper, Repo } from "../helpers/types";
import { getArabicModels } from "./get-arabic-models";
import { getArabicPapers } from "./get-arabic-papers";
import { getRisingRepos } from "./get-rising-repos";
import { getTrendingModels } from "./get-trending-models";

interface AiPage {
  trending: AiModel[] | null;
  arabic: AiModel[] | null;
  papers: Paper[] | null;
  repos: Repo[] | null;
  /** Oldest copy on the page — what «آخر تحديث» honestly means. */
  updatedAt: string | null;
}

/**
 * Everything the AI page shows, assembled at most once per 5 minutes per instance. The snapshots
 * under it decide how often each source is actually called (6 or 12 hours) — the same two layers
 * as the football page. Each item arrives with its Arabic line already translated (get-arabic-briefs).
 */
export async function getAiPage(): Promise<AiPage> {
  "use cache";
  cacheLife({ stale: 60, revalidate: 300, expire: 3600 });

  const [trending, arabic, papers, repos] = await Promise.all([getTrendingModels(), getArabicModels(), getArabicPapers(), getRisingRepos()]);
  const stamps = [trending, arabic, papers, repos].map((s) => s.fetchedAt?.getTime()).filter((t): t is number => !!t);

  return {
    trending: trending.data,
    arabic: arabic.data,
    papers: papers.data,
    repos: repos.data,
    updatedAt: stamps.length ? new Date(Math.min(...stamps)).toISOString() : null,
  };
}
