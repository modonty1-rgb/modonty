import { readSnapshot, type Snapshot } from "../../data/read-snapshot";
import type { AiModel } from "../helpers/types";
import { loadHubModels } from "./load-hub-models";

const HOURS_6 = 6 * 60 * 60 * 1000;

/** The Hub's five most trending models this week — trending moves by the day, so a copy lives 6 hours. */
export function getTrendingModels(): Promise<Snapshot<AiModel[]>> {
  return readSnapshot("ai:hub:trending", () => HOURS_6, () => loadHubModels("hub-trending", ""));
}
