import "server-only";

/**
 * Shared GTM/GA4 container resolver — used by admin + modonty + console GTMContainer
 * (all server components) via `@modonty/database/lib/gtm/getGTMSettings`.
 */
export interface GTMSettings {
  containerId: string | null;
  enabled: boolean;
}

export function getGTMSettings(): GTMSettings {
  const containerId =
    process.env.NEXT_PUBLIC_GTM_CONTAINER_ID ||
    process.env.NEXT_PUBLIC_GTM_ID ||
    null;
  // Load GTM/GA4 only in production — keep local-dev traffic out of the prod GA4 property.
  // (Decision 2026-06-26. Use a separate dev GA4 property if you need to test tracking locally.)
  const enabled = !!containerId && process.env.NODE_ENV === "production";
  return { containerId, enabled };
}
