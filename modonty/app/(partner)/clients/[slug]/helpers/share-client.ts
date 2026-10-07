/** Record a share of the partner page — fire-and-forget, keepalive so it survives navigation. */
export function shareClient(clientSlug: string, platform: "OTHER" | "COPY_LINK") {
  fetch(`/clients/${encodeURIComponent(clientSlug)}/api/share`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ platform }),
    keepalive: true,
  }).catch(() => {});
}
