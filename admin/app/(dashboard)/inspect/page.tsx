"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronLeft, Loader2 } from "lucide-react";
import dynamic from "next/dynamic";
import { DataSourceCard } from "./components/data-source-card";
import { SESSION_KEY, type InspectPayload } from "./helpers/constants";
import {
  buildSourceInfoFromPayload,
  countNodesFromJsonString,
  extractSeoInsights,
  getItemListCountFromJson,
} from "./helpers/source-info";
import { SeoInsightsCard } from "./components/seo-insights-card";

const JsonTreeViewer = dynamic(
  () =>
    import("./components/json-tree-viewer").then((mod) => mod.JsonTreeViewer),
  { ssr: false }
);

function isInspectPayload(v: unknown): v is InspectPayload {
  return (
    v != null &&
    typeof v === "object" &&
    "source" in v &&
    "content" in v &&
    typeof (v as InspectPayload).source === "string" &&
    typeof (v as InspectPayload).content === "string"
  );
}

function InspectPageContent() {
  const searchParams = useSearchParams();
  const fromSession = searchParams.get("from") === "session";
  const returnUrlParam = searchParams.get("returnUrl") ?? "/settings";

  const [data, setData] = useState<string | null>(null);
  const [sourceInfo, setSourceInfo] = useState<ReturnType<typeof buildSourceInfoFromPayload> | null>(null);
  const [title, setTitle] = useState("Inspect");
  const [returnUrl, setReturnUrl] = useState(returnUrlParam);
  const [copied, setCopied] = useState(false);
  const [ready, setReady] = useState(!fromSession);
  const consumedRef = useRef(false);

  const handleCopy = async () => {
    if (!data) return;
    try {
      await navigator.clipboard.writeText(data);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = data;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  useEffect(() => {
    if (!fromSession) {
      consumedRef.current = false;
      setData(null);
      setSourceInfo(null);
      setTitle("Inspect");
      setReturnUrl(returnUrlParam);
      setReady(true);
      return;
    }

    if (consumedRef.current) {
      return;
    }

    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) {
      setData(null);
      setSourceInfo(null);
      setTitle("Inspect");
      setReady(true);
      return;
    }

    try {
      const parsed = JSON.parse(raw) as unknown;
      if (!isInspectPayload(parsed)) {
        setData(null);
        setSourceInfo(null);
        setTitle("Inspect");
        setReady(true);
        return;
      }

      consumedRef.current = true;
      const content = parsed.content ?? "";
      if (process.env.NODE_ENV === "development") {
        const stored = sessionStorage.getItem("inspect-verify");
        const fingerprint = `${content.length}:${content.slice(0, 80).replace(/\s/g, "")}`;
        const match = stored === fingerprint;
        console.log("[Inspect] Data verification:", match ? "PASS – content matches preview" : "FAIL – content mismatch", { length: content.length });
        sessionStorage.removeItem("inspect-verify");
      }
      setData(content);
      setSourceInfo(buildSourceInfoFromPayload(parsed));
      setTitle(parsed.source);
      setReturnUrl(parsed.returnUrl ?? returnUrlParam);
      sessionStorage.removeItem(SESSION_KEY);
    } catch {
      setData(null);
      setSourceInfo(null);
      setTitle("Inspect");
    }
    setReady(true);
  }, [fromSession, returnUrlParam]);

  useEffect(() => {
    document.title = `${title} | Inspect | Modonty Admin`;
    return () => {
      document.title = "Modonty Admin - Dashboard";
    };
  }, [title]);

  const decodedReturn = (returnUrl && decodeURIComponent(returnUrl)) || "/settings";
  const backHref = decodedReturn.startsWith("/") ? decodedReturn : `/${decodedReturn}`;
  const seoInsights = data && data !== "" ? extractSeoInsights(data) : null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="shrink-0 border-b px-6 py-3 flex items-center gap-4">
        <Link
          href={backHref}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </Link>
        <h1 className="text-base font-semibold truncate">{title}</h1>
      </header>

      <main className="flex-1 min-h-0 overflow-auto p-6 space-y-4">
        {fromSession && !ready && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {ready && !fromSession && (
          <p className="text-muted-foreground text-sm">
            Click Inspect from a data block to view content.
          </p>
        )}

        {ready && fromSession && !data && (
          <p className="text-muted-foreground text-sm">Nothing to display.</p>
        )}

        {ready && fromSession && (data != null && data !== "") && sourceInfo && (
          <>
            <DataSourceCard
              sourceInfo={sourceInfo}
              onCopy={handleCopy}
              hasData
              copied={copied}
              dataLength={data?.length ?? 0}
              nodeCount={countNodesFromJsonString(data)}
              itemCount={getItemListCountFromJson(data)}
            />
            {seoInsights?.type !== "unknown" && seoInsights && (
              <SeoInsightsCard insights={seoInsights} />
            )}
            <JsonTreeViewer data={data} className="min-h-[200px]" />
          </>
        )}
      </main>
    </div>
  );
}

export default function InspectPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <InspectPageContent />
    </Suspense>
  );
}
