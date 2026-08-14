/**
 * Last-resort brand name — NOT the source of truth.
 *
 * The site name lives in `Settings.siteName` and is edited at /settings/site. Anything that
 * reaches Google (JSON-LD entity name, og:site_name) must read it from there; this constant
 * only fills in for client components that have no Settings in hand, and for previews.
 *
 * It used to be called SITE_NAME and spelled the brand «مودونتي» — a misspelling of
 * «مدونتي» — while `Settings.siteName` held the correct value all along. The article
 * knowledge-graph generator imported it instead of the Settings value it was already being
 * handed, so all 117 published articles shipped a WebSite entity under the wrong name
 * (measured 2026-08-15, SOT5). Renamed so the next reader cannot mistake it for authority.
 */
export const SITE_NAME_FALLBACK = "Modonty";
