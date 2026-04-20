"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Send, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import type { EmailTemplateConfig } from "../email-templates-config";
import { getTemplatePreview, sendTestEmail } from "../actions/preview-email";

interface Props {
  templates: EmailTemplateConfig[];
  initialId: string;
  initialSubject: string;
  initialHtml: string;
}

const GROUPS: EmailTemplateConfig["group"][] = ["Modonty Emails", "Admin Emails"];

export function EmailPreviewClient({ templates, initialId, initialSubject, initialHtml }: Props) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState(initialId);
  const [subject, setSubject] = useState(initialSubject);
  const [html, setHtml] = useState(initialHtml);

  function handleSelect(id: string) {
    if (id === selectedId) return;
    setSelectedId(id);
    startTransition(async () => {
      const result = await getTemplatePreview(id);
      setSubject(result.subject);
      setHtml(result.html);
    });
  }

  async function handleSendTest(id: string) {
    setSendingId(id);
    const result = await sendTestEmail(id);
    setSendingId(null);
    if (result.success) {
      toast({ title: result.message, description: "Sent to modonty1@gmail.com" });
    } else {
      toast({ title: "Send failed", description: result.message, variant: "destructive" });
    }
  }

  return (
    <div className="flex gap-4 h-[calc(100vh-160px)] min-h-[520px]">
      {/* Template list */}
      <aside className="w-56 shrink-0 border rounded-lg bg-card overflow-y-auto">
        {GROUPS.map((group) => {
          const groupTemplates = templates.filter((t) => t.group === group);
          return (
            <div key={group}>
              <p className="px-3 pt-3 pb-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                {group}
              </p>
              {groupTemplates.map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleSelect(t.id)}
                  className={cn(
                    "w-full text-start px-3 py-2 text-sm transition-colors flex items-start gap-2",
                    selectedId === t.id
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Mail className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                  <span className="leading-snug">{t.label}</span>
                </button>
              ))}
            </div>
          );
        })}
      </aside>

      {/* Preview panel */}
      <div className="flex-1 flex flex-col gap-3 min-w-0">
        {/* Subject + actions bar */}
        <div className="flex items-center justify-between gap-3 border rounded-lg px-4 py-2.5 bg-card">
          <div className="flex items-center gap-2 min-w-0">
            <Badge variant="outline" className="text-xs shrink-0">
              Subject
            </Badge>
            <span className="text-sm font-medium truncate">{subject}</span>
          </div>
          <Button
            size="sm"
            variant="outline"
            disabled={sendingId === selectedId}
            onClick={() => handleSendTest(selectedId)}
            className="shrink-0 gap-1.5"
          >
            {sendingId === selectedId ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Send className="h-3.5 w-3.5" />
            )}
            Send Test
          </Button>
        </div>

        {/* iframe preview */}
        <div
          className={cn(
            "flex-1 border rounded-lg overflow-hidden transition-opacity",
            isPending && "opacity-40 pointer-events-none"
          )}
        >
          <iframe
            key={selectedId}
            srcDoc={html}
            sandbox="allow-same-origin"
            className="w-full h-full"
            title={`Preview: ${subject}`}
          />
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Preview uses mock data · Test email sent to modonty1@gmail.com
        </p>
      </div>
    </div>
  );
}
