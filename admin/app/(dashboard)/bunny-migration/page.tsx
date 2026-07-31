import { CloudinaryMigrationCard } from "./components/cloudinary-migration-card";
import { StorageInventoryCard } from "./components/storage-inventory-card";

/**
 * TEMPORARY ROUTE — Cloudinary → Bunny migration.
 *
 * Deliberately self-contained: the page, its components and its server actions all live
 * inside `app/(dashboard)/bunny-migration/`, and nothing outside the folder imports from it.
 * The migration runs ONCE; when the platform is fully on Bunny and verified, deleting this
 * folder plus the single sidebar entry removes the whole feature with zero leftovers and
 * zero risk of breaking anything else (decision: Khalid, 2026-07-31).
 *
 * It used to sit on `/database`, where it competed for attention with the recurring
 * maintenance tools — a one-time operation has no business living next to them.
 */
export default function BunnyMigrationPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Cloudinary → Bunny</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          One-time migration. This page is temporary and will be deleted once every asset is on
          Bunny and verified.
        </p>
      </div>
      <StorageInventoryCard />
      <CloudinaryMigrationCard />
    </div>
  );
}
