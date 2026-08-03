"use client";

import { useEffect, useState } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

import {
  getMediaCounts,
  getBunnyInventory,
  getCloudinaryCount,
  wipeBunnyZoneStep,
  type ProviderCounts,
  type ZoneInventory,
} from "../actions/storage-inventory";

/** One labelled number per line — value first (bold), explanation after. */
function Row({ label, value, tone }: { label: string; value: string; tone?: "amber" | "emerald" | "red" }) {
  const c =
    tone === "amber"
      ? "text-amber-500"
      : tone === "emerald"
        ? "text-emerald-500"
        : tone === "red"
          ? "text-red-500"
          : "text-foreground";
  return (
    <div className="flex items-baseline gap-2">
      <span className={`min-w-10 text-end text-base font-bold tabular-nums ${c}`}>{value}</span>
      <span className="leading-snug text-muted-foreground">{label}</span>
    </div>
  );
}

export function StorageInventoryCard() {
  const { toast } = useToast();
  const [counts, setCounts] = useState<ProviderCounts | null>(null);
  const [zones, setZones] = useState<ZoneInventory[] | null>(null);
  const [cloud, setCloud] = useState<{ folders: number; rootReferenced: number; assets: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [wiping, setWiping] = useState(false);
  const [wipeProgress, setWipeProgress] = useState<{ done: number; total: number | null; failed: number } | null>(null);

  useEffect(() => {
    getMediaCounts().then((r) => {
      if (!("error" in r)) setCounts(r);
    });
  }, []);

  async function loadLive() {
    setLoading(true);
    // refresh DB counts too — stale numbers here caused real confusion mid-migration
    const [b, c, m] = await Promise.all([getBunnyInventory(), getCloudinaryCount(), getMediaCounts()]);
    if ("zones" in b) setZones(b.zones);
    if ("assets" in c) setCloud(c);
    else toast({ title: "فشل عدّ Cloudinary", description: c.error, variant: "destructive" });
    if (!("error" in m)) setCounts(m);
    setLoading(false);
  }

  // Batched wipe loop — live progress instead of one blind minutes-long call.
  async function runWipe() {
    setWiping(true);
    setWipeProgress({ done: 0, total: null, failed: 0 });
    const confirm = confirmText.trim();
    let done = 0;
    let failedTotal = 0;
    let total: number | null = null;
    try {
      for (;;) {
        const r = await wipeBunnyZoneStep("clients", confirm);
        if ("error" in r) {
          toast({ title: "رُفض الحذف", description: r.error, variant: "destructive" });
          return;
        }
        if (total === null) total = r.total;
        done += r.deleted;
        failedTotal += r.failed;
        setWipeProgress({ done, total, failed: failedTotal });
        if (r.remaining <= 0) break;
        // Nothing deleted but files remain → stuck (auth/network) — stop, don't spin forever.
        if (r.deleted === 0) {
          toast({ title: "تعطّل الحذف", description: r.errors.join(" · ") || "لا تقدّم", variant: "destructive" });
          return;
        }
      }
      toast({
        title: "صُفّر زون clients",
        description: `${done} محذوف · ${failedTotal} فشل`,
        variant: failedTotal ? "destructive" : "default",
      });
    } finally {
      setWiping(false);
      setConfirmText("");
      setZones(null);
      void loadLive();
    }
  }

  const cz = zones?.find((z) => z.zone === "clients");
  const az = zones?.find((z) => z.zone === "assets");
  const fmtZone = (z?: ZoneInventory) => (!z ? "—" : z.files < 0 ? "err" : String(z.files));

  return (
    <Card>
      <CardContent className="space-y-2.5 p-4 text-[13px]">
        {/* HEAD-checked live 2026-07-31: 405 urls → 401 alive, 4 dead (2 have Bunny, 2 replaced orphans). */}
        <div className="rounded-md border border-emerald-500/40 bg-emerald-500/5 px-3 py-1.5 text-xs text-muted-foreground">
          <b className="text-emerald-500">✅ تصفير زون clients آمن</b> (فحص HEAD على ٤٠٥ روابط · ٤٠١
          حيّ · ٤ ميتة كلها مغطاة) · زون assets يبقى محمياً حتى تكتمل ملكية الهوية.
        </div>

        {/* Two vertical cards — records vs actual files. They measure different things
            and are NOT supposed to match (a record counts in more than one line). */}
        <div dir="rtl" className="grid gap-3 sm:grid-cols-2">
          {/* Card 1 — DB records */}
          <div className="rounded-lg border p-3">
            <p className="text-sm font-bold">📋 السجلات — جدول الوسائط</p>
            <p className="mb-2 text-[11px] leading-relaxed text-muted-foreground">
              بطاقة لكل صورة. البطاقة الواحدة تنحسب في أكثر من سطر (رابط قديم + نسخة Bunny معاً)
              — فالأرقام لا يجب أن تتطابق.
            </p>
            <div className="space-y-1.5 text-[13px]">
              <Row label="كل البطاقات" value={counts ? String(counts.dbTotal) : "…"} />
              <Row
                label="رابطها الأصلي Cloudinary (يبقى بعد الترحيل — صفر فقدان)"
                value={counts ? String(counts.dbOnCloudinary) : "…"}
                tone="amber"
              />
              <Row label="عندها نسخة Bunny جاهزة ✅" value={counts ? String(counts.dbOnBunny) : "…"} tone="emerald" />
              <Row
                label="لسه بلا نسخة Bunny"
                value={counts ? String(counts.dbMissingBunny) : "…"}
                tone={counts && counts.dbMissingBunny > 0 ? "red" : "emerald"}
              />
            </div>
          </div>

          {/* Card 2 — actual files on each provider */}
          <div className="rounded-lg border p-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-bold">🗄️ الملفات الفعلية — على السيرفرات</p>
                <p className="mb-2 text-[11px] leading-relaxed text-muted-foreground">
                  عدّ حي مباشر من كل مزوّد. يحدّث أرقام الكارتين معاً.
                </p>
              </div>
              <Button size="sm" variant="outline" className="h-7 shrink-0 text-xs" onClick={loadLive} disabled={loading}>
                {loading ? "جارٍ العدّ…" : "عدّ الملفات"}
              </Button>
            </div>
            <div className="space-y-1.5 text-[13px]">
              <Row
                label="Cloudinary — داخل فولدرات مدونتي (مشاريعك الأخرى غير محسوبة ولا تُلمس)"
                value={cloud === null ? "—" : String(cloud.folders)}
                tone="amber"
              />
              <Row
                label="Cloudinary — على الجذر بلا فولدر (رفعات قديمة تشير لها البطاقات)"
                value={cloud === null ? "—" : String(cloud.rootReferenced)}
                tone="amber"
              />
              <Row
                label="مجموع ملفات مدونتي على Cloudinary"
                value={cloud === null ? "—" : String(cloud.assets)}
                tone="amber"
              />
              <Row
                label={`Bunny clients — أصلية + قصّات تلقائية${cz && cz.files >= 0 ? ` (${cz.megabytes} MB)` : ""}`}
                value={fmtZone(cz)}
                tone="emerald"
              />
              <Row
                label="Bunny assets — هوية المنصّة، محمي (شعار · فريق · شركاء)"
                value={az && az.files >= 0 ? String(az.files - (az.migrated ?? 0)) : fmtZone(az)}
                tone="emerald"
              />
              <Row
                label={`Bunny assets — يتيمة مرحّلة داخل migrated/ (نتاج التاسك ٢)${az && az.files >= 0 ? ` — الزون كله ${az.megabytes} MB` : ""}`}
                value={az && az.files >= 0 ? String(az.migrated ?? 0) : "—"}
                tone="emerald"
              />
            </div>
          </div>
        </div>

        {/* Wipe */}
        <div className="flex flex-wrap items-center gap-2 border-t pt-2.5">
          <span className="text-[11px] font-semibold tracking-wide text-red-500">التصفير — حذف كل الملفات</span>
          <span className="text-muted-foreground">
            يحذف كل ملفات زون clients من Bunny (زون assets محمي — هوية المنصّة)
          </span>
          <Input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder='type "clients"'
            className="ms-auto h-7 max-w-[150px] text-xs"
          />
          <Button
            variant="destructive"
            size="sm"
            className="h-7 text-xs"
            disabled={wiping || confirmText.trim() !== "clients"}
            onClick={runWipe}
          >
            {wiping ? "جارٍ الحذف…" : "احذف كل الملفات"}
          </Button>
        </div>

        {/* Live wipe progress — Khalid's rule: never wait blind. */}
        {wipeProgress && (
          <div className="space-y-1 border-t pt-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className={wiping ? "text-red-500 font-semibold" : "text-emerald-500 font-semibold"}>
                {wiping ? "🗑️ جارٍ الحذف…" : "✅ اكتمل الحذف"}
              </span>
              <span className="tabular-nums text-muted-foreground">
                {wipeProgress.done}{wipeProgress.total !== null ? ` / ${wipeProgress.total}` : ""} محذوف
                {wipeProgress.failed > 0 && <span className="text-red-500"> · فشل {wipeProgress.failed}</span>}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full transition-all duration-300 ${wiping ? "bg-red-500" : "bg-emerald-500"}`}
                style={{ width: wipeProgress.total ? `${Math.min(100, (wipeProgress.done / wipeProgress.total) * 100)}%` : "5%" }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
