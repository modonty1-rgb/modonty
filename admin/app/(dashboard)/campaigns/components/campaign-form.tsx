"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, ArrowRight, Loader2, Save } from "lucide-react";
import type { AdApproval, AdCampaignStatus, AdChannel, AdObjective, AdSite } from "@prisma/client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { AD_CHANNEL_LABEL } from "@/lib/ad-channel-label";

import { createCampaign, updateCampaign } from "../actions";
import { MARKETS, OBJECTIVE_LABEL, channelsFor, marketOf, trackedUrl } from "../helpers/channels";
import type { CampaignInput } from "../helpers/campaign-schema";
import { DESTINATIONS, DESTINATION_HINT, DESTINATION_LABEL, type Destination } from "../helpers/destination-label";
import { TARGET_METRIC_LABEL } from "../helpers/target-metric-label";
import { platformCampaignName } from "../helpers/platform-campaign-name";
import { STAGE_LABEL, STAGE_TONE, briefStage, isStopped } from "../helpers/brief-stage";
import { CodeInstruction } from "./code-instruction";

/** الأسواق — نوعٌ ضيّق لا `string`، وإلّا تسرّبت قيمةٌ لا تقابل سوقاً إلى حالة الشاشة. */
type Market = "SA" | "EG" | "AE" | "KW";
const MARKET_DOT: Record<Market, string> = { SA: "bg-emerald-500", EG: "bg-red-500", AE: "bg-sky-500", KW: "bg-amber-500" };

const OBJECTIVES: AdObjective[] = ["LEADS", "SALES", "TRAFFIC", "ENGAGEMENT", "AWARENESS"];

/** نفس مقادير نموذج العميل المحتمل: الشاشتان أختان، واختلاف الإيقاع يكلّف إعادة توجيهٍ بصريّ. */
const FIELD = "mt-0.5 h-8 rounded py-1";
const TAP =
  "touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring " +
  "focus-visible:ring-offset-1 focus-visible:ring-offset-background " +
  "motion-reduce:transition-none motion-reduce:active:scale-100";

/**
 * التاريخ بأجزائه المحلّية لا بـ`toISOString` — تلك تحوّل إلى التوقيت العالميّ فتُقصّ يوماً
 * (مقيس: ٣٠ سبتمبر محلّياً صار ٢٩ عالمياً).
 */
const isoDay = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/** ما تُحمَّل به الشاشة عند التعديل — التاريخان `YYYY-MM-DD` كما تقرؤهما خانة التاريخ. */
export interface CampaignInitial {
  name?: string;
  countryCode?: Market;
  site?: AdSite;
  channel?: AdChannel;
  objective?: AdObjective | null;
  brief?: string | null;
  targetAudience?: string | null;
  startAt?: string;
  endAt?: string;
  spendCap?: number | null;
  targetCostPerLead?: number | null;
  landingPath?: string | null;
  note?: string | null;
  code?: string | null;
  approval?: AdApproval;
  status?: AdCampaignStatus;
  decisionNote?: string | null;
  destination?: string | null;
  creativeUrl?: string | null;
}

interface Props {
  campaignId?: string;
  initial?: CampaignInitial;
}

/**
 * بريف الحملة — يكتبه الميديا باير قبل أن يبني الإعلان، وعليه يوافق الأدمن (خالد ٢٩ سبتمبر
 * ٢٠٢٦: «يديني توصيف للإعلان والهدف منه، أنا أدي الأبروف، يشتغل في المنصّة، وأنا أسحب البيانات
 * منها»).
 *
 * لا مجموعاتٍ إعلانية ولا استهداف تفصيليّ ولا ميزانية يومية: تلك يبنيها في المنصّة كما يشاء،
 * وتُسحب أرقامها من هناك. هنا ما يُتّخذ عليه القرار — الهدف والرسالة والسقف والتكلفة المستهدفة.
 */
