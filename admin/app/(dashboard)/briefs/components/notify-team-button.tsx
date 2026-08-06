"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Send } from "lucide-react";
import type { NotificationPriority } from "@prisma/client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

import { notifyContentTeam } from "../actions/notify-content-team";
import { RecipientPicker } from "./recipient-picker";
import type { RecipientOption } from "../helpers/load-recipients";

const MAX = 1000;

/** Same three levels as the enum — each says WHEN to act, not just how loud it is. */
const LEVELS: {
  key: NotificationPriority;
  label: string;
  hint: string;
  active: string;
  idle: string;
}[] = [
  {
    key: "NORMAL",
    label: "🟢 عادي",
    hint: "للعلم — ينفّذها لما يوصلها",
    active: "border-emerald-500 bg-emerald-500 text-white",
    idle: "border-emerald-500/40 text-emerald-600 hover:bg-emerald-500/10 dark:text-emerald-400",
  },
  {
    key: "IMPORTANT",
    label: "🟡 مهم",
    hint: "يحتاج تحرّكاً هذا الأسبوع",
    active: "border-amber-500 bg-amber-500 text-white",
    idle: "border-amber-500/40 text-amber-600 hover:bg-amber-500/10 dark:text-amber-400",
  },
  {
    key: "URGENT",
    label: "🔴 عاجل",
    hint: "شغل واقف — اليوم",
    active: "border-red-500 bg-red-500 text-white",
    idle: "border-red-500/40 text-red-600 hover:bg-red-500/10 dark:text-red-400",
  },
];

export function NotifyTeamButton({
  clientId,
  clientName,
  recipients,
}: {
  clientId: string;
  clientName: string;
  recipients: RecipientOption[];
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState<NotificationPriority>("NORMAL");
  const [selected, setSelected] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();

  const chosen = LEVELS.find((l) => l.key === priority)!;

  function send() {
    startTransition(async () => {
      const res = await notifyContentTeam(clientId, message, priority, selected);
      if (!res.success) {
        toast({ title: "ما انبعثت", description: res.error, variant: "destructive" });
        return;
      }
      // A saved-but-undelivered note is not a success story — say so plainly, because the
      // row will sit in the history marked failed and somebody has to know why.
      if (res.delivered) {
        toast({
          title: "وصلت القناة",
          description: "الفريق شافها في تيليجرام، وانحفظت في السجل تحت.",
        });
      } else {
        toast({
          title: "انحفظت، بس ما وصلت تيليجرام",
          description: res.error ?? "راجع إعدادات البوت — الرسالة محفوظة في السجل.",
          variant: "destructive",
        });
      }
      setOpen(false);
      setMessage("");
      setPriority("NORMAL");
      setSelected([]);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !isPending && setOpen(o)}>
      <DialogTrigger asChild>
        <Button size="sm" className="h-8 gap-1.5">
          <Send className="h-3.5 w-3.5" aria-hidden="true" />
          بلّغ فريق المحتوى
        </Button>
      </DialogTrigger>

      <DialogContent dir="rtl" className="sm:max-w-lg">
        <DialogHeader className="text-start">
          <DialogTitle>بلّغ الفريق عن «{clientName}»</DialogTitle>
          <DialogDescription>
            تروح لقناة فريق المحتوى على تيليجرام باسمك، وتنحفظ في سجل هذا العميل.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {/* First question, because it decides who even reads on. */}
          <div className="space-y-1.5">
            <span className="text-xs font-medium">مستلم</span>
            <RecipientPicker
              options={recipients}
              selected={selected}
              onChange={setSelected}
              disabled={isPending}
            />
            <p className="text-[11px] text-muted-foreground">
              اختر شخصاً أو أكثر، أو سيبها «الكل» عشان توصل الفريق كامل.
            </p>
          </div>

          <div className="space-y-1.5">
            <span className="text-xs font-medium">درجة الأهمية</span>
            <div className="flex flex-wrap gap-1.5">
              {LEVELS.map((l) => (
                <button
                  key={l.key}
                  type="button"
                  onClick={() => setPriority(l.key)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                    priority === l.key ? l.active : l.idle,
                  )}
                >
                  {l.label}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground">{chosen.hint}</p>
          </div>

          <div className="space-y-1.5">
            <span className="text-xs font-medium">النص</span>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value.slice(0, MAX))}
              placeholder="مثال: العميل عدّل بيانات نشاطه — راجعوا البرِيف قبل مقال هذا الأسبوع."
              rows={4}
            />
            <p className="text-end text-[10.5px] text-muted-foreground tabular-nums">
              {message.length}/{MAX}
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" disabled={isPending} onClick={() => setOpen(false)}>
            إلغاء
          </Button>
          <Button disabled={!message.trim() || isPending} onClick={send} className="gap-1.5">
            {isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
            ) : (
              <Send className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            إرسال
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
