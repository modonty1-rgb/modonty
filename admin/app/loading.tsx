/**
 * The root boundary shows while the dashboard layout reads its session and badges — before
 * the sidebar exists. It drew four dashboard cards with no sidebar, then the page's own
 * skeleton replaced it inside the real frame: two different skeletons on every full load
 * (Khalid, 28 Sep 2026: «في اكثر من سكيلتون بيتعرض»). Only the background here; the one
 * skeleton the team sees is the page's, inside the sidebar and header.
 */
export default function Loading() {
  return <div className="min-h-screen bg-background" role="status" aria-busy="true" aria-label="Loading" />;
}
