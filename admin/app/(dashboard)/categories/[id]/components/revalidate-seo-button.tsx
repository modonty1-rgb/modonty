"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface Props {
  categoryId: string;
}

export function RevalidateSEOButton({ categoryId }: Props) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const handleRevalidate = async () => {
    setLoading(true);
    setStatus("idle");
    try {
      const { generateAndSaveCategorySeo } = await import("@/lib/seo/category-seo-generator");
      const result = await generateAndSaveCategorySeo(categoryId);
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
      variant="outline"
      size="sm"
      onClick={handleRevalidate}
      disabled={loading}
      className={
        status === "success" ? "border-green-500 text-green-600" :
        status === "error" ? "border-red-500 text-red-600" : ""
      }
    >
      <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
      {loading ? "Generating..." : status === "success" ? "✅ Done" : status === "error" ? "❌ Failed" : "Revalidate SEO"}
    </Button>
  );
}
