import type { SuggestedPartner } from "../components/partner-cards/PartnerCards";
import type { WebSource } from "../data/save-chatbot-message";

export type Msg = {
  role: "user" | "assistant";
  content: string;
  /** Partners behind this answer, rendered as bookable cards under it. */
  partners?: SuggestedPartner[];
  source?: "web";
  sources?: WebSource[];
  noSources?: boolean;
  /** The saved row this answer became — present only for a signed-in visitor. */
  messageId?: string;
  industrySuggestion?: IndustrySuggestion;
};

export type Redirect = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  client: { name: string; slug: string };
};

export type SuggestedArticle = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  client: { id: string; name: string; slug: string };
};

export type IndustrySuggestion = {
  slug: string;
  name: string;
};

/** One saved turn as `/modo-chat/api/conversation` returns it. */
export type ResumedTurn = {
  userQuery: string;
  assistantResponse: string;
  source?: "web" | "db" | null;
  webSources?: WebSource[] | null;
};

/** One offerable industry as `/modo-chat/api/industries` returns it. */
export type Industry = {
  name: string;
  slug: string;
  description?: string | null;
  /** How many active partners stand behind it — the reason to pick this one. */
  partnerCount: number;
};

/** What Modo remembers from earlier visits — scope names only, never a health profile. */
export type ChatMemory = { recentScopes: string[]; lastQuestion: string | null };
