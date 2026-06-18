import { getDatabaseHealth } from "./actions/database-health";
import { getCollectionSizes } from "./actions/collection-sizes";
import { getBackupInfo } from "./actions/backup-info";
import { getAtlasReport } from "@/lib/atlas/atlas-client";
import { DatabasePageShell } from "./components/database-page-shell";

export default async function DatabasePage() {
  const [health, collectionSizes, backup, atlas] = await Promise.all([
    getDatabaseHealth(),
    getCollectionSizes(),
    getBackupInfo(),
    getAtlasReport(),
  ]);

  const isLocal = process.env.NODE_ENV !== "production";

  return (
    <DatabasePageShell
      health={health}
      collectionSizes={collectionSizes}
      backup={backup}
      atlas={atlas}
      isLocal={isLocal}
    />
  );
}
