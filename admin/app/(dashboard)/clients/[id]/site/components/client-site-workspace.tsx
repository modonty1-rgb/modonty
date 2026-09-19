"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { ArrowRight, Loader2, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ClientSiteSection, type ClientSiteKeyInfo } from "../../../components/form-sections/client-site-section";
import { updateClientSite } from "../../../actions/clients-actions/update-client-site";
import type { ClientFormSchemaType } from "../../../helpers/client-form-schema";

/**
 * **شاشةُ الربط — ثلاثةُ حقولٍ وزرُّ حفظٍ خاصٌّ بها.**
 *
 * واسمُها «النشر على موقعه» لا «الموقع و API» (خالد ١٩ سبتمبر ٢٠٢٦): الثاني يعدّ
 * أدواتِها — عنوانٌ ومفتاح — والأوّلُ يقول القرارَ الذي تُفتح من أجله. ومن يبحث عنها
 * يبحث عن «هل يُنشر على موقعه؟» لا عن «أين الـAPI؟».
 *
 * خالد (١٩ سبتمبر ٢٠٢٦): «الكلاينت سايت والـAPI ليه ما نطلعها في راوت لوحدها، أغلبيّتها
 * شغل تكنيكال»، ثمّ: «خلّينا في نفس التعديل ولكن في الكرت… نضيف أكشن بوتون ثاني يودّي
 * على الصفحة».
 *
 * ── ما كان ──
 * الحقولُ الثلاثة قسمٌ في صفحة التعديل، وتركب في نفس حمولة الحفظ
 * (`client-field-mapper.ts:128-130` → `use-client-form.ts:179`). فزرُّ «Save Changes»
 * الذي يصحّح هاتفاً هو نفسُه الذي يعلّق تسليمَ المقالات عن موقعٍ حيّ.
 *
 * ── ولماذا نموذجٌ محلّيٌّ لا `useClientForm` ──
 * `ClientSiteSection` مبنيٌّ على `UseFormReturn<ClientFormSchemaType>` ويقرأ ثلاثةَ
 * حقولٍ منه. فنموذجٌ محلّيٌّ بنفس النوع يعيد استعماله كما هو — بلا نسخِ واجهةٍ ثانيةٍ
 * لفحص النطاق ونسخِ العنوان. والحفظُ يمرّ بـ`updateClientSite` وحده، ومخطَّطُه يقصّ
 * كلَّ ما عدا الثلاثة.
 */
export function ClientSiteWorkspace({
  clientId,
  clientName,
  initial,
  keyInfo,
}: {
  clientId: string;
  clientName: string;
  initial: { articlesBaseUrl: string | null; canPublishToOwnSite: boolean; apiKeySuspended: boolean };
  keyInfo: ClientSiteKeyInfo;
}) {
  const { toast } = useToast();
  const [saving, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // نموذجٌ بثلاثة حقولٍ فقط، بنوع الشاشة الكاملة ليقبله `ClientSiteSection` كما هو.
  const form = useForm<ClientFormSchemaType>({
    defaultValues: {
      articlesBaseUrl: initial.articlesBaseUrl ?? "",
      canPublishToOwnSite: initial.canPublishToOwnSite,
      apiKeySuspended: initial.apiKeySuspended,
    } as Partial<ClientFormSchemaType> as ClientFormSchemaType,
  });

  const dirty = form.formState.isDirty;

  function save() {
    setError(null);
    const v = form.getValues();
    start(async () => {
      const res = await updateClientSite(clientId, {
        articlesBaseUrl: (v.articlesBaseUrl || "").trim() || null,
        canPublishToOwnSite: v.canPublishToOwnSite ?? false,
        apiKeySuspended: v.apiKeySuspended ?? false,
      });
      if (!res.ok) {
        setError(res.error);
        toast({ variant: "destructive", title: "لم يُحفظ", description: res.error });
        return;
      }
      form.reset(form.getValues());
      toast({ title: "حُفظ", description: "إعدادات موقع العميل محدَّثة." });
    });
  }

  return (
    <main dir="rtl" className="mx-auto flex max-w-3xl flex-col gap-4 pb-10">
      <header className="flex items-center gap-2">
        <Link
          href={`/clients/${clientId}/edit`}
          aria-label="رجوع لصفحة العميل"
          className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-accent"
        >
          <ArrowRight className="size-4" aria-hidden />
        </Link>
        <div className="min-w-0">
          <h1 className="truncate text-xl font-semibold">النشر على موقعه — {clientName}</h1>
          <p className="mt-0.5 text-[12px] text-muted-foreground">
            تُسلَّم مقالاتُه إلى موقعه بدل مدونتي. يُضبط مرّةً عند الربط.
          </p>
        </div>
      </header>

      <div dir="ltr" className="rounded-2xl border bg-card p-4">
        <ClientSiteSection form={form} clientId={clientId} keyInfo={keyInfo} />
      </div>

      {error ? (
        <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-[12px] text-destructive">
          {error}
        </p>
      ) : null}

      {/* زرُّ حفظٍ خاصٌّ بالثلاثة — لا يشترك مع زرّ صفحة التعديل. */}
      <div className="flex items-center gap-3">
        <Button onClick={save} disabled={saving || !dirty} className="gap-2">
          {saving ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Save className="size-4" aria-hidden />}
          {saving ? "جارٍ الحفظ…" : "حفظ إعدادات الموقع"}
        </Button>
        <span className="text-[12px] text-muted-foreground">
          {dirty ? "تغييراتٌ غير محفوظة" : "لا تغييرات"}
        </span>
      </div>
    </main>
  );
}
