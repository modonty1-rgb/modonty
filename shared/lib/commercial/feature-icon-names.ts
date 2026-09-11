import * as registry from "../icons";

/**
 * The closed list of icon names a commercial feature may reference — derived from the
 * registry's exports, never copied by hand, so adding an icon to `shared/lib/icons.ts`
 * is the ONLY step (PAY-Q11: how a feature is drawn stays in code; the admin picks a name).
 *
 * `CommercialFeature.icon` stores one of these strings; the save action rejects anything
 * else so a typo cannot reach the /pay card and render nothing.
 */
export const FEATURE_ICON_NAMES: readonly string[] = Object.keys(registry)
  .filter((name) => /^Icon[A-Z]/.test(name))
  .sort((a, b) => a.localeCompare(b));

export function isFeatureIconName(value: unknown): value is string {
  return typeof value === "string" && FEATURE_ICON_NAMES.includes(value);
}
