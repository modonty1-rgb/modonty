import { readSnapshot, type Snapshot } from "../../data/read-snapshot";
import type { AiModel } from "../helpers/types";
import { loadHubModels } from "./load-hub-models";

const HOURS_6 = 6 * 60 * 60 * 1000;

/** The five most trending models made for Arabic (see `loadHubModels` for why `search=arabic`). */
export function getArabicModels(): Promise<Snapshot<AiModel[]>> {
  return readSnapshot("ai:hub:arabic", () => HOURS_6, () => loadHubModels("hub-arabic", "search=arabic"));
}
