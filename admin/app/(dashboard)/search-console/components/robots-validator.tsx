"use client";

import { useState, useTransition } from "react";
import {
  Bot,
  Loader2,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

import {
  fetchRobotsTxtAction,
  runRobotsAuditAction,
  type AuditResult,
} from "../actions/robots-actions";

import { RobotsAuditDialog } from "./robots-audit-dialog";
import { RobotsTxtDialog } from "./robots-txt-dialog";

interface FetchedRobots {
  url: string;
  status: number;
  content: string;
  fetchedAt: string;
}

interface AuditState {
  results: AuditResult[];
  passed: number;
  failed: number;
  fetchedAt: string;
}

export function RobotsValidator() {
  const { toast } = useToast();
  const [robots, setRobots] = useState<FetchedRobots | null>(null);
  const [audit, setAudit] = useState<AuditState | null>(null);
  const [fetching, startFetch] = useTransition();
  const [auditing, startAudit] = useTransition();
  const [auditOpen, setAuditOpen] = useState(false);
  const [robotsOpen, setRobotsOpen] = useState(false);

  const runAudit = () => {
    setAuditOpen(true);
    startAudit(async () => {
      const res = await runRobotsAuditAction();
      if (res.ok && res.results) {
        setAudit({
          results: res.results,
          passed: res.passed ?? 0,
          failed: res.failed ?? 0,
          fetchedAt: res.fetchedAt ?? new Date().toISOString(),
        });
        if ((res.failed ?? 0) === 0) {
          toast({
            title: "Audit passed",
            description: `All ${res.passed} checks ok — robots.txt is configured correctly.`,
          });
        } else {
          toast({
            title: `${res.failed} issue${res.failed === 1 ? "" : "s"} found`,
            description: "Review the failed checks in the dialog.",
            variant: "destructive",
          });
        }
      } else {
        setAuditOpen(false);
        toast({ title: "Audit failed", description: res.error, variant: "destructive" });
      }
    });
  };

  const viewRobots = () => {
    setRobotsOpen(true);
    startFetch(async () => {
      const res = await fetchRobotsTxtAction();
      if (res.ok && res.content !== undefined) {
        setRobots({
          url: res.url ?? "",
          status: res.status ?? 0,
          content: res.content,
          fetchedAt: res.fetchedAt ?? new Date().toISOString(),
        });
      } else {
        setRobotsOpen(false);
        toast({ title: "Fetch failed", description: res.error, variant: "destructive" });
      }
    });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <Bot className="h-4 w-4 text-violet-500" />
            <CardTitle className="text-base">Robots.txt</CardTitle>
            {audit && (
              <Badge
                className={`text-xs ${
                  audit.failed === 0
                    ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
                    : "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/20"
                }`}
              >
                {audit.failed === 0 ? (
                  <>
                    <CheckCircle2 className="h-3 w-3 me-1" />
                    {audit.passed}/{audit.results.length} pass
                  </>
                ) : (
                  <>
                    <XCircle className="h-3 w-3 me-1" />
                    {audit.failed} failed
                  </>
                )}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={runAudit}
              disabled={auditing}
              className="text-xs inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-violet-600 hover:bg-violet-700 text-white font-medium disabled:opacity-50"
            >
              {auditing ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <ShieldCheck className="h-3 w-3" />
              )}
              {audit ? "Re-run audit" : "Run robots audit"}
            </button>
            <button
              type="button"
              onClick={viewRobots}
              disabled={fetching}
              className="text-xs inline-flex items-center gap-1 px-3 py-1.5 rounded-md border hover:bg-muted disabled:opacity-50"
            >
              {fetching ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
              View robots.txt
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Click <strong>Run robots audit</strong> to test 19 critical paths automatically — public pages, admin areas, AI search bots, and AI training bots. Click{" "}
          <strong>View robots.txt</strong> to see the live file content.
        </p>
        {audit && (
          <p className="text-xs text-muted-foreground mt-2 italic">
            Last audit: {audit.passed}/{audit.results.length} passed at{" "}
            {new Date(audit.fetchedAt).toLocaleTimeString("en-US")}.
          </p>
        )}
      </CardContent>

      <RobotsAuditDialog
        open={auditOpen}
        onOpenChange={setAuditOpen}
        loading={auditing}
        audit={audit}
      />
      <RobotsTxtDialog
        open={robotsOpen}
        onOpenChange={setRobotsOpen}
        loading={fetching}
        robots={robots}
      />
    </Card>
  );
}
