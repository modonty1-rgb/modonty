"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { SocialCalendarKind } from "@prisma/client";
import { FileText, Share2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

import { createSocialCalendar } from "../actions";

const KINDS: { kind: SocialCalendarKind; label: string; hint: string; Icon: typeof FileText }[] = [
  { kind: "CONTENT", label: "محتوى", hint: "يظهر تحت «المحتوى»", Icon: FileText },
  { kind: "SOCIAL", label: "سوشيال ميديا", hint: "يظهر تحت «السوشيال ميديا»", Icon: Share2 },
];

/** تأسيس كاليندر: النوع · الاسم · المصمم (خالد ١١ أكتوبر ٢٠٢٦). */
export function NewCalendarForm({
  initialKind,
  designers,
}: {
  initialKind: SocialCalendarKind;
  designers: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [kind, setKind] = useState<SocialCalendarKind>(initialKind);
  const [name, setName] = useState("");
  const [designerId, setDesignerId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await createSocialCalendar({ kind, name, designerId });
      if (!res.success) return void toast({ title: res.error, variant: "destructive" });
      toast({ title: "تم تأسيس الكاليندر", variant: "success" });
      router.push(`/social-calendar/${res.calendarId}`);
    });
  }

  return (
    <form onSubmit={submit} className="space-y-6 rounded-xl border border-border bg-card p-6 shadow-sm">
      <fieldset className="space-y-2">
        <legend className="mb-2 text-sm font-semibold text-foreground">نوع الكاليندر</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {KINDS.map(({ kind: k, label, hint, Icon }) => (
            <button
              key={k}
              type="button"
              aria-pressed={kind === k}
              onClick={() => setKind(k)}
              className={cn(
                "flex items-center gap-3 rounded-lg border p-4 text-start transition-colors",
                kind === k ? "border-primary bg-primary/10" : "border-border hover:bg-muted",
              )}
            >
              <Icon className={cn("h-5 w-5 shrink-0", kind === k ? "text-primary" : "text-muted-foreground")} />
              <span>
                <span className="block text-sm font-semibold text-foreground">{label}</span>
                <span className="block text-xs text-muted-foreground">{hint}</span>
              </span>
            </button>
          ))}
        </div>
      </fieldset>

      <label className="block space-y-1.5">
        <span className="text-sm font-semibold text-foreground">الاسم</span>
        <Input value={name} onChange={(e) => setName(e.target.value)} maxLength={120} placeholder="اسم البراند أو الحساب" />
      </label>

      <label className="block space-y-1.5">
        <span className="text-sm font-semibold text-foreground">المصمم</span>
        <select
          value={designerId ?? ""}
          onChange={(e) => setDesignerId(e.target.value || null)}
          className="h-9 w-full rounded-md border border-border bg-background px-2 text-sm"
        >
          <option value="">بدون مصمم</option>
          {designers.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
        <span className="block text-xs text-muted-foreground">كل منشور في هذا الكاليندر يذهب تاسك تصميمه للمصمم.</span>
      </label>

      <div className="flex justify-end">
        <Button type="submit" disabled={pending || !name.trim()}>
          {pending ? "جاري التأسيس..." : "تأسيس الكاليندر"}
        </Button>
      </div>
    </form>
  );
}
