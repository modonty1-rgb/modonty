import { ArrowDown, ArrowUp, Check, Minus, Pause, Play, Save, Star } from "lucide-react";
import { FEATURE_UNIT_LABELS } from "@modonty/shared/lib/commercial/feature-unit-labels";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { db } from "@/lib/db";
import { createCommercialFeature, moveCommercialFeature, setCommercialFeatureActive, setCommercialFeatureBillable, setCommercialFeatureHighlighted, updateCommercialFeature } from "../commercial-plans/actions";
import { FeaturePlanAssignments } from "./components/feature-plan-assignments";

export const dynamic = "force-dynamic";

export default async function CommercialFeaturesPage() {
  const [features, plans] = await Promise.all([
    db.commercialFeature.findMany({ include: { assignments: { select: { planId: true } } }, orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }] }),
    db.commercialPlan.findMany({ select: { id: true, name: true }, orderBy: { displayOrder: "asc" } }),
  ]);
  const last = features.length - 1;

  return <main className="mx-auto flex max-w-6xl flex-col gap-6 pb-12" dir="rtl">
    <header><p className="text-sm text-muted-foreground">إدارة الدفع</p><h1 className="text-2xl font-semibold">مكتبة المزايا</h1><p className="mt-1 text-sm text-muted-foreground">كل سطر ميزة واحدة: اسمها ووحدتها كما ستُطبع على بطاقة الباقة. الكمّية تُحدَّد داخل كل باقة.</p></header>

    <Card>
      <CardHeader><CardTitle>إضافة ميزة</CardTitle><CardDescription>الاسم يُكتب كاملاً كما يقرؤه المشتري. والوحدة تُطبع بعد الكمّية («١٢ مقال/شهر») — اتركها «بلا وحدة» لميزة بلا عدد.</CardDescription></CardHeader>
      <CardContent>
        <form id="create-feature" action={createCommercialFeature} className="grid gap-3 md:grid-cols-[minmax(0,1.5fr)_minmax(0,0.9fr)_minmax(0,1.8fr)_auto] md:items-end">
          <label className="flex flex-col gap-1.5 text-xs font-medium text-muted-foreground">اسم الميزة<Input className="h-9" name="name" maxLength={80} placeholder="مقالات شهرية" required/></label>
          <label className="flex flex-col gap-1.5 text-xs font-medium text-muted-foreground">الوحدة
            <select name="unitLabel" className="h-9 rounded-md border border-input bg-background px-2 text-sm" defaultValue="">
              <option value="">بلا وحدة</option>
              {FEATURE_UNIT_LABELS.map((u) => <option key={u} value={u}>{u}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1.5 text-xs font-medium text-muted-foreground">وصف تفصيلي<Input className="h-9" name="description" maxLength={300} placeholder="سطر يظهر تحت الميزة عند الحاجة"/></label>
          <Button className="h-9" type="submit">إضافة</Button>
        </form>
      </CardContent>
    </Card>

    <Card>
      <CardHeader><CardTitle>المزايا</CardTitle><CardDescription>الترتيب هنا هو ترتيب الظهور على بطاقة الباقة. عدّل الصفّ ثم احفظه؛ حدّد الباقات التي تتضمّنه واحفظها على حدة. وعمود «في الفاتورة» يقرّر ما ينزل في الفاتورة بوصفه التزاماً — البطاقة تعرض الكل، والفاتورة ما تستطيع إثبات تسليمه.</CardDescription></CardHeader>
      <CardContent>
        {features.length === 0 ? <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">لا توجد مزايا بعد — أضِف الأولى من النموذج أعلاه.</p> : <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader><TableRow className="bg-muted/40 hover:bg-muted/40"><TableHead className="h-9 w-20 text-right">الترتيب</TableHead><TableHead className="h-9 text-right">الميزة</TableHead><TableHead className="h-9 w-32 text-right">الوحدة</TableHead><TableHead className="h-9 text-right">وصف تفصيلي</TableHead><TableHead className="h-9 w-24 text-right">مميّزة</TableHead><TableHead className="h-9 w-28 text-right">في الفاتورة</TableHead><TableHead className="h-9 text-right">الباقات المتضمنة</TableHead><TableHead className="h-9 w-24 text-right">إجراءات</TableHead></TableRow></TableHeader>
            <TableBody>
              {features.map((feature, index) => {
                const formId = `feature-${feature.id}`;
                return <TableRow key={feature.id} className={feature.isActive ? undefined : "opacity-60"}>
                  <TableCell className="py-2">
                    <div className="flex gap-1">
                      <form action={moveCommercialFeature.bind(null, feature.id, "up")}><Button type="submit" size="icon" variant="ghost" className="size-8" disabled={index === 0} aria-label={`تقديم «${feature.name}»`} title="تقديم"><ArrowUp /></Button></form>
                      <form action={moveCommercialFeature.bind(null, feature.id, "down")}><Button type="submit" size="icon" variant="ghost" className="size-8" disabled={index === last} aria-label={`تأخير «${feature.name}»`} title="تأخير"><ArrowDown /></Button></form>
                    </div>
                  </TableCell>
                  <TableCell className="py-2"><form id={formId} action={updateCommercialFeature.bind(null, feature.id)}><Input className="h-9" name="name" maxLength={80} defaultValue={feature.name} aria-label="اسم الميزة" required/></form></TableCell>
                  <TableCell className="py-2">
                    <select form={formId} name="unitLabel" defaultValue={feature.unitLabel ?? ""} aria-label="وحدة الميزة" className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm">
                      <option value="">بلا وحدة</option>
                      {FEATURE_UNIT_LABELS.map((u) => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </TableCell>
                  <TableCell className="py-2"><Input form={formId} className="h-9" name="description" maxLength={300} defaultValue={feature.description ?? ""} placeholder="—" aria-label="وصف تفصيلي للميزة"/></TableCell>
                  <TableCell className="py-2">
                    <form action={setCommercialFeatureHighlighted.bind(null, feature.id, !feature.isHighlighted)}>
                      <Button type="submit" size="sm" className="h-8 gap-1.5" variant={feature.isHighlighted ? "secondary" : "outline"} title={feature.isHighlighted ? "تُطبع عريضة على البطاقة — اضغط لإلغاء" : "سطر عادي — اضغط لإبرازه"}>
                        {feature.isHighlighted ? <><Star data-icon="inline-start" /> مميّزة</> : <><Minus data-icon="inline-start" /> عادية</>}
                      </Button>
                    </form>
                  </TableCell>
                  <TableCell className="py-2">
                    <form action={setCommercialFeatureBillable.bind(null, feature.id, !feature.billable)}>
                      <Button type="submit" size="sm" className="h-8 gap-1.5" variant={feature.billable ? "secondary" : "outline"} title={feature.billable ? "تنزل في الفاتورة — اضغط لإخراجها" : "لا تنزل في الفاتورة — اضغط لإدخالها"}>
                        {feature.billable ? <><Check data-icon="inline-start" /> تنزل</> : <><Minus data-icon="inline-start" /> لا</>}
                      </Button>
                    </form>
                  </TableCell>
                  <TableCell className="py-2"><FeaturePlanAssignments featureId={feature.id} plans={plans} assignedPlanIds={feature.assignments.map((assignment) => assignment.planId)} /></TableCell>
                  <TableCell className="py-2">
                    <div className="flex gap-1.5">
                      <Button form={formId} type="submit" size="icon" className="size-8" variant="outline" aria-label={`حفظ «${feature.name}»`} title="حفظ الميزة"><Save data-icon="inline-start" /></Button>
                      <form action={setCommercialFeatureActive.bind(null, feature.id, !feature.isActive)}><Button type="submit" size="icon" className="size-8" variant={feature.isActive ? "secondary" : "outline"} aria-label={feature.isActive ? `إيقاف «${feature.name}»` : `تفعيل «${feature.name}»`} title={feature.isActive ? "إيقاف الميزة" : "تفعيل الميزة"}>{feature.isActive ? <Pause data-icon="inline-start" /> : <Play data-icon="inline-start" />}</Button></form>
                    </div>
                  </TableCell>
                </TableRow>;
              })}
            </TableBody>
          </Table>
        </div>}
      </CardContent>
    </Card>
  </main>;
}
