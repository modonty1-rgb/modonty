"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { exportArticlesToCSV } from "../actions/export-actions";
import { ArticleFilters } from "../actions/articles-actions";
import { useToast } from "@/hooks/use-toast";

interface ExportButtonProps {
  filters?: ArticleFilters;
}

export function ExportButton({ filters }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const csv = await exportArticlesToCSV(filters);
      
      // Create UTF-8 BOM bytes (0xEF, 0xBB, 0xBF) for proper Arabic character encoding in Excel
      const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
      const encoder = new TextEncoder();
      const csvBytes = encoder.encode(csv);
      
      // Combine BOM with CSV data
      const combinedArray = new Uint8Array(bom.length + csvBytes.length);
      combinedArray.set(bom, 0);
      combinedArray.set(csvBytes, bom.length);
      
      // Create blob with UTF-8 BOM
      const blob = new Blob([combinedArray], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      
      link.setAttribute("href", url);
      link.setAttribute("download", `articles-export-${new Date().toISOString().split("T")[0]}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Success",
        description: "Articles exported successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export articles",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleExport}
      disabled={isExporting}
      size="sm"
    >
      {isExporting ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Exporting...
        </>
      ) : (
        <>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </>
      )}
    </Button>
  );
}
