"use client";

import { useState } from "react";
import { CheckCircle2, Circle, ListChecks } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface FieldStatus {
  key: string;
  label: string;
  filled: boolean;
}
interface CompletenessSection {
  title: string;
  fields: FieldStatus[];
}
interface ProfileCompletenessButtonProps {
  score: number;
  filled: number;
  total: number;
  sections: CompletenessSection[];
}

// Compact header trigger + dialog. {filled, total, sections} are computed on the
// server (page) — the dialog highlights the MISSING fields, grouped by section so
// the client knows exactly where to fill.
export function ProfileCompletenessButton({
  score,
  filled,
  total,
  sections,
}: ProfileCompletenessButtonProps) {
  const [open, setOpen] = useState(false);
  const missing = total - filled;

  const tone =
    score === 100
      ? {
          btn: "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/15 hover:text-emerald-800",
          chip: "border-emerald-200 bg-emerald-50 text-emerald-700",
          progress: "emerald" as const,
        }
      : {
          btn: "border-primary/30 bg-primary/10 text-primary hover:bg-primary/15",
          chip: "border-primary/30 bg-primary/10 text-primary",
          progress: "default" as const,
        };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className={`h-8 gap-1.5 rounded-full px-3 text-xs font-medium tabular-nums ${tone.btn}`}
      >
        <ListChecks className="h-3.5 w-3.5" />
        اكتمال الملف · {score}%
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent dir="rtl" className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ListChecks className="h-5 w-5 shrink-0 text-primary" />
              اكتمال الملف
              <Badge variant="outline" className={`tabular-nums ${tone.chip}`}>
                {filled} / {total}
              </Badge>
            </DialogTitle>
            <DialogDescription>
              {missing > 0
                ? `باقي ${missing} ${missing === 1 ? "حقل" : "حقول"} لإكمال ملفك — موضّحة بالأسفل.`
                : "ملفك مكتمل بالكامل 🎉"}
            </DialogDescription>
          </DialogHeader>

          <Progress value={score} tone={tone.progress} />

          <div className="space-y-4">
            {sections.map((s) => {
              const sectionMissing = s.fields.filter((f) => !f.filled).length;
              return (
                <div key={s.title}>
                  <div className="mb-1.5 flex items-center justify-between">
                    <h4 className="text-xs font-bold text-foreground">{s.title}</h4>
                    <span className="text-[11px] tabular-nums text-muted-foreground">
                      {s.fields.length - sectionMissing}/{s.fields.length}
                    </span>
                  </div>
                  <ul className="grid grid-cols-1 gap-x-4 gap-y-1 sm:grid-cols-2">
                    {s.fields.map((f) => (
                      <li key={f.key} className="flex items-center gap-1.5 text-sm">
                        {f.filled ? (
                          <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-600" />
                        ) : (
                          <Circle className="h-4 w-4 flex-shrink-0 text-amber-500" />
                        )}
                        <span className={f.filled ? "text-muted-foreground" : "font-medium text-foreground"}>
                          {f.label}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
