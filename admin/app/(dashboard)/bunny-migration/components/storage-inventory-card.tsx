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
  wipeBunnyZone,
  type ProviderCounts,
  type ZoneInventory,
} from "../actions/storage-inventory";

/** Dense inline number — this page is a one-off tool, the numbers matter, the chrome does not. */
function N({ label, value, tone }: { label: string; value: string; tone?: "amber" | "emerald" | "red" }) {
  const c =
    tone === "amber"
      ? "text-amber-500"
      : tone === "emerald"
        ? "text-emerald-500"
        : tone === "red"
          ? "text-red-500"
          : "text-foreground";
  return (
    <span className="whitespace-nowrap">
      <span className={`font-bold tabular-nums ${c}`}>{value}</span>{" "}
      <span className="text-muted-foreground">{label}</span>
    </span>
  );
}

export function StorageInventoryCard() {
  const { toast } = useToast();
  const [counts, setCounts] = useState<ProviderCounts | null>(null);
  const [zones, setZones] = useState<ZoneInventory[] | null>(null);
  const [cloud, setCloud] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [wiping, setWiping] = useState(false);

  useEffect(() => {
    getMediaCounts().then((r) => {
      if (!("error" in r)) setCounts(r);
    });
  }, []);

  async function loadLive() {
    setLoading(true);
    const [b, c] = await Promise.all([getBunnyInventory(), getCloudinaryCount()]);
    if ("zones" in b) setZones(b.zones);
    if ("assets" in c) setCloud(c.assets);
    else toast({ title: "Cloudinary count failed", description: c.error, variant: "destructive" });
    setLoading(false);
  }

  async function runWipe() {
    setWiping(true);
    const r = await wipeBunnyZone("clients", confirmText.trim());
    setWiping(false);
    setConfirmText("");
    if ("error" in r) {
      toast({ title: "Wipe refused", description: r.error, variant: "destructive" });
      return;
    }
    toast({
      title: "Wiped clients zone",
      description: `${r.deleted} deleted · ${r.failed} failed`,
      variant: r.failed ? "destructive" : "default",
    });
    setZones(null);
    void loadLive();
  }

  const cz = zones?.find((z) => z.zone === "clients");
  const az = zones?.find((z) => z.zone === "assets");
  const fmtZone = (z?: ZoneInventory) => (!z ? "—" : z.files < 0 ? "err" : String(z.files));

  return (
    <Card>
      <CardContent className="space-y-2.5 p-4 text-[13px]">
        {/* HEAD-checked live 2026-07-31: 405 urls → 401 alive, 4 dead (2 have Bunny, 2 replaced orphans). */}
        <div className="rounded-md border border-emerald-500/40 bg-emerald-500/5 px-3 py-1.5 text-xs text-muted-foreground">
          <b className="text-emerald-500">✅ Wipe clients = safe</b> (HEAD-checked 405 urls · 401
          alive · 4 dead all covered) · <b className="text-violet-400">▶ Next: T2 Modonty core</b> —
          identity into Media rows, then assets wipe unlocks.
        </div>

        {/* DB — instant, this is what the site actually resolves */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            DB
          </span>
          <N label="media rows" value={counts ? String(counts.dbTotal) : "…"} />
          <N label="Cloudinary" value={counts ? String(counts.dbOnCloudinary) : "…"} tone="amber" />
          <N label="Bunny" value={counts ? String(counts.dbOnBunny) : "…"} tone="emerald" />
          <N
            label="no bunnyUrl"
            value={counts ? String(counts.dbMissingBunny) : "…"}
            tone={counts && counts.dbMissingBunny > 0 ? "red" : "emerald"}
          />
        </div>

        {/* Live — actual files sitting on each provider */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t pt-2.5">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Files
          </span>
          <N label="Cloudinary" value={cloud === null ? "—" : String(cloud)} tone="amber" />
          <N label={`Bunny clients${cz && cz.files >= 0 ? ` (${cz.megabytes} MB)` : ""}`} value={fmtZone(cz)} tone="emerald" />
          <N label={`Bunny assets${az && az.files >= 0 ? ` (${az.megabytes} MB)` : ""}`} value={fmtZone(az)} tone="emerald" />
          <Button size="sm" variant="outline" className="ms-auto h-7 text-xs" onClick={loadLive} disabled={loading}>
            {loading ? "Counting…" : "Count files"}
          </Button>
        </div>

        {/* Wipe */}
        <div className="flex flex-wrap items-center gap-2 border-t pt-2.5">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-red-500">Wipe</span>
          <span className="text-muted-foreground">
            clients zone only — assets zone refused (holds the hardcoded platform identity, nothing
            could rebuild it until T2)
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
            {wiping ? "Wiping…" : "Wipe"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
