"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function RevalidateAllSEOButton() {
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleRevalidate = async () => {
    setLoading(true);
    try {
      const { batchGenerateIndustrySeo } = await import("@/lib/seo/industry-seo-generator");
      const result = await batchGenerateIndustrySeo();
      toast({
        title: result.failed === 0 ? "✅ SEO generated" : "⚠️ SEO partially generated",
        description: `${result.successful} succeeded · ${result.failed} failed · ${result.total} total`,
        variant: result.failed === 0 ? "default" : "destructive",
      });
      router.refresh();
    } catch {
      toast({ title: "❌ Failed to generate SEO", variant: "destructive" });
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
