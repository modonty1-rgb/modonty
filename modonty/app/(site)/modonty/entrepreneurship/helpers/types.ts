/** Where an activity sits among all of them by registrations: the top tenth, the rest of the top half, or the lower half. */
export type CompetitionLevel = "busy" | "medium" | "quiet";

/** One economic activity as the page shows it — the ministry's name and count, and our rank of it. */
export interface ActivityMatch {
  code: string;
  name: string;
  /** Commercial registrations in force for this activity, as the ministry counted them. */
  count: number;
  /** 1 = the most registered activity. */
  rank: number;
  level: CompetitionLevel;
}

export interface ActivitySearch {
  total: number;
  results: ActivityMatch[];
}
