import { notFound } from "next/navigation";

import { loadSeoImageGroups } from "../helpers/load-groups";
import { ClientImagesGrid } from "./components/client-images-grid";

// Per-client (or مدوّنتي bucket) image grid. Same grouping source as the main table, so a
// client's summary row and this grid can never diverge.
export const dynamic = "force-dynamic";

export default async function SeoImagesClientPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;
  const key = decodeURIComponent(clientId);

  const groups = await loadSeoImageGroups();
  const group = groups.find((g) => g.key === key);
  if (!group) notFound();

  return (
    <div className="max-w-[1100px] mx-auto space-y-5">
      <ClientImagesGrid
        name={group.name}
        isModonty={group.isModonty}
        avgScore={group.avgScore}
        images={group.images}
      />
    </div>
  );
}
