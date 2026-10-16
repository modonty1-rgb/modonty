import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { BriefMeta } from "../helpers/get-brief-meta";
import { SliceTable } from "./slice-table";

/** توزيع ميتا في تبويبات — المنصّة · العمر والجنس · يوم بيوم — بدل ثلاث جداول فوق بعض. */
export function MetaTabs({ meta, submissionsByDay }: { meta: Extract<BriefMeta, { ok: true }>; submissionsByDay: Map<string, number> }) {
  return (
    <Tabs defaultValue="day" dir="rtl" className="space-y-2">
      <TabsList>
        <TabsTrigger value="day">يوم بيوم</TabsTrigger>
        <TabsTrigger value="age">العمر والجنس</TabsTrigger>
        <TabsTrigger value="platform">المنصّة</TabsTrigger>
      </TabsList>
      <TabsContent value="day">
        <SliceTable
          rows={[...meta.byDay].reverse().map((d) => ({ label: d.day, spend: d.spend, clicks: d.clicks, leads: d.leads, extra: submissionsByDay.get(d.day) ?? 0 }))}
          extraLabel="تسجيلات (قاعدتنا)"
        />
      </TabsContent>
      <TabsContent value="age">
        <SliceTable rows={meta.byAgeGender} />
      </TabsContent>
      <TabsContent value="platform">
        <SliceTable rows={meta.byPlatform} />
      </TabsContent>
    </Tabs>
  );
}
