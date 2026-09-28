import { notFound } from "next/navigation";

/**
 * `/modonty/<sector>` — was the «قريباً» placeholder for sectors without a page. Since 28 Sep 2026
 * all six sectors have their own folder, so nothing is left for it: every slug that reaches here is
 * unknown. An empty `generateStaticParams` fails the build under Cache Components, so it answers
 * 404 without one. Delete this folder — the session could not (file deletion was not permitted).
 */
export default function UnknownSectorPage() {
  notFound();
}
