import { SESSION_KEY, type InspectPayload } from "./constants";

/**
 * Store content in sessionStorage and navigate to /inspect.
 * Used by article edit, Generate M/J, and any page that wants to inspect JSON.
 */
export function openInspect(payload: Omit<InspectPayload, "returnUrl"> & { returnUrl?: string }): string {
  const returnUrl = payload.returnUrl ?? (typeof window !== "undefined" ? window.location.pathname + window.location.search : "/");
  sessionStorage.removeItem(SESSION_KEY);
  sessionStorage.setItem(
    SESSION_KEY,
    JSON.stringify({ ...payload, returnUrl } as InspectPayload)
  );
  return `/inspect?from=session&returnUrl=${encodeURIComponent(returnUrl)}`;
}
