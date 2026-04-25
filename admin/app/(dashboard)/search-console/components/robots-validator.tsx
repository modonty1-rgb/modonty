"use client";

import { useState, useTransition } from "react";
import { Bot, Loader2, CheckCircle2, XCircle, RefreshCw } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

import {
  fetchRobotsTxtAction,
  checkRobotsPathAction,
} from "../actions/robots-actions";

interface FetchedRobots {
  url: string;
  status: number;
  content: string;
  fetchedAt: string;
}

interface CheckResult {
  allowed: boolean;
  matchedRule?: string;
  matchedUserAgent?: string;
}

const USER_AGENTS = ["Googlebot", "Googlebot-Image", "Googlebot-News", "Bingbot", "*"];

export function RobotsValidator() {
  const { toast } = useToast();
  const [robots, setRobots] = useState<FetchedRobots | null>(null);
  const [path, setPath] = useState("/articles/example");
  const [userAgent, setUserAgent] = useState("Googlebot");
  const [result, setResult] = useState<CheckResult | null>(null);
  const [fetching, startFetch] = useTransition();
  const [checking, startCheck] = useTransition();

  const fetchRobots = () => {
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
        toast({ title: "Fetch failed", description: res.error, variant: "destructive" });
      }
    });
  };

  const runCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!path.trim()) return;
    startCheck(async () => {
      const res = await checkRobotsPathAction(path, userAgent);
      if (res.ok) {
        setResult({
          allowed: res.allowed ?? true,
          matchedRule: res.matchedRule,
          matchedUserAgent: res.matchedUserAgent,
        });
      } else {
        toast({ title: "Check failed", description: res.error, variant: "destructive" });
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
            {robots && (
              <Badge
                variant="secondary"
                className={`text-xs ${robots.status === 200 ? "bg-emerald-500/15 text-emerald-600" : "bg-red-500/15 text-red-600"}`}
              >
                {robots.status}
              </Badge>
            )}
          </div>
          <button
            type="button"
            onClick={fetchRobots}
            disabled={fetching}
            className="text-xs inline-flex items-center gap-1 px-3 py-1.5 rounded-md border hover:bg-muted disabled:opacity-50"
          >
            {fetching ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
            {robots ? "Re-fetch" : "View robots.txt"}
          </button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Test a path — always visible (action self-fetches robots.txt) */}
        <form onSubmit={runCheck} className="space-y-3">
          <div className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider">
            Test a path
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={path}
              onChange={(e) => setPath(e.target.value)}
              placeholder="/articles/example"
              disabled={checking}
              className="flex-1 px-3 py-2 rounded-md border bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
            <select
              value={userAgent}
              onChange={(e) => setUserAgent(e.target.value)}
              disabled={checking}
              className="px-3 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            >
              {USER_AGENTS.map((ua) => (
                <option key={ua} value={ua}>
                  {ua}
                </option>
              ))}
            </select>
            <button
              type="submit"
              disabled={checking || !path.trim()}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-md bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium disabled:opacity-50"
            >
              {checking && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Check
            </button>
          </div>

          {result && (
            <div
              className={`p-3 rounded-md border ${
                result.allowed
                  ? "bg-emerald-500/10 border-emerald-500/20"
                  : "bg-red-500/10 border-red-500/20"
              }`}
            >
              <div
                className={`flex items-center gap-2 font-bold text-sm ${
                  result.allowed ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                }`}
              >
                {result.allowed ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    ALLOWED
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4" />
                    BLOCKED
                  </>
                )}
              </div>
              <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                {result.matchedUserAgent && (
                  <div>
                    <strong>User-agent group:</strong> <span className="font-mono">{result.matchedUserAgent}</span>
                  </div>
                )}
                {result.matchedRule && (
                  <div>
                    <strong>Matched rule:</strong> <span className="font-mono">{result.matchedRule}</span>
                  </div>
                )}
                {!result.matchedRule && (
                  <div>No specific rule matched — default behavior applies.</div>
                )}
              </div>
            </div>
          )}
        </form>

        {/* View raw robots.txt — optional, on demand */}
        {robots && (
          <div className="space-y-2 border-t pt-4">
            <div className="text-xs text-muted-foreground flex items-center gap-2 flex-wrap">
              <span>URL:</span>
              <a href={robots.url} target="_blank" rel="noopener noreferrer" className="font-mono hover:text-foreground">
                {robots.url}
              </a>
              <span>·</span>
              <span>fetched {new Date(robots.fetchedAt).toLocaleTimeString()}</span>
            </div>
            <pre className="p-3 rounded-md border bg-muted/30 text-xs font-mono overflow-x-auto max-h-64 overflow-y-auto leading-relaxed">
              {robots.content || "(empty)"}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
