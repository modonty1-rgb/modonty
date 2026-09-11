import { Button } from "@/components/ui/button";
import { Pause, Play, Save } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { db } from "@/lib/db";
import { createCommercialFeature, setCommercialFeatureActive, updateCommercialFeature } from "../commercial-plans/actions";
import { FeaturePlanAssignments } from "./components/feature-plan-assignments";

export const dynamic = "force-dynamic";

export default async function CommercialFeaturesPage() {
  const [features, plans] = await Promise.all([
    db.commercialFeature.findMany({ include: { assignments: { select: { planId: true } } }, orderBy: { displayOrder: "asc" } }),
    db.commercialPlan.findMany({ select: { id: true, name: true }, orderBy: { displayOrder: "asc" } }),
  ]);
  return <main className="mx-auto flex max-w-5xl flex-col gap-6 pb-12" dir="rtl">
    <header><p className="text-sm text-muted-foreground">إدارة الدفع</p><h1 className="text-2xl font-semibold">جدول المزايا</h1><p className="mt-1 text-sm text-muted-foreground">كل سطر ميزة واحدة؛ بعدها تختارها للباقات عند الحاجة.</p></header>
    <Card><CardHeader><CardTitle>إضافة ميزة</CardTitle></CardHeader><CardContent><form action={createCommercialFeature} className="flex max-w-xl gap-2"><Input name="name" placeholder="اسم الميزة" required/><Button type="submit">إضافة</Button></form></CardContent></Card>
    <Card><CardHeader><CardTitle>المزايا</CardTitle><CardDescription>ضع علامة على الباقات التي تتضمن الميزة، ثم احفظ. ستظهر الميزة ضمن تفاصيل الباقة نفسها.</CardDescription></CardHeader><CardContent>{features.length === 0 ? <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">لا توجد مزايا بعد.</p> : <Table><TableHeader><TableRow><TableHead className="text-right">اسم الميزة</TableHead><TableHead className="text-right">الباقات المتضمنة</TableHead><TableHead className="w-24 text-right">إجراءات</TableHead></TableRow></TableHeader><TableBody>{features.map((feature) => <TableRow key={feature.id}><TableCell><form id={`feature-${feature.id}`} action={updateCommercialFeature.bind(null, feature.id)}><Input name="name" defaultValue={feature.name} required/></form></TableCell><TableCell><FeaturePlanAssignments featureId={feature.id} plans={plans} assignedPlanIds={feature.assignments.map((assignment) => assignment.planId)} /></TableCell><TableCell><div className="flex gap-2"><Button form={`feature-${feature.id}`} type="submit" size="icon" className="size-8" variant="outline" aria-label="حفظ اسم الميزة" title="حفظ اسم الميزة"><Save data-icon="inline-start" /></Button><form action={setCommercialFeatureActive.bind(null, feature.id, !feature.isActive)}><Button type="submit" size="icon" className="size-8" variant={feature.isActive ? "secondary" : "outline"} aria-label={feature.isActive ? "إيقاف الميزة" : "تفعيل الميزة"} title={feature.isActive ? "إيقاف الميزة" : "تفعيل الميزة"}>{feature.isActive ? <Pause data-icon="inline-start" /> : <Play data-icon="inline-start" />}</Button></form></div></TableCell></TableRow>)}</TableBody></Table>}</CardContent></Card>
  </main>;
}
