"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface PendingFaq {
  id: string;
  question: string;
  createdAt: Date;
}

/** «أسئلتك المعلقة» — loaded only when the reader taps it (see AskClientDialog). */
export function AskClientPendingDialog({
  open,
  onOpenChange,
  pendingFaqs,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pendingFaqs: PendingFaq[];
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle>أسئلتك المعلقة</DialogTitle>
          <DialogDescription>الأسئلة التي أرسلتها وتنتظر الرد.</DialogDescription>
        </DialogHeader>
        {pendingFaqs.length === 0 ? (
          <p className="text-sm text-muted-foreground py-2">لا توجد أسئلة معلقة</p>
        ) : (
          <ul className="space-y-2 max-h-[60vh] overflow-y-auto">
            {pendingFaqs.map((faq) => (
              <li key={faq.id}>
                <Card className="p-3">
                  <p className="text-sm text-foreground">{faq.question}</p>
                  <Badge className="mt-2 text-xs bg-accent text-accent-foreground">قيد المراجعة</Badge>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  );
}
