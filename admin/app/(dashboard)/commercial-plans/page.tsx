import { SubscriptionTier } from "@prisma/client";
import { PackageOpen } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { db } from "@/lib/db";
import { addCommercialPlanTerm, deleteCommercialPlan, deleteCommercialPlanTerm, setCommercialPlanPublished, updateCommercialPlan, updateCommercialPlanMarketPrices, updateCommercialPlanTerm } from "./actions";
import { ConfirmDeleteButton } from "./components/confirm-delete-button";
import { CreateCommercialPlanForm } from "./components/create-commercial-plan-form";
import { DeleteCommercialPlanButton } from "./components/delete-commercial-plan-button";
import { PlanPanel } from "./components/plan-panel";

export const dynamic = "force-dynamic";

const TIER_VALUES = [SubscriptionTier.BASIC, SubscriptionTier.STANDARD, SubscriptionTier.PRO, SubscriptionTier.PREMIUM];

/** The whole commercial catalogue stays on one screen: this product has 3–4 plans, not hundreds. */
export default async function CommercialPlansPage() {
  const [plans, tierConfigs] = await Promise.all([
    db.commercialPlan.findMany({
      include: {
        prices: { orderBy: { market: "desc" } },
        terms: { orderBy: { displayOrder: "asc" } },
        features: { include: { feature: true }, orderBy: { displayOrder: "asc" } },
      },
      orderBy: { displayOrder: "asc" },
    }),
    db.subscriptionTierConfig.findMany({ select: { tier: true, name: true } }),
  ]);
  const tierLabel = (tier: SubscriptionTier) => tierConfigs.find((config) => config.tier === tier)?.name ?? tier;

  return <main className="mx-auto flex max-w-6xl flex-col gap-5 pb-8" dir="rtl">
    <header className="flex flex-wrap items-end justify-between gap-2"><div className="flex flex-col gap-1"><h1 className="text-2xl font-semibold">الباقات والأسعار</h1><p className="text-sm text-muted-foreground">راجع الباقات وانشرها، وافتح التفاصيل عند الحاجة للتعديل.</p></div>{plans.length > 0 ? <p className="text-sm text-muted-foreground">{plans.length} باقات في الكتالوج</p> : null}</header>
    <CreateCommercialPlanForm />

    {plans.length === 0 ? <section className="flex flex-col items-center gap-3 rounded-xl border border-dashed bg-muted/20 px-6 py-14 text-center"><PackageOpen className="size-9 text-muted-foreground" aria-hidden/><h2 className="font-semibold">لا توجد باقات تجارية بعد</h2><p className="max-w-md text-sm text-muted-foreground">استخدم «إضافة باقة جديدة» لإنشاء أول مسودة.</p></section> : <section className="flex flex-col gap-3" aria-label="الباقات الحالية">{plans.map((plan) => {
      const sa = plan.prices.find((price) => price.market === "SA"); const eg = plan.prices.find((price) => price.market === "EG");
      return <PlanPanel key={plan.id} defaultOpen={false} header={<div className="flex flex-wrap items-center gap-x-8 gap-y-3"><div className="flex items-center gap-2"><h2 className="font-semibold">{plan.name}</h2><Badge variant={plan.isPublished ? "default" : "secondary"}>{plan.isPublished ? "منشورة" : "مسودة"}</Badge>{plan.badge ? <Badge variant="outline">{plan.badge}</Badge> : null}</div><dl className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm"><div className="flex items-baseline gap-2"><dt className="text-muted-foreground">السعودية</dt><dd className="tabular-nums">{sa ? `${sa.monthlyBase} SAR` : "—"}<span className="ms-1 text-muted-foreground">/ شهر</span></dd></div><div className="flex items-baseline gap-2"><dt className="text-muted-foreground">مصر</dt><dd className="tabular-nums">{eg ? `${eg.monthlyBase} EGP` : "—"}<span className="ms-1 text-muted-foreground">/ شهر</span></dd></div><div className="flex items-baseline gap-2"><dt className="text-muted-foreground">المقالات</dt><dd className="tabular-nums">{plan.articlesPerMonth ?? 0}<span className="ms-1 text-muted-foreground">/ شهر</span></dd></div></dl></div>}>
        <div className="flex flex-col gap-4">
          <section className="rounded-lg border p-4">
            <div className="mb-3"><h3 className="text-sm font-semibold">بيانات الباقة</h3><p className="text-xs text-muted-foreground">الاسم والوصف والشارة كما تظهر للزائر.</p></div>
            <form action={updateCommercialPlan.bind(null, plan.id)} className="flex flex-col gap-3">
              <label className="flex flex-col gap-1.5 text-xs font-medium text-muted-foreground">الاسم<Input className="h-9" name="name" maxLength={60} defaultValue={plan.name} required/></label>
              <label className="flex flex-col gap-1.5 text-xs font-medium text-muted-foreground">الوصف<Textarea name="description" maxLength={300} defaultValue={plan.description ?? ""} rows={2}/></label>
              <label className="flex flex-col gap-1.5 text-xs font-medium text-muted-foreground">الشارة<Input className="h-9" name="badge" maxLength={30} placeholder="الأكثر طلباً" defaultValue={plan.badge ?? ""}/></label>
              <label className="flex flex-col gap-1.5 text-xs font-medium text-muted-foreground">فئة الاشتراك
                <Select name="tier" defaultValue={plan.tier ?? undefined}>
                  <SelectTrigger className="h-9"><SelectValue placeholder="بلا فئة — لن تُنشر"/></SelectTrigger>
                  <SelectContent>{TIER_VALUES.map((tier) => <SelectItem key={tier} value={tier}>{tierLabel(tier)}</SelectItem>)}</SelectContent>
                </Select>
              </label>
              <Button className="h-9 self-start" type="submit" variant="outline">حفظ بيانات الباقة</Button>
            </form>
          </section>

          <section className="rounded-lg border bg-muted/30 p-4">
            <div className="mb-3"><h3 className="text-sm font-semibold">الأساس الشهري</h3><p className="text-xs text-muted-foreground">تُحسب أسعار المدد أدناه من هذه القيم.</p></div>
            <form action={updateCommercialPlanMarketPrices.bind(null, plan.id)} className="grid grid-cols-2 gap-3 lg:grid-cols-[repeat(3,minmax(0,1fr))_auto] lg:items-end">
              <label className="flex flex-col gap-1.5 text-xs font-medium text-muted-foreground">السعودية (SAR)<Input className="h-9" name="sa" type="number" min="0" defaultValue={sa?.monthlyBase ?? 0} required/></label>
              <label className="flex flex-col gap-1.5 text-xs font-medium text-muted-foreground">مصر (EGP)<Input className="h-9" name="eg" type="number" min="0" defaultValue={eg?.monthlyBase ?? 0} required/></label>
              <label className="flex flex-col gap-1.5 text-xs font-medium text-muted-foreground">مقالات / شهر<Input className="h-9" name="articlesPerMonth" type="number" min="0" defaultValue={plan.articlesPerMonth ?? 0} required/></label>
              <Button className="h-9 col-span-2 lg:col-span-1" type="submit" variant="outline">حفظ الأساس</Button>
            </form>
          </section>

          <section className="rounded-lg border p-4">
            <div className="mb-3"><h3 className="text-sm font-semibold">المدد والهدايا</h3><p className="text-xs text-muted-foreground">الأسعار الظاهرة إجماليات محسوبة تلقائيًا.</p></div>
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader><TableRow className="bg-muted/40 hover:bg-muted/40"><TableHead className="h-9 w-24 text-right">المدة</TableHead><TableHead className="h-9 w-24 text-right">الهدية</TableHead><TableHead className="h-9 text-right">السعودية</TableHead><TableHead className="h-9 text-right">مصر</TableHead><TableHead className="h-9 w-28 text-right">إجراءات</TableHead></TableRow></TableHeader>
                <TableBody>
                  {plan.terms.map((term) => <TableRow key={term.id}><TableCell className="py-2"><form id={`term-${term.id}`} action={updateCommercialPlanTerm.bind(null, term.id)}><input type="hidden" name="planId" value={plan.id}/><Input className="h-8 w-16" name="paidMonths" type="number" min="1" defaultValue={term.paidMonths} required/></form></TableCell><TableCell className="py-2"><Input form={`term-${term.id}`} className="h-8 w-16" name="bonusMonths" type="number" min="0" defaultValue={term.bonusServiceMonths} required/></TableCell><TableCell className="py-2 text-right font-medium tabular-nums">{sa ? `${sa.monthlyBase * term.paidMonths} SAR` : "—"}</TableCell><TableCell className="py-2 text-right font-medium tabular-nums">{eg ? `${eg.monthlyBase * term.paidMonths} EGP` : "—"}</TableCell><TableCell className="py-2"><div className="flex justify-end gap-1.5"><Button form={`term-${term.id}`} className="h-8" type="submit" size="sm" variant="outline">حفظ</Button><ConfirmDeleteButton action={deleteCommercialPlanTerm.bind(null, term.id, plan.id)} triggerLabel="حذف" confirmLabel="نعم، احذف المدة" title={`حذف مدة ${term.paidMonths} أشهر؟`} description="سيُحذف السعر المحسوب لهذه المدة من كل الأسواق. لا يمكن التراجع عن هذه العملية." size="sm" className="h-8" /></div></TableCell></TableRow>)}
                  <TableRow className="bg-muted/20 hover:bg-muted/20"><TableCell className="py-2"><form id={`add-term-${plan.id}`} action={addCommercialPlanTerm.bind(null, plan.id)}><Input className="h-8 w-16" name="paidMonths" type="number" min="1" placeholder="مدة" required/></form></TableCell><TableCell className="py-2"><Input form={`add-term-${plan.id}`} className="h-8 w-16" name="bonusMonths" type="number" min="0" placeholder="هدية" required/></TableCell><TableCell className="py-2 text-right text-xs text-muted-foreground" colSpan={2}>تُحسب الأسعار تلقائيًا بعد الإضافة</TableCell><TableCell className="py-2"><div className="flex justify-end"><Button form={`add-term-${plan.id}`} className="h-8" type="submit" size="sm" variant="outline">إضافة مدة</Button></div></TableCell></TableRow>
                </TableBody>
              </Table>
            </div>
          </section>

          <section className="rounded-lg border p-4">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2"><h3 className="text-sm font-semibold">المزايا المتضمنة</h3><Link href={`/commercial-plans/${plan.id}`} className="text-xs text-primary underline-offset-2 hover:underline">إدارة المزايا وتفاصيل الباقة ←</Link></div>
            {plan.features.length === 0 ? <p className="text-xs text-muted-foreground">لم تُربط مزايا بهذه الباقة بعد.</p> : <ul className="flex flex-wrap gap-1.5">{plan.features.map((item) => <li key={item.id}><Badge variant="secondary">{item.feature.name}</Badge></li>)}</ul>}
          </section>

          <section className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground"><span>الحالة الحالية:</span><Badge variant={plan.isPublished ? "default" : "secondary"}>{plan.isPublished ? "منشورة" : "مسودة"}</Badge></div>
            <div className="flex items-center gap-3">
              <form action={setCommercialPlanPublished.bind(null, plan.id, !plan.isPublished)}><Button className="h-8" type="submit" size="sm" variant={plan.isPublished ? "outline" : "default"}>{plan.isPublished ? "إيقاف النشر" : "نشر"}</Button></form>
              <div className="h-5 w-px bg-border" aria-hidden />
              <DeleteCommercialPlanButton action={deleteCommercialPlan.bind(null, plan.id)} planName={plan.name}/>
            </div>
          </section>
        </div>
      </PlanPanel>;
    })}</section>}
  </main>;
}
