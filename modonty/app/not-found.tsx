import { SiteShell } from "@/app/layout/components/SiteShell";
import { NotFoundContent } from "@/components/shared/not-found/NotFoundContent";

/**
 * The not-found for URLs that match NO route. The root layout carries no chrome, so this one
 * mounts modonty's shell itself. A `notFound()` thrown from a modonty page is caught earlier, by
 * `app/(site)/not-found.tsx`, which already sits inside the shell.
 */
export default function GlobalNotFound() {
  return (
    <SiteShell>
      <NotFoundContent />
    </SiteShell>
  );
}
