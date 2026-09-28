import { readSnapshot, type Snapshot } from "../../data/read-snapshot";
import { SOURCE_USER_AGENT } from "../helpers/source-user-agent";
import type { Repo } from "../helpers/types";
import { getArabicBriefs } from "./get-arabic-briefs";

const DAY = 24 * 60 * 60 * 1000;
const HOURS_6 = 6 * 60 * 60 * 1000;

/** Chinese, Japanese and Korean scripts — a description in them would not reach our readers. */
const CJK = /[぀-ヿ㐀-鿿가-힯]/;

interface GitHubRepo {
  full_name: string;
  description: string | null;
  stargazers_count: number;
  html_url: string;
}

/**
 * Open-source LLM projects created in the last 30 days, most starred first. GitHub's terms «do not
 * restrict lawful access to or use of the contents of public repositories by third parties»; the
 * unauthenticated search API allows 10 calls a minute, and this page makes four a day.
 */
async function loadRepos(): Promise<Repo[]> {
  const since = new Date(Date.now() - 30 * DAY).toISOString().slice(0, 10);
  const res = await fetch(
    `https://api.github.com/search/repositories?q=topic:llm+created:%3E${since}&sort=stars&order=desc&per_page=5`,
    { headers: { "User-Agent": SOURCE_USER_AGENT, Accept: "application/vnd.github+json" }, cache: "no-store" },
  );
  if (!res.ok) throw new Error(`github ${res.status}`);
  const { items } = (await res.json()) as { items?: GitHubRepo[] };

  const repos = items ?? [];
  // Every description goes to translation — a Chinese one included, which is how it reaches our readers.
  const briefs = await getArabicBriefs("github", repos.map((r) => ({ id: `gh:${r.full_name}`, text: r.description ?? "" })));

  return repos.map((r) => ({
    name: r.full_name,
    // The top of the list on 28 Sep 2026 described itself in Chinese — the name and stars still say enough.
    description: r.description && !CJK.test(r.description) ? r.description : null,
    stars: r.stargazers_count,
    url: r.html_url,
    brief: briefs[`gh:${r.full_name}`] ?? null,
  }));
}

export function getRisingRepos(): Promise<Snapshot<Repo[]>> {
  return readSnapshot("ai:github:rising", () => HOURS_6, loadRepos);
}
