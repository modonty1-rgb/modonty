import { NotFoundContent } from "@/components/shared/not-found/NotFoundContent";

/**
 * `notFound()` from any page under `(site)` lands here, INSIDE the `(site)` layout — which has
 * already mounted `SiteShell`. So the message only, no second shell (see `NotFoundContent`).
 */
export default function SiteNotFound() {
  return <NotFoundContent />;
}
