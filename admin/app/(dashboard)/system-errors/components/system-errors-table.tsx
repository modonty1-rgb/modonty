"use client";

import { useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, AlertTriangle } from "lucide-react";
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
  createdAt: Date;
};

const routeTypeBadge: Record<string, string> = {
  render: "bg-blue-100 text-blue-700",
  route: "bg-purple-100 text-purple-700",
  action: "bg-orange-100 text-orange-700",
  proxy: "bg-gray-100 text-gray-700",
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

export function SystemErrorsTable({ errors }: { errors: SystemError[] }) {
  const [list, setList] = useState(errors);
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
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{list.length} error{list.length !== 1 ? "s" : ""} logged</p>
        <Button
          variant="destructive"
          size="sm"
          onClick={handleClearAll}
          disabled={isPending}
          className="gap-1.5"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Clear All
        </Button>
      </div>

      <div className="rounded-md border divide-y">
        {list.map((error) => (
          <div key={error.id} className="p-4 hover:bg-muted/30 transition-colors">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0 space-y-1.5">
                {/* message */}
                <p className="text-sm font-medium text-destructive leading-snug">
                  {error.message}
                </p>

                {/* meta row */}
                {(() => {
                  const { app, detail } = parseSource(error.source);
                  return (
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <Badge
                        className={`text-[10px] px-1.5 py-0 font-medium border-0 uppercase ${appBadge[app] ?? "bg-gray-100 text-gray-700"}`}
                      >
                        {app}
                      </Badge>
                      <span dir="ltr" className="font-mono bg-muted px-1.5 py-0.5 rounded text-xs break-all">
                        {error.method} {decodePath(error.path)}
                      </span>
                      <Badge
                        className={`text-[10px] px-1.5 py-0 font-normal border-0 ${routeTypeBadge[error.routeType] ?? "bg-gray-100 text-gray-700"}`}
                      >
                        {error.routeType}
                      </Badge>
                      <span dir="ltr" className="text-muted-foreground/60 break-all">{decodePath(error.routePath)}</span>
                      <span className="text-muted-foreground/40">{detail}</span>
                    </div>
                  );
                })()}

                {/* digest */}
                {error.digest && (
                  <p className="text-[11px] font-mono text-muted-foreground/70">
                    digest: {error.digest}
                  </p>
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

              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
                onClick={() => handleDelete(error.id)}
                disabled={isPending}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
