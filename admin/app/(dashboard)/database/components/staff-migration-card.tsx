"use client";

import { useEffect, useState, useTransition } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Users, ShieldCheck, ArrowRightLeft, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import {
  getStaffMigrationStats,
  migrateAdminsToStaff,
  type StaffMigrationStats,
} from "../actions/migrate-admins-to-staff";

// One-time staff migration control. Copies admins (users role=ADMIN) into the
// staff collection preserving _id. COPY not move — the users rows are kept until
// login from staff is verified in production. Idempotent, safe to re-run.
export function StaffMigrationCard() {
  const { toast } = useToast();
  const [stats, setStats] = useState<StaffMigrationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();

  const refresh = () => {
    getStaffMigrationStats()
      .then(setStats)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    refresh();
  }, []);

  const runMigration = () => {
    setConfirming(false);
    startTransition(async () => {
      const r = await migrateAdminsToStaff();
      if (r.success) {
        toast({
          title: `Copied ${r.copied} admin${r.copied === 1 ? "" : "s"} to staff`,
          description:
            `${r.skipped} already present` + (r.failed > 0 ? ` · ${r.failed} failed` : ""),
          variant: r.failed > 0 ? "destructive" : "default",
        });
      } else {
        toast({ title: "Migration failed", description: r.error, variant: "destructive" });
      }
      refresh();
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-4 flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading staff migration status…
        </CardContent>
      </Card>
    );
  }

  if (!stats) return null;

  const allDone = stats.pending === 0 && stats.adminsInUsers > 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Staff Migration
        </h2>
        <Badge variant={allDone ? "secondary" : "destructive"} className="text-xs font-normal">
          {allDone ? "complete" : `${stats.pending} pending`}
        </Badge>
      </div>
      <Card>
        <CardContent className="pt-4 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <ArrowRightLeft className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium">
                  Copy admins from <code className="text-xs">users</code> to{" "}
                  <code className="text-xs">staff</code>
                </p>
                <p className="text-xs text-muted-foreground">
                  Preserves each <code className="text-[11px]">_id</code> so every existing reference
                  keeps resolving. <b>Copy, not move</b> — the <code className="text-[11px]">users</code>{" "}
                  rows are kept until login from <code className="text-[11px]">staff</code> is verified
                  live. Idempotent.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 border-t pt-3 text-center">
            <div>
              <div className="flex items-center justify-center gap-1 text-muted-foreground">
                <Users className="h-3.5 w-3.5" />
                <span className="text-[11px]">admins in users</span>
              </div>
              <p className="text-lg font-semibold tabular-nums">{stats.adminsInUsers}</p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-1 text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span className="text-[11px]">already in staff</span>
              </div>
              <p className="text-lg font-semibold tabular-nums">{stats.alreadyInStaff}</p>
            </div>
            <div>
              <span className="text-[11px] text-muted-foreground">pending</span>
              <p
                className={
                  "text-lg font-semibold tabular-nums " +
                  (stats.pending > 0 ? "text-yellow-600 dark:text-yellow-400" : "")
                }
              >
                {stats.pending}
              </p>
            </div>
          </div>

          {allDone ? (
            <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 border-t pt-3">
              <CheckCircle2 className="h-4 w-4" /> All admins are in the staff collection.
            </div>
          ) : confirming ? (
            <div className="flex items-center gap-2 border-t pt-3">
              <Button
                size="sm"
                variant="destructive"
                disabled={isPending}
                className="h-8 text-xs flex-1"
                onClick={runMigration}
              >
                {isPending ? <Loader2 className="h-3 w-3 animate-spin me-1" /> : null}
                Confirm — copy {stats.pending} to staff
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={isPending}
                className="h-8 text-xs"
                onClick={() => setConfirming(false)}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              variant="outline"
              disabled={isPending || stats.adminsInUsers === 0}
              className="w-full h-8 text-xs border-t"
              onClick={() => setConfirming(true)}
            >
              <ArrowRightLeft className="h-3 w-3 me-1" />
              Migrate {stats.pending} admin{stats.pending === 1 ? "" : "s"} to staff
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
