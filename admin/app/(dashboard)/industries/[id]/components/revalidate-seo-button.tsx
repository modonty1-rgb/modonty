"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface Props {
  industryId: string;
}

export function RevalidateSEOButton({ industryId }: Props) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const handleRevalidate = async () => {
    setLoading(true);
    setStatus("idle");
    try {
      const { generateAndSaveIndustrySeo } = await import("@/lib/seo/industry-seo-generator");
      const result = await generateAndSaveIndustrySeo(industryId);
      if (result.success) {
        setStatus("success");
        setTimeout(() => window.location.reload(), 800);
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleRevalidate}
      disabled={loading}
      className={
        status === "success" ? "text-emerald-500 hover:text-emerald-500 hover:bg-emerald-500/10" :
        status === "error" ? "text-destructive hover:text-destructive hover:bg-destructive/10" :
        "text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10"
      }
      aria-label="Revalidate SEO"
    >
      <RefreshCw className={`h-4 w-4 me-1.5 ${loading ? "animate-spin" : ""}`} />
      {loading ? "Generating…" : status === "success" ? "Done" : status === "error" ? "Failed" : "Revalidate SEO"}
    </Button>
  );
}
