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
  return { containerId, enabled: !!containerId };
}
