import { Badge } from "@/components/ui/badge";
import { Bot } from "lucide-react";

import { getPromptsForApp } from "./actions/modo-prompt-actions";
import { PromptCard } from "./components/prompt-card";

/**
 * مودو — شخصيته وتعليماته، صفحة مستقلّة (خالد، ٢٨ أغسطس ٢٠٢٦: «أبغى مودو صفحة لوحده»).
 *
 * الثلاثة هنا هي **كل** ما يعرفه مودو عن نفسه: من هو، وكيف يجيب داخل تصنيف، وكيف يجيب
 * داخل مقال. تعديل كلمة هنا يغيّر ما يقوله لكل زائر — بلا نشر.
 */
export default async function ModoPromptsPage() {
  const prompts = await getPromptsForApp("modonty");
  const inDb = prompts.filter((p) => p.source === "db").length;

  return (
    <div className="mx-auto max-w-[900px]">
      <header className="mb-5">
        <div className="flex flex-wrap items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-semibold">مودو — الشخصية والتعليمات</h1>
          <Badge variant="secondary" className="text-xs">{prompts.length}</Badge>
          {inDb < prompts.length && (
            <Badge variant="outline" className="border-yellow-500/30 bg-yellow-500/10 text-xs text-yellow-600">
              {prompts.length - inDb} ما زال يقرأ من الكود
            </Badge>
          )}
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          هذه هي كل تعليمات مودو. أي تعديل هنا يظهر للزائر فوراً بعد الحفظ — بلا نشر.
          {inDb < prompts.length && " «من الكود» يعني أن الصفّ لم يُكتب بعد: شغّل «AI Prompts» في صفحة الصيانة، أو احفظ البطاقة مباشرةً."}
        </p>
      </header>

      <div className="space-y-4">
        {prompts.map((p) => (
          <PromptCard key={p.key} prompt={p} />
        ))}
      </div>
    </div>
  );
}
