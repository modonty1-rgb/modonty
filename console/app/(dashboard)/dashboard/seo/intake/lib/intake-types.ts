/**
 * Unified Intake JSON shape — single source of truth for all client content/SEO strategy.
 * Stored in `Client.intake` Json field. Replaces SeoIntake model + 10 scattered Client fields.
 *
 * Sections:
 *  - voice/audience/goals/policy/technical/business → migrated from old Client fields
 *  - story/customers/strategy/competition/ymylReviewer → new content-brief questions
 */

export const INTAKE_SCHEMA_VERSION = 1 as const;

// ─── Voice & Audience (migrated from Profile) ────────────────────────────────
export interface IntakeVoice {
  tone?: string | null;
  traits?: string[] | null;
}

export interface IntakeAudience {
  description?: string | null;
}

// ─── Goals (migrated from Profile.seoGoals) ──────────────────────────────────
export interface IntakeGoals {
  primary?: string | null;
  kpis?: string | null;
}

// ─── Policy (migrated from Profile forbidden* + compliance + linkBuilding) ───
export interface IntakePolicy {
  forbiddenKeywords?: string[] | null;
  forbiddenClaims?: string[] | null;
  restrictedClaims?: string | null;
  competitiveMentionsAllowed?: boolean | null;
  linkBuildingPolicy?: string | null;
}

// ─── Technical (only Google Business Profile — auto-detected from website URL) ──
export interface IntakeTechnical {
  googleBusinessProfileUrl?: string | null;
}

// ─── Business (migrated from Profile.businessBrief — kept here too for AI brief) ─
export interface IntakeBusiness {
  brief?: string | null;
}

// ─── Story (NEW — E-E-A-T narrative) ─────────────────────────────────────────
export interface IntakeStory {
  foundingStory?: string | null;
  expertise?: string | null;
  seasons?: string[] | null;
}

// ─── Customer Intelligence (NEW) ─────────────────────────────────────────────
export interface IntakeCustomers {
  bigProblem?: string | null;
  objections?: string[] | null;
  faqs?: string | null;
  funnelStage?: string[] | null;
}

// ─── Content Strategy (NEW) ──────────────────────────────────────────────────
export interface IntakeStrategy {
  mainProductFocus?: string | null;
  topicIdeas?: string | null;
  evidence?: string | null;
  preferredCta?: string | null;
  citationSources?: string | null;
}

// ─── Competition (NEW) ───────────────────────────────────────────────────────
export interface IntakeCompetitor {
  name: string;
  url?: string | null;
  edge?: string | null;
}

export interface IntakeCompetition {
  competitors?: IntakeCompetitor[] | null;
  gaps?: string | null;
}

// ─── YMYL Conditional (NEW) ──────────────────────────────────────────────────
export interface IntakeYmylReviewer {
  name?: string | null;
  qualification?: string | null;
  profileUrl?: string | null;
}

// ─── Top-level shape ─────────────────────────────────────────────────────────
export interface ClientIntake {
  voice?: IntakeVoice | null;
  audience?: IntakeAudience | null;
  goals?: IntakeGoals | null;
  policy?: IntakePolicy | null;
  technical?: IntakeTechnical | null;
  business?: IntakeBusiness | null;

  story?: IntakeStory | null;
  customers?: IntakeCustomers | null;
  strategy?: IntakeStrategy | null;
  competition?: IntakeCompetition | null;
  ymylReviewer?: IntakeYmylReviewer | null;

  version: typeof INTAKE_SCHEMA_VERSION;
  updatedAt?: string | null;
}

export const EMPTY_INTAKE: ClientIntake = {
  version: INTAKE_SCHEMA_VERSION,
};
