import { ArrowDown, ArrowUp, Pause, Play, Save } from "lucide-react";
import { FEATURE_ICON_NAMES } from "@modonty/shared/lib/commercial/feature-icon-names";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { db } from "@/lib/db";
import { createCommercialFeature, moveCommercialFeature, setCommercialFeatureActive, updateCommercialFeature } from "../commercial-plans/actions";
import { FeatureIconSelect } from "./components/feature-icon-select";
import { FeaturePlanAssignments } from "./components/feature-plan-assignments";

export const dynamic = "force-dynamic";

export default async function CommercialFeaturesPage() {
  const [features, plans] = await Promise.all([
    db.commercialFeature.findMany({ include: { assignments: { select: { planId: true } } }, orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }] }),
    db.commercialPlan.findMany({ select: { id: true, name: true }, orderBy: { displayOrder: "asc" } }),
  ]);
  const last = features.length - 1;

  return <main className="mx-auto flex max-w-6xl flex-col gap-6 pb-12" dir="rtl">
    <header><p className="text-sm text-muted-foreground">إدارة الدفع</p><h1 className="text-2xl font-semibold">مكتبة المزايا</h1><p className="mt-1 text-sm text-muted-foreground">كل سطر ميزة واحدة: اسمها ووحدتها وأيقونتها كما ستُطبع على بطاقة الباقة. الكمّية تُحدَّد داخل كل باقة.</p></header>

    <Card>
      <CardHeader><CardTitle>إضافة ميزة</CardTitle><CardDescription>الوحدة تُطبع بعد الكمّية («٤ مقال»)؛ اتركها فارغة لميزة بلا عدد.</CardDescription></CardHeader>
      <CardContent>
        <form id="create-feature" action={createCommercialFeature} className="grid gap-3 md:grid-cols-[minmax(0,1.4fr)_minmax(0,0.7fr)_minmax(0,1.6fr)_auto_auto] md:items-end">
          <label className="flex flex-col gap-1.5 text-xs font-medium text-muted-foreground">اسم الميزة<Input className="h-9" name="name" maxLength={80} placeholder="مقالات شهرية" required/></label>
          <label className="flex flex-col gap-1.5 text-xs font-medium text-muted-foreground">الوحدة<Input className="h-9" name="unitLabel" maxLength={20} placeholder="مقال"/></label>
          <label className="flex flex-col gap-1.5 text-xs font-medium text-muted-foreground">الوصف<Input className="h-9" name="description" maxLength={300} placeholder="يظهر تحت الميزة عند الحاجة"/></label>
          <div className="flex flex-col gap-1.5 text-xs font-medium text-muted-foreground"><span>الأيقونة</span><FeatureIconSelect formId="create-feature" names={FEATURE_ICON_NAMES} defaultValue={null}/></div>
          <Button className="h-9" type="submit">إضافة</Button>
        </form>
      </CardContent>
    </Card>

    <Card>
      <CardHeader><CardTitle>المزايا</CardTitle><CardDescription>الترتيب هنا هو ترتيب الظهور على بطاقة الباقة. عدّل الصفّ ثم احفظه؛ حدّد الباقات التي تتضمّنه واحفظها على حدة.</CardDescription></CardHeader>
      <CardContent>
        {features.length === 0 ? <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">لا توجد مزايا بعد — أضِف الأولى من النموذج أعلاه.</p> : <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader><TableRow className="bg-muted/40 hover:bg-muted/40"><TableHead className="h-9 w-20 text-right">الترتيب</TableHead><TableHead className="h-9 text-right">الميزة</TableHead><TableHead className="h-9 w-32 text-right">الوحدة</TableHead><TableHead className="h-9 text-right">الوصف</TableHead><TableHead className="h-9 w-48 text-right">الأيقونة</TableHead><TableHead className="h-9 text-right">الباقات المتضمنة</TableHead><TableHead className="h-9 w-24 text-right">إجراءات</TableHead></TableRow></TableHeader>
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
                  <TableCell className="py-2"><Input form={formId} className="h-9" name="unitLabel" maxLength={20} defaultValue={feature.unitLabel ?? ""} placeholder="—" aria-label="وحدة الميزة"/></TableCell>
                  <TableCell className="py-2"><Input form={formId} className="h-9" name="description" maxLength={300} defaultValue={feature.description ?? ""} placeholder="—" aria-label="وصف الميزة"/></TableCell>
                  <TableCell className="py-2"><FeatureIconSelect formId={formId} names={FEATURE_ICON_NAMES} defaultValue={feature.icon}/></TableCell>
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
