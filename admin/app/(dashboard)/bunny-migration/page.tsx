import { CloudinaryMigrationCard } from "./components/cloudinary-migration-card";
import { StorageInventoryCard } from "./components/storage-inventory-card";
import { LinkCoreMediaCard } from "./components/link-core-media-card";

/**
 * TEMPORARY ROUTE — Cloudinary → Bunny migration.
 *
 * Deliberately self-contained: the page, its components and its server actions all live
 * inside `app/(dashboard)/bunny-migration/`, and nothing outside the folder imports from it.
 * The migration runs ONCE; when the platform is fully on Bunny and verified, deleting this
 * folder plus the single sidebar entry removes the whole feature with zero leftovers and
 * zero risk of breaking anything else (decision: Khalid, 2026-07-31).
 *
 * Order = Khalid's staged plan (2026-08-01), compact — everything visible at once:
 * Sync (header button) → wipe → 4 migration tasks → core linking.
 */

export default function BunnyMigrationPage() {
  return (
    <div className="space-y-3">
      <div dir="rtl" className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h1 className="text-xl font-bold">الترحيل: Cloudinary ← Bunny</h1>
        <p className="text-xs text-muted-foreground">
          صفحة مؤقتة · الترتيب = الخطة: Sync (زرّ الهيدر) ← التصفير ← التاسكات ١-٤ ← التمليك
        </p>
      </div>

      <StorageInventoryCard />
      <CloudinaryMigrationCard />
      <LinkCoreMediaCard />
    </div>
  );
}
