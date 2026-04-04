"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export function RevalidateAllSEOButton() {
  const [loading, setLoading] = useState(false);

  const handleRevalidate = async () => {
    setLoading(true);
    try {
      const { batchGenerateIndustrySeo } = await import("@/lib/seo/industry-seo-generator");
      const result = await batchGenerateIndustrySeo();
      alert(`Done: ${result.successful} succeeded, ${result.failed} failed out of ${result.total}`);
      window.location.reload();
    } catch {
      alert("Failed to generate SEO");
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
      className="text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10"
      aria-label="Revalidate All SEO"
    >
      <RefreshCw className={`h-4 w-4 me-1.5 ${loading ? "animate-spin" : ""}`} />
      {loading ? "Generating…" : "Revalidate All"}
    </Button>
  );
}
