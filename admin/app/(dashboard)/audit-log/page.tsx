import Link from "next/link";
import { X } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { getAuditLogs } from "./actions/audit-log-actions";
import { getUserById } from "../users/actions/users-actions";
import { AuditLogTable } from "./components/audit-log-table";

interface AuditLogPageProps {
  searchParams: Promise<{ userId?: string }>;
}

export default async function AuditLogPage({ searchParams }: AuditLogPageProps) {
  const { userId } = await searchParams;

  const [rows, actor] = await Promise.all([
    getAuditLogs({ userId }),
    userId ? getUserById(userId) : Promise.resolve(null),
  ]);

  return (
    <div className="max-w-[1200px] mx-auto">
      <PageHeader
        title="Audit Log"
        description="Who did what — every sensitive action, newest first."
      />

      {userId && (
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border bg-muted/40 px-3 py-1 text-sm">
          <span className="text-muted-foreground">Activity by</span>
          <span className="font-medium">{actor?.name || actor?.email || userId}</span>
          <Link
            href="/audit-log"
            className="ms-1 inline-flex items-center rounded-full p-0.5 text-muted-foreground hover:bg-background hover:text-foreground"
            aria-label="Clear filter"
          >
            <X className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}

      <AuditLogTable rows={rows} hideWho={Boolean(userId)} />
    </div>
  );
}
