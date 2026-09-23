"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Undo2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { approveTask, returnTask } from "@/lib/tasks/task-actions";

/**
 * The only client island on the reviews page — two decisions, nothing else.
 * «Send back» asks for the note first: a task returned without saying why comes
 * back to review unchanged.
 */
export function ReviewDecision({ id, title, assignee }: { id: string; title: string; assignee: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, start] = useTransition();
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");

  const approve = () =>
    start(async () => {
      const r = await approveTask(id);
      toast(r.success ? { title: "اعتُمدت", description: `«${title}» صارت Done عند ${assignee}.` } : { title: "تعذّر الاعتماد", description: r.error, variant: "destructive" });
      router.refresh();
    });

  const sendBack = () =>
    start(async () => {
      const r = await returnTask({ id, note });
      if (!r.success) {
        toast({ title: "تعذّر الإرجاع", description: r.error, variant: "destructive" });
        return;
      }
      setOpen(false);
      setNote("");
      toast({ title: "رجعت بملاحظتك", description: `«${title}» عادت إلى In Progress عند ${assignee}.` });
      router.refresh();
    });

  return (
    <div className="flex shrink-0 gap-2">
      <Button size="sm" className="h-8 gap-1.5 text-xs" disabled={pending} onClick={approve}>
        <CheckCircle2 className="size-3.5" aria-hidden />
        اعتماد
      </Button>
      <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs" disabled={pending} onClick={() => setOpen(true)}>
        <Undo2 className="size-3.5" aria-hidden />
        رجّعها بملاحظة
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent dir="rtl" className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>رجّع «{title}» بملاحظة</DialogTitle>
            <DialogDescription>تصل الملاحظةُ {assignee} في الجرس، وتظهر على بطاقته حتى يرسلها للمراجعة من جديد.</DialogDescription>
          </DialogHeader>
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="وش المطلوب تعديله؟"
            rows={4}
            maxLength={1000}
            autoFocus
          />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)} disabled={pending}>إلغاء</Button>
            <Button onClick={sendBack} disabled={pending || note.trim().length < 3}>
              {pending ? "جارٍ الإرسال…" : "أرسل الملاحظة"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
