"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CharacterCounter } from "@/components/shared/character-counter";
import { useToast } from "@/hooks/use-toast";
import { saveClientSeo } from "@/app/(dashboard)/clients/actions/clients-actions/save-client-seo";
import type { SeoClientRow } from "./seo-client-list";

interface Props {
  client: SeoClientRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function ring(score: number) {
  if (score >= 80) return { color: "#16a34a", text: "text-green-600 dark:text-green-500", label: "جاهز" };
  if (score >= 50) return { color: "#d97706", text: "text-amber-600 dark:text-amber-500", label: "شبه مكتمل" };
  return { color: "#dc2626", text: "text-red-600 dark:text-red-500", label: "ناقص" };
}

export function ClientSeoDialog({ client, open, onOpenChange }: Props) {
  const { toast } = useToast();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (client) {
      setTitle(client.seoTitle ?? "");
      setDesc(client.seoDescription ?? "");
    }
  }, [client]);

  if (!client) return null;

  const r = ring(client.score);

  async function handleSave() {
    if (!client) return;
    setSaving(true);
    const res = await saveClientSeo({
      clientId: client.id,
      seoTitle: title.trim() || null,
      seoDescription: desc.trim() || null,
    });
    setSaving(false);
    if (res.success) {
      toast({ title: "تم حفظ سيو العميل", variant: "success" });
      router.refresh();
      onOpenChange(false);
    } else {
      toast({ title: "فشل الحفظ", description: res.error, variant: "destructive" });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">✍️ {client.name}</DialogTitle>
        </DialogHeader>

        {/* Readiness header */}
        <div className="flex items-center gap-4">
          <div
            className="relative h-14 w-14 rounded-full grid place-items-center shrink-0"
            style={{ background: `conic-gradient(${r.color} ${client.score * 3.6}deg, hsl(var(--muted)) 0deg)` }}
          >
            <div className="absolute inset-[6px] rounded-full bg-background" />
            <span className={`relative text-sm font-extrabold ${r.text}`}>{client.score}%</span>
          </div>
          <div>
            <div className="font-bold">جاهزية SEO — {r.label}</div>
            <div className="text-xs text-muted-foreground">اكتب العنوان والوصف يرتفع الرقم بعد الحفظ</div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="seoTitle">SEO Title</Label>
            <Input
              id="seoTitle"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="أفضل عيادة أسنان في جدة — تقويم وتجميل"
              className="mt-1"
            />
            <div className="mt-1">
              <CharacterCounter current={title.length} min={30} max={60} restrict={false} />
            </div>
          </div>
          <div>
            <Label htmlFor="seoDesc">SEO Description</Label>
            <Textarea
              id="seoDesc"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              rows={4}
              placeholder="وصف مختصر وجذّاب يظهر تحت العنوان في نتائج Google…"
              className="mt-1"
            />
            <div className="mt-1">
              <CharacterCounter current={desc.length} min={120} max={160} restrict={false} />
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving} className="gap-1.5">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {saving ? "جارٍ الحفظ…" : "حفظ سيو العميل"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
