import { getDatabaseHealth } from "./actions/database-health";
import { getCollectionSizes } from "./actions/collection-sizes";
import { getBackupInfo } from "./actions/backup-info";
import { DatabasePageShell } from "./components/database-page-shell";

export default async function DatabasePage() {
  const [health, collectionSizes, backup] = await Promise.all([
    getDatabaseHealth(),
    getCollectionSizes(),
    getBackupInfo(),
  ]);

  const isLocal = process.env.NODE_ENV !== "production";

  return (
    <DatabasePageShell
      health={health}
      collectionSizes={collectionSizes}
      backup={backup}
      isLocal={isLocal}
    />
  );
}
