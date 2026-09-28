import { leadText } from "../helpers/lead-text";
import { SOURCE_USER_AGENT } from "../helpers/source-user-agent";
import type { AiModel } from "../helpers/types";
import { getArabicBriefs } from "./get-arabic-briefs";

interface HubModel {
  id: string;
  likes?: number;
  pipeline_tag?: string;
  tags?: string[];
}

/**
 * Not for our readers: the Hub's own adult tag, and the names that announce it. The trending list
 * on 28 Sep 2026 had «Qwen-Image-2.1-Uncensored-GGUF» second — with no tag, so the name check is
 * what caught it.
 */
const UNSUITABLE_NAME = /uncensored|nsfw|abliterat|erotic|porn|hentai|lewd|nude/i;
const unsuitable = (m: HubModel) => m.tags?.includes("not-for-all-audiences") || UNSUITABLE_NAME.test(m.id);

/**
 * Models from the Hugging Face Hub's open API, most trending first — «open endpoints that you can
 * use to retrieve information from the Hub» (Hub API docs). Anonymous callers get 500 API calls per
 * 5 minutes (Hub rate limits, Sep 2025); this page makes a few a day.
 *
 * `search=arabic` is how the Arabic list is asked for: `language=ar` is ignored and `filter=ar` returns
 * large multilingual models (measured 28 Sep 2026).
 */
export async function loadHubModels(list: string, query: string, limit = 5): Promise<AiModel[]> {
  // Six times the need, so the list stays full after the unsuitable ones are dropped.
  const res = await fetch(`https://huggingface.co/api/models?${query ? `${query}&` : ""}sort=trendingScore&direction=-1&limit=${limit * 6}`, {
    headers: { "User-Agent": SOURCE_USER_AGENT },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`huggingface ${res.status}`);
  const models = (await res.json()) as HubModel[];

  const kept = models.filter((m) => !unsuitable(m)).slice(0, limit);

  // The list has no description; each model's card (README) opens with one. «Resolver» calls, the
  // Hub's highest limit (3,000 per 5 minutes anonymous) — five of them per refresh.
  const cards = await Promise.all(
    kept.map((m) =>
      fetch(`https://huggingface.co/${m.id}/raw/main/README.md`, { headers: { "User-Agent": SOURCE_USER_AGENT }, cache: "no-store", signal: AbortSignal.timeout(8000) })
        .then((r) => (r.ok ? r.text() : ""))
        .catch(() => ""),
    ),
  );
  const briefs = await getArabicBriefs(list, kept.map((m, i) => ({ id: `hf:${m.id}`, text: leadText(cards[i]) })));

  return kept.map((m) => {
    const [author, ...rest] = m.id.split("/");
    return {
      id: m.id,
      author: rest.length ? author : "",
      name: rest.length ? rest.join("/") : author,
      task: m.pipeline_tag ?? null,
      likes: m.likes ?? 0,
      url: `https://huggingface.co/${m.id}`,
      brief: briefs[`hf:${m.id}`] ?? null,
    };
  });
}
