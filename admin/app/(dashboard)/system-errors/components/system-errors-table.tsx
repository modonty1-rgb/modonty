"use client";

import { useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, AlertTriangle, Copy, Check } from "lucide-react";
import { deleteSystemError, clearAllSystemErrors } from "../actions/system-errors-actions";

type SystemError = {
  id: string;
  message: string;
  digest: string | null;
  path: string;
  method: string;
  routePath: string;
  routeType: string;
  source: string;
  category: string | null;
  renderType: string | null;
  device: string | null;
  botName: string | null;
  country: string | null;
  city: string | null;
  userAgent: string | null;
  createdAt: Date;
};

const routeTypeBadge: Record<string, string> = {
  render: "bg-blue-100 text-blue-700",
  route: "bg-purple-100 text-purple-700",
  action: "bg-orange-100 text-orange-700",
  proxy: "bg-gray-100 text-gray-700",
};

const DEVICE_ICON: Record<string, string> = {
  mobile: "📱",
  tablet: "📲",
  desktop: "💻",
  bot: "🤖",
};

// Paths arrive percent-encoded (e.g. /clients/%D8%AF...) — decode so Arabic slugs
// read naturally. Falls back to the raw value if the sequence is malformed.
function decodePath(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

// source is tagged "<app>:<renderSource>" (e.g. "modonty:server"). Split so the
// origin app shows as its own badge and you never have to guess where it failed.
const appBadge: Record<string, string> = {
  modonty: "bg-emerald-100 text-emerald-700",
  admin: "bg-blue-100 text-blue-700",
  console: "bg-violet-100 text-violet-700",
};
function parseSource(source: string): { app: string; detail: string } {
  const i = source.indexOf(":");
  if (i === -1) return { app: "unknown", detail: source };
  return { app: source.slice(0, i), detail: source.slice(i + 1) };
}

// Everything you'd paste into a GitHub issue or a search — one block, ready to copy.
function buildCopyText(e: SystemError): string {
  const { app, detail } = parseSource(e.source);
  const geo = [e.country, e.city].filter(Boolean).join(" · ");
  return [
    `[${(e.category ?? "app").toUpperCase()}] ${e.message}`,
    `app: ${app}:${detail}`,
    `${e.method} ${decodePath(e.path)}`,
    `routeType: ${e.routeType} | routePath: ${decodePath(e.routePath)}${e.renderType ? ` | renderType: ${e.renderType}` : ""}`,
    e.device ? `device: ${e.device}${e.botName ? ` (${e.botName})` : ""}${geo ? ` | geo: ${geo}` : ""}` : geo ? `geo: ${geo}` : "",
    e.digest ? `digest: ${e.digest}` : "",
    e.userAgent ? `UA: ${e.userAgent}` : "",
    new Date(e.createdAt).toISOString(),
  ].filter(Boolean).join("\n");
}

function CopyButton({ error }: { error: SystemError }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      variant="ghost"
      size="icon"
      title="Copy full error"
      className="h-7 w-7 text-muted-foreground hover:text-foreground shrink-0"
      onClick={() => {
        navigator.clipboard.writeText(buildCopyText(error));
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
    >
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
    </Button>
  );
}

export function SystemErrorsTable({ errors }: { errors: SystemError[] }) {
  const [list, setList] = useState(errors);
  const [hideFramework, setHideFramework] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteSystemError(id);
      setList((prev) => prev.filter((e) => e.id !== id));
    });
  }

  function handleClearAll() {
    startTransition(async () => {
      await clearAllSystemErrors();
      setList([]);
    });
  }

  const frameworkCount = list.filter((e) => e.category === "framework").length;
  const appCount = list.length - frameworkCount;
  const visible = hideFramework ? list.filter((e) => e.category !== "framework") : list;

  if (list.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
        <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
          <AlertTriangle className="h-6 w-6 text-emerald-600" />
        </div>
        <p className="text-sm font-medium text-muted-foreground">No errors logged</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="font-semibold text-red-600 dark:text-red-400">{appCount} app</span>
          <span className="text-muted-foreground/40">·</span>
          <span>{frameworkCount} framework</span>
          {frameworkCount > 0 && (
            <button
              onClick={() => setHideFramework((v) => !v)}
              className="ms-1 rounded-md border px-2 py-0.5 text-[11px] hover:bg-muted"
            >
              {hideFramework ? "Show framework" : "Hide framework"}
            </button>
          )}
        </div>
        <Button variant="destructive" size="sm" onClick={handleClearAll} disabled={isPending} className="gap-1.5">
          <Trash2 className="h-3.5 w-3.5" />
          Clear All
        </Button>
      </div>

      <div className="rounded-md border divide-y">
        {visible.map((error) => {
          const { app, detail } = parseSource(error.source);
          const isFramework = error.category === "framework";
          const geo = [error.country, error.city].filter(Boolean).join(" · ");
          return (
            <div key={error.id} className={`p-4 transition-colors ${isFramework ? "bg-muted/20 hover:bg-muted/30" : "hover:bg-muted/30"}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0 space-y-1.5">
                  {/* message */}
                  <p className={`text-sm font-medium leading-snug ${isFramework ? "text-muted-foreground" : "text-destructive"}`}>
                    {error.message}
                  </p>

                  {/* meta row */}
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    {isFramework ? (
                      <Badge className="text-[10px] px-1.5 py-0 font-semibold border-0 uppercase bg-amber-100 text-amber-800" title="Next/React internal — not our bug, don't chase">
                        framework
                      </Badge>
                    ) : (
                      <Badge className="text-[10px] px-1.5 py-0 font-semibold border-0 uppercase bg-red-100 text-red-700">
                        app
                      </Badge>
                    )}
                    <Badge className={`text-[10px] px-1.5 py-0 font-medium border-0 uppercase ${appBadge[app] ?? "bg-gray-100 text-gray-700"}`}>
                      {app}
                    </Badge>
                    <span dir="ltr" className="font-mono bg-muted px-1.5 py-0.5 rounded text-xs break-all">
                      {error.method} {decodePath(error.path)}
                    </span>
                    <Badge className={`text-[10px] px-1.5 py-0 font-normal border-0 ${routeTypeBadge[error.routeType] ?? "bg-gray-100 text-gray-700"}`}>
                      {error.routeType}
                    </Badge>
                    {error.renderType && (
                      <span className="text-[10px] font-mono text-muted-foreground/60">{error.renderType}</span>
                    )}
                    <span dir="ltr" className="text-muted-foreground/60 break-all">{decodePath(error.routePath)}</span>
                    <span className="text-muted-foreground/40">{detail}</span>
                  </div>

                  {/* device + geo row */}
                  {(error.device || geo) && (
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground/80">
                      {error.device && (
                        <span className="inline-flex items-center gap-1">
                          {DEVICE_ICON[error.device] ?? "❔"} {error.device}
                          {error.botName && <span className="text-muted-foreground/60">({error.botName})</span>}
                        </span>
                      )}
                      {geo && <span className="inline-flex items-center gap-1">🌍 {geo}</span>}
                    </div>
                  )}

                  {/* digest */}
                  {error.digest && (
                    <p className="text-[11px] font-mono text-muted-foreground/70">digest: {error.digest}</p>
                  )}

                  {/* time */}
                  <p className="text-[11px] text-muted-foreground/50">
                    {new Date(error.createdAt).toLocaleString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>

                <div className="flex flex-col items-center gap-1 shrink-0">
                  <CopyButton error={error} />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => handleDelete(error.id)}
                    disabled={isPending}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
