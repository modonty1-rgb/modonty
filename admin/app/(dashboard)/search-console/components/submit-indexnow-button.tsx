"use client";

import { useState } from "react";
import { Zap, Loader2, CheckCircle2, XCircle } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { submitAllToIndexNowAction } from "../actions/indexnow-actions";

interface LastRun {
  ok: boolean;
  message: string;
  count: number;
  fetched: number;
  at: string;
}

export function SubmitIndexNowButton() {
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const [last, setLast] = useState<LastRun | null>(null);

  const handleSubmit = async () => {
    setBusy(true);
    const res = await submitAllToIndexNowAction();
    setBusy(false);

    if (res.ok && res.result) {
      const at = new Date().toLocaleString("en-GB", { hour12: false });
      setLast({
        ok: true,
        message: res.result.message,
        count: res.result.submittedCount,
        fetched: res.fetchedCount ?? 0,
        at,
      });
      toast({
        title: "✅ Submitted to IndexNow",
        description: `${res.result.submittedCount} URLs sent to Bing + Yandex + Brave + Seznam + Naver. ${res.result.message}`,
      });
    } else {
      const at = new Date().toLocaleString("en-GB", { hour12: false });
      setLast({
        ok: false,
        message: res.error || res.result?.message || "Unknown error",
        count: 0,
        fetched: res.fetchedCount ?? 0,
        at,
      });
      toast({
        title: "❌ IndexNow failed",
        description: res.error || res.result?.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-base">
          <span className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-violet-600" />
            IndexNow — Bing/Yandex/Brave/Seznam/Naver
          </span>
          {last && (
            <Badge variant={last.ok ? "default" : "destructive"} className="text-xs">
              {last.ok ? (
                <CheckCircle2 className="h-3 w-3 mr-1" />
              ) : (
                <XCircle className="h-3 w-3 mr-1" />
              )}
              {last.ok ? `${last.count} sent` : "Failed"}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Pings the IndexNow API with every URL in your sitemap.xml. Single click → 5 search engines notified instantly
          (covers ChatGPT Search, Copilot, DuckDuckGo, Perplexity, Brave AI).
        </p>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button disabled={busy} className="bg-violet-600 hover:bg-violet-700">
              {busy ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Submit all to IndexNow
                </>
              )}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Submit all sitemap URLs to IndexNow?</AlertDialogTitle>
              <AlertDialogDescription>
                Fetches{" "}
                <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                  https://www.modonty.com/sitemap.xml
                </code>{" "}
                and sends every URL to Bing/Yandex/Brave/Seznam/Naver in a single request. Safe to re-run — IndexNow
                handles duplicates gracefully.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleSubmit} className="bg-violet-600 hover:bg-violet-700">
                Submit
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {last && (
          <div
            className={`rounded-md border p-2 text-xs ${
              last.ok
                ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                : "border-red-200 bg-red-50 text-red-900"
            }`}
          >
            <div className="font-medium">{last.ok ? "Last run succeeded" : "Last run failed"}</div>
            <div className="opacity-80 mt-0.5">
              {last.at} · fetched {last.fetched} URLs · {last.message}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
