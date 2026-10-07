"use client";

import { useState, useTransition } from "react";
import { Loader2, FileSearch } from "lucide-react";

import { useToast } from "@/hooks/use-toast";

import { getSchemaValidationReportAction } from "../actions/pipeline-actions";
import { SchemaValidationDialog } from "./schema-validation-dialog";

import type { ValidationReport } from "@/lib/seo/jsonld-validator";

interface Props {
  articleId: string;
}

export function ViewSchemaValidationButton({ articleId }: Props) {
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [report, setReport] = useState<ValidationReport | null>(null);
  const [jsonLd, setJsonLd] = useState<object | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = () => {
    setOpen(true);
    setReport(null);
    setJsonLd(null);
    setError(null);
    startTransition(async () => {
      const res = await getSchemaValidationReportAction(articleId);
      if (res.ok && res.report) {
        setReport(res.report);
        setJsonLd(res.jsonLd ?? null);
      } else {
        setError(res.error ?? "Validation failed");
        toast({
          title: "Cannot validate",
          description: res.error,
          variant: "destructive",
        });
      }
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={run}
        disabled={pending}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-violet-500/30 text-violet-600 dark:text-violet-400 hover:bg-violet-500/10 text-xs font-medium disabled:opacity-50"
      >
        {pending ? <Loader2 className="h-3 w-3 animate-spin" /> : <FileSearch className="h-3 w-3" />}
        View schema.org report
      </button>

      <SchemaValidationDialog
        open={open}
        onOpenChange={setOpen}
        loading={pending}
        report={report}
        jsonLd={jsonLd}
        error={error}
      />
    </>
  );
}
