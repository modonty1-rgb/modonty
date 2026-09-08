"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function ArchivePersonFilter({ people, value }: { people: [string, string][]; value: string }) {
  const router = useRouter();
  const params = useSearchParams();
  return <label className="min-w-52 flex-1 text-xs text-muted-foreground">الموظف
    <Select value={value || "all"} onValueChange={(next) => { const query = new URLSearchParams(params.toString()); if (next === "all") query.delete("person"); else query.set("person", next); router.push(`/tasks/archive?${query.toString()}`); }}>
      <SelectTrigger className="mt-1 h-8 w-full"><SelectValue placeholder="كل الموظفين" /></SelectTrigger>
      <SelectContent><SelectGroup><SelectItem value="all">كل الموظفين</SelectItem>{people.map(([id, name]) => <SelectItem key={id} value={id}>{name}</SelectItem>)}</SelectGroup></SelectContent>
    </Select>
  </label>;
}
