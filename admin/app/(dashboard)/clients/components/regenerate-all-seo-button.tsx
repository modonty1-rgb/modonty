"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { generateClientSEO } from "../actions/clients-actions/generate-client-seo";
import type { ClientForList } from "../actions/clients-actions/types";

interface RegenerateAllSeoButtonProps {
  clients: ClientForList[];
}

type ClientStatus = "pending" | "processing" | "success" | "error";

interface ClientProgress {
  id: string;
  name: string;
  status: ClientStatus;
  error?: string;
}

export function RegenerateAllSeoButton({ clients }: RegenerateAllSeoButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState<ClientProgress[]>([]);
  const [current, setCurrent] = useState(0);

  const handleStart = async () => {
    const initial: ClientProgress[] = clients.map((c) => ({
      id: c.id,
      name: c.name,
      status: "pending",
    }));
    setProgress(initial);
    setCurrent(0);
    setIsRunning(true);

    for (let i = 0; i < clients.length; i++) {
      const client = clients[i];
      setCurrent(i + 1);

      setProgress((prev) =>
        prev.map((p) =>
          p.id === client.id ? { ...p, status: "processing" } : p
        )
      );

      const result = await generateClientSEO(client.id);

      setProgress((prev) =>
        prev.map((p) =>
          p.id === client.id
            ? {
                ...p,
                status: result.success ? "success" : "error",
                error: result.success ? undefined : result.error,
              }
            : p
        )
      );
    }

    setIsRunning(false);
  };

  const handleClose = () => {
    if (isRunning) return;
    setIsOpen(false);
    setProgress([]);
    setCurrent(0);
  };

  const done = progress.filter((p) => p.status === "success").length;
  const errors = progress.filter((p) => p.status === "error").length;
  const percentage = progress.length > 0 ? Math.round((current / progress.length) * 100) : 0;

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="gap-2 text-xs"
        onClick={() => setIsOpen(true)}
      >
        <RefreshCw className="h-3.5 w-3.5" />
        Regenerate SEO
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-background border rounded-lg w-full max-w-md mx-4 overflow-hidden">

        {/* Header */}
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold">Regenerate SEO Cache</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isRunning
                ? `Processing ${current} of ${clients.length}...`
                : progress.length === 0
                ? `${clients.length} clients will be processed`
                : `Done — ${done} success · ${errors} failed`}
            </p>
          </div>
          {!isRunning && progress.length > 0 && (
            <button
              onClick={handleClose}
              className="text-muted-foreground hover:text-foreground text-xs"
            >
              Close
            </button>
          )}
        </div>

        {/* Progress bar */}
        {progress.length > 0 && (
          <div className="px-5 pt-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
              <span>{percentage}%</span>
              <span>{current}/{progress.length}</span>
            </div>
            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-foreground rounded-full transition-all duration-300"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Client list */}
        <div className="px-5 py-3 max-h-64 overflow-y-auto space-y-1">
          {progress.length === 0 ? (
            <p className="text-xs text-muted-foreground py-2">
              This will regenerate nextjsMetadata and jsonLdStructuredData
              for all {clients.length} clients. Google reads this data directly.
            </p>
          ) : (
            progress.map((p) => (
              <div key={p.id} className="flex items-center gap-2.5 py-1">
                {p.status === "pending" && (
                  <div className="h-3.5 w-3.5 rounded-full border border-muted-foreground/30 shrink-0" />
                )}
                {p.status === "processing" && (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground shrink-0" />
                )}
                {p.status === "success" && (
                  <CheckCircle2 className="h-3.5 w-3.5 text-foreground shrink-0" />
                )}
                {p.status === "error" && (
                  <XCircle className="h-3.5 w-3.5 text-destructive shrink-0" />
                )}
                <span
                  className={`text-xs truncate ${
                    p.status === "pending"
                      ? "text-muted-foreground"
                      : p.status === "error"
                      ? "text-destructive"
                      : "text-foreground"
                  }`}
                >
                  {p.name}
                </span>
                {p.status === "error" && p.error && (
                  <span className="text-[10px] text-destructive/70 truncate ml-auto shrink-0 max-w-[120px]">
                    {p.error}
                  </span>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t flex justify-end gap-2">
          {!isRunning && progress.length === 0 && (
            <>
              <Button variant="outline" size="sm" onClick={handleClose}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleStart}>
                <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                Start
              </Button>
            </>
          )}
          {isRunning && (
            <Button size="sm" disabled>
              <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
              Running...
            </Button>
          )}
          {!isRunning && progress.length > 0 && (
            <Button size="sm" onClick={handleClose}>
              Done
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