export function CampaignForm({ campaignId, initial }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const isEdit = Boolean(campaignId);
  const today = new Date();

  const [form, setForm] = useState({
    name: initial?.name ?? "",
    countryCode: (initial?.countryCode ?? "SA") as Market,
    site: (initial?.site ?? "MODONTY") as AdSite,
    channel: (initial?.channel ?? "") as AdChannel | "",
    objective: (initial?.objective ?? "") as AdObjective | "",
    brief: initial?.brief ?? "",
    targetAudience: initial?.targetAudience ?? "",
    startAt: initial?.startAt ? isoDay(new Date(initial.startAt)) : isoDay(today),
    endAt: initial?.endAt ? isoDay(new Date(initial.endAt)) : "",
    spendCap: initial?.spendCap != null ? String(initial.spendCap) : "",
    targetCostPerLead: initial?.targetCostPerLead != null ? String(initial.targetCostPerLead) : "",
    landingPath: initial?.landingPath ?? "",
    note: initial?.note ?? "",
    destination: (initial?.destination ?? "") as Destination | "",
    creativeUrl: initial?.creativeUrl ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const set = (k: keyof typeof form, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: [] }));
  };

  const market = marketOf(form.countryCode);
  const channelGroups = channelsFor(form.countryCode, form.objective);

  const submit = async () => {
    setSaving(true);
    setErrors({});
    const payload = form as unknown as CampaignInput;
    const r = isEdit ? await updateCampaign(campaignId!, payload) : await createCampaign(payload);
    setSaving(false);

    if (!r.success) {
      if (r.fieldErrors) setErrors(r.fieldErrors);
      toast({ title: r.error, variant: "destructive" });
      const first = Object.keys(r.fieldErrors ?? {}).find((k) => r.fieldErrors?.[k]?.length);
      if (first) {
        requestAnimationFrame(() => {
          const el = document.getElementById(first);
          el?.scrollIntoView({ block: "center", behavior: "smooth" });
          el?.focus({ preventScroll: true });
        });
      }
      return;
    }

    toast({ title: isEdit ? "تم الحفظ" : "أُرسل البريف — بانتظار الموافقة", variant: "success" });
    router.push("/campaigns");
    router.refresh();
  };

  const err = (k: string) =>
    errors[k]?.length ? (
      <p id={`${k}-error`} aria-live="polite" className="mt-0.5 text-[11px] text-destructive">
        {errors[k][0]}
      </p>
    ) : null;

  /** Pills shared by market, channel and objective — one control the eye learns once. */
  const pill = (active: boolean) =>
    cn(
      "inline-flex h-7 items-center gap-1 rounded-full border px-2.5 text-[11px] font-medium transition-colors",
      TAP,
      active ? "border-foreground bg-foreground text-background" : "border-border text-muted-foreground hover:text-foreground",
    );
  /** Example text inside a field reads as an example, not as something already typed (29 Sep 2026). */
  const HINT = "placeholder:text-muted-foreground/45";

  const code = initial?.code ?? null;
  // Stopped by an admin — the copy-the-name bar has nothing to ask until it is turned back on.
  const ended = initial?.status ? isStopped(initial.status) : false;
  const url = useMemo(
    () =>
      code && form.channel
        ? trackedUrl({ site: form.site, landingPath: form.landingPath, channel: form.channel, utmCampaign: code.toLowerCase(), platformCampaignId: "" })
        : null,
    [code, form.site, form.landingPath, form.channel],
  );

  return (
    /**
     * عمودان مضغوطان بترتيب القرار (خالد ٢٩ سبتمبر ٢٠٢٦: «اليو اي مش مظبوط» · «عمودين عشان أشوف
     * كل حاجة» · «كومباكت»): البلد والهدف والقناة ثم الميزانية يميناً، والبريف ثم وجهة العميل يساراً.
     * والقناة أزرارٌ ظاهرة تتبدّل مع البلد والهدف، لا قائمة منسدلة.
     */
    <form dir="rtl" onSubmit={(e) => { e.preventDefault(); submit(); }} className="mx-auto max-w-6xl space-y-2 pb-6">
      <header className="flex items-center gap-2">
        <Button variant="ghost" size="icon" type="button" asChild className="size-8">
          <Link href="/campaigns" aria-label="رجوع">
            <ArrowRight className="size-4 rtl:rotate-180" />
          </Link>
        </Button>
        <h1 className="text-lg font-semibold tracking-[-0.01em]">
          {isEdit ? "تعديل البريف" : "بريف حملة جديدة"}
          {code ? <span dir="ltr" className="ms-2 font-mono text-sm text-muted-foreground">{code}</span> : null}
        </h1>
        {/* All campaigns run for Modonty (Khalid, 29 Sep 2026) — said once here, not asked in a field. */}
        <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">على مدونتي</span>
      </header>

      {/* The code note under the title, not at the bottom of card 4 (Khalid, 29 Sep 2026: «يكون فوق
          في التايتل عشان يكون واضح»): the one rule the media buyer must not miss. */}
      {code && !ended ? (
        <CodeInstruction
          name={platformCampaignName({ code, channel: form.channel, objective: form.objective, countryCode: form.countryCode, startAt: form.startAt })}
        />
      ) : code ? null : (
        <p className="flex items-center gap-1.5 rounded-md border border-amber-500/60 bg-amber-500/10 px-3 py-2 text-xs text-amber-900 dark:text-amber-200">
          <AlertTriangle className="size-4 shrink-0" aria-hidden />
          <span>
            بعد الإرسال يأخذ البريف كوداً مثل <b dir="ltr" className="font-mono">B-012</b> — ولازم يُكتب في اسم الحملة في المنصّة، وإلّا ما يُحسب صرفها هنا.
          </span>
        </p>
      )}

      {isEdit && initial?.approval ? (
        <Card className="rounded-md">
          <CardContent className="space-y-1 p-3">
            <p className={cn("text-sm font-semibold", STAGE_TONE[briefStage({ approval: initial.approval, status: initial.status ?? "DRAFT" })])}>
              {STAGE_LABEL[briefStage({ approval: initial.approval, status: initial.status ?? "DRAFT" })]}
            </p>
            {initial.decisionNote ? <p className="text-xs text-muted-foreground">{initial.decisionNote}</p> : null}
            {initial.approval === "APPROVED" && !ended ? (
              <p className="text-[11px] text-muted-foreground">تغيير الهدف أو الوصف أو السقف يعيده «بانتظار الموافقة».</p>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      {/* Two columns so the whole brief is in view (Khalid, 29 Sep 2026): where and how much on
          one side, what it says and where it lands on the other. */}
      <div className="grid gap-2 lg:grid-cols-2 lg:items-start">
        <div className="space-y-2">
          {/* ١ · أين */}
          <Card className="rounded-md">
            <CardHeader className="px-3 pb-1 pt-2.5">
              <CardTitle className="text-sm">١ · البلد والهدف والقناة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 px-3 pb-3">
              <div>
                <p className="mb-1 text-xs">البلد *</p>
                <div role="radiogroup" aria-label="البلد" className="flex flex-wrap gap-1.5">
                  {MARKETS.map((m) => (
                    <button
                      key={m.code}
                      type="button"
                      role="radio"
                      aria-checked={form.countryCode === m.code}
                      onClick={() => set("countryCode", m.code)}
                      className={pill(form.countryCode === m.code)}
                    >
                      <span className={cn("size-1.5 rounded-full", MARKET_DOT[m.code as Market])} aria-hidden />
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-1 text-xs">الهدف *</p>
                <div role="radiogroup" aria-label="الهدف" id="objective" tabIndex={-1} className="flex flex-wrap gap-1.5">
                  {OBJECTIVES.map((o) => (
                    <button key={o} type="button" role="radio" aria-checked={form.objective === o} onClick={() => set("objective", o)} className={pill(form.objective === o)}>
                      {OBJECTIVE_LABEL[o]}
                    </button>
                  ))}
                </div>
                {err("objective")}
              </div>
              <div>
                <p className="mb-1 text-xs">
                  القناة *{" "}
                  <span className="text-muted-foreground">
                    {form.objective ? `— الأنسب لـ«${OBJECTIVE_LABEL[form.objective]}» أوّلاً` : "— اختر الهدف أوّلاً لترتيب القنوات"}
                  </span>
                </p>
                {/* Channels follow the objective (29 Sep 2026): the best for it first, then every other
                    channel — none hidden, the media buyer decides. */}
                <div role="radiogroup" aria-label="القناة" id="channel" tabIndex={-1} className="space-y-2">
                  <div className="flex flex-wrap gap-1.5">
                    {channelGroups.best.map((c) => (
                      <button key={c} type="button" role="radio" aria-checked={form.channel === c} onClick={() => set("channel", c)} className={pill(form.channel === c)}>
                        {AD_CHANNEL_LABEL[c]}
                      </button>
                    ))}
                  </div>
                  {form.objective && channelGroups.other.length > 0 ? (
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] text-muted-foreground">قنوات أخرى:</span>
                      {channelGroups.other.map((c) => (
                        <button
                          key={c}
                          type="button"
                          role="radio"
                          aria-checked={form.channel === c}
                          onClick={() => set("channel", c)}
                          className={cn(pill(form.channel === c), "h-7 border-dashed px-2.5 text-[11px]")}
                        >
                          {AD_CHANNEL_LABEL[c]}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
                {err("channel")}
              </div>
            </CardContent>
          </Card>

          {/* ٣ · الميزانية */}
          <Card className="rounded-md">
            <CardHeader className="px-3 pb-1 pt-2.5">
              <CardTitle className="text-sm">
                ٣ · الميزانية <span className="ms-2 text-xs font-normal text-muted-foreground">{market.currencyName}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 px-3 pb-3">
              <div className="grid gap-2 sm:grid-cols-2">
                <div>
                  <Label htmlFor="spendCap" className="text-xs">سقف الميزانية *</Label>
                  <Input
                    id="spendCap"
                    inputMode="decimal"
                    dir="ltr"
                    value={form.spendCap}
                    onChange={(e) => set("spendCap", e.target.value)}
                    placeholder="0"
                    className={cn(FIELD, HINT, errors.spendCap?.length && "border-destructive")}
                  />
                  {err("spendCap")}
                </div>
                <div>
                  <Label htmlFor="targetCostPerLead" className="text-xs">
                    {form.objective ? TARGET_METRIC_LABEL[form.objective] : "الرقم المستهدف"}{" "}
                    <span className="text-muted-foreground">— اختياري</span>
                  </Label>
                  <Input
                    id="targetCostPerLead"
                    inputMode="decimal"
                    dir="ltr"
                    value={form.targetCostPerLead}
                    onChange={(e) => set("targetCostPerLead", e.target.value)}
                    placeholder="0"
                    className={cn(FIELD, HINT, errors.targetCostPerLead?.length && "border-destructive")}
                  />
                  {err("targetCostPerLead")}
                </div>
                <div>
                  <Label htmlFor="startAt" className="text-xs">تبدأ *</Label>
                  <Input
                    id="startAt"
                    type="date"
                    dir="ltr"
                    value={form.startAt}
                    onChange={(e) => set("startAt", e.target.value)}
                    className={cn(FIELD, errors.startAt?.length && "border-destructive")}
                  />
                  {err("startAt")}
                </div>
                <div>
                  <Label htmlFor="endAt" className="text-xs">
                    تنتهي <span className="text-muted-foreground">— فارغة = مستمرّة</span>
                  </Label>
                  <Input
                    id="endAt"
                    type="date"
                    dir="ltr"
                    value={form.endAt}
                    onChange={(e) => set("endAt", e.target.value)}
                    className={cn(FIELD, errors.endAt?.length && "border-destructive")}
                  />
                  {err("endAt")}
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
        <div className="space-y-2">
          {/* ٢ · البريف */}
          <Card className="rounded-md">
            <CardHeader className="px-3 pb-1 pt-2.5">
              <CardTitle className="text-sm">
                ٢ · البريف <span className="ms-2 text-xs font-normal text-muted-foreground">عليه تُعطى الموافقة</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 px-3 pb-3">
              <div>
                <Label htmlFor="name" className="text-xs">اسم الحملة *</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="مثال: تقويم الأسنان — أكتوبر"
                  className={cn(FIELD, HINT, errors.name?.length && "border-destructive")}
                />
                {err("name")}
              </div>
              <div>
                <Label htmlFor="brief" className="text-xs">وصف الإعلان *</Label>
                <Textarea
                  id="brief"
                  rows={2}
                  value={form.brief}
                  onChange={(e) => set("brief", e.target.value)}
                  placeholder="مثال: أوّل شهر بنصف السعر لعيادات الأسنان — فيديو ريل ١٥ ثانية"
                  className={cn("mt-0.5 min-h-0 rounded py-1.5 text-sm", HINT, errors.brief?.length && "border-destructive")}
                />
                {err("brief")}
              </div>
              <div>
                <Label htmlFor="targetAudience" className="text-xs">
                  الجمهور المقصود <span className="text-muted-foreground">— اختياري</span>
                </Label>
                <Textarea
                  id="targetAudience"
                  rows={1}
                  value={form.targetAudience}
                  onChange={(e) => set("targetAudience", e.target.value)}
                  placeholder="مثال: أصحاب عيادات أسنان في الرياض وجدة"
                  className={cn("mt-0.5 min-h-0 rounded py-1.5 text-sm", HINT)}
                />
              </div>
              <div>
                <Label htmlFor="creativeUrl" className="text-xs">
                  رابط التصاميم <span className="text-muted-foreground">— اختياري، يراه الأدمن قبل الموافقة</span>
                </Label>
                <Input
                  id="creativeUrl"
                  dir="ltr"
                  value={form.creativeUrl}
                  onChange={(e) => set("creativeUrl", e.target.value)}
                  placeholder="https://drive.google.com/…"
                  className={cn(FIELD, HINT, "text-xs", errors.creativeUrl?.length && "border-destructive")}
                />
                {err("creativeUrl")}
              </div>
            </CardContent>
          </Card>

          {/* ٤ · الرابط والكود */}
          <Card className="rounded-md">
            <CardHeader className="px-3 pb-1 pt-2.5">
              <CardTitle className="text-sm">٤ · وين يروح العميل *</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 px-3 pb-3 text-xs">
              {/* The destination decides how a lead is attributed: only the website carries the
                  code in its link (Khalid, 29 Sep 2026 — most ads here go to WhatsApp). */}
              <div>
                <div role="radiogroup" aria-label="وين يروح العميل" id="destination" tabIndex={-1} className="flex flex-wrap gap-1.5">
                  {DESTINATIONS.map((d) => (
                    <button key={d} type="button" role="radio" aria-checked={form.destination === d} onClick={() => set("destination", d)} className={pill(form.destination === d)}>
                      {DESTINATION_LABEL[d]}
                    </button>
                  ))}
                </div>
                {err("destination")}
                {form.destination ? <p className="mt-1.5 text-[11px] text-muted-foreground">{DESTINATION_HINT[form.destination]}</p> : null}
              </div>
              {form.destination === "WEBSITE" ? (
                <div>
                  <Label htmlFor="landingPath" className="text-xs">
                    صفحة الوصول <span className="text-muted-foreground">— اختياري، فارغة = الرئيسية</span>
                  </Label>
                  <Input
                    id="landingPath"
                    dir="ltr"
                    value={form.landingPath}
                    onChange={(e) => set("landingPath", e.target.value)}
                    placeholder="/pricing"
                    className={cn(FIELD, HINT, "font-mono text-xs")}
                  />
                </div>
              ) : null}
              {url && form.destination === "WEBSITE" ? (
                <div className="flex items-center gap-2">
                  <p dir="ltr" className="min-w-0 flex-1 truncate rounded border bg-background px-2 py-1 font-mono text-[11px]" title={url}>{url}</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 shrink-0 px-2 text-[11px]"
                    onClick={() => {
                      navigator.clipboard.writeText(url);
                      toast({ title: "اتنسخ الرابط", variant: "success" });
                    }}
                  >
                    نسخ الرابط
                  </Button>
                </div>
              ) : null}
            </CardContent>
          </Card>

        </div>
      </div>

      {/* The note on its own full-width card (Khalid, 29 Sep 2026) — free text, not part of any step. */}
      <Card className="rounded-md">
        <CardContent className="px-3 py-2.5">
          <Label htmlFor="note" className="text-xs">
            ملاحظة <span className="text-muted-foreground">— اختيارية</span>
          </Label>
          <Textarea
            id="note"
            rows={2}
            value={form.note}
            onChange={(e) => set("note", e.target.value)}
            placeholder="مثال: جرّبنا نفس الإعلان في أغسطس وجاب ٧ عملاء"
            className={cn("mt-0.5 min-h-0 rounded py-1.5 text-sm", HINT)}
          />
        </CardContent>
      </Card>

      <div className="flex items-center gap-2">
        <Button type="submit" disabled={saving} className="h-9 gap-2 rounded">
          {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          {saving ? "جارٍ الحفظ…" : isEdit ? "حفظ التعديلات" : "إرسال للموافقة"}
        </Button>
        <Button type="button" variant="ghost" asChild className="ms-auto h-9 rounded">
          <Link href="/campaigns">إلغاء</Link>
        </Button>
      </div>
    </form>
  );
}
