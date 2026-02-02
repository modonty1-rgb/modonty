"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { exportClientsToCSV } from "../actions/export-actions";
import { ClientFilters } from "../actions/clients-actions";
import { useToast } from "@/hooks/use-toast";

interface ExportButtonProps {
  filters?: ClientFilters;
}

export function ExportButton({ filters }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const csv = await exportClientsToCSV(filters);
      
      const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
      const encoder = new TextEncoder();
      const csvBytes = encoder.encode(csv);
      
      const combinedArray = new Uint8Array(bom.length + csvBytes.length);
      combinedArray.set(bom, 0);
      combinedArray.set(csvBytes, bom.length);
      
      const blob = new Blob([combinedArray], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      
      link.setAttribute("href", url);
      link.setAttribute("download", `clients-export-${new Date().toISOString().split("T")[0]}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Success",
        description: "Clients exported successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export clients",
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
