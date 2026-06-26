import "server-only";

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
