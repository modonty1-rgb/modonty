"use client";

import { useState } from "react";
import { Wrench, Database, Eraser, RefreshCw } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SyncLocalDialog } from "./sync-local-button";
import { WipeOrdersDialog } from "./wipe-orders-button";
import { RebuildOrdersDialog } from "./rebuild-orders-dialog";

/**
 * أدوات التطوير — قائمةٌ واحدة بدل أيقونتين في الشريط.
 *
 * كانت المزامنةُ والإخلاءُ أيقونتين متجاورتين، فأخذتا مكاناً في شريطٍ يُستعمل كلَّ يوم
 * لعملٍ لا يُستعمل إلّا في اللوكل (خالد ١٧ سبتمبر ٢٠٢٦: «شيل المسح والـsync، حطّها جوّا»).
 * وهما خطوتان في حلقةٍ واحدة — تُجلب نسخةُ الإنتاج ثمّ تُخلى الطلبات — فاجتماعُهما تحت
 * مدخلٍ واحد يقول ذلك بنفسه.
 *
 * النوافذُ تُدار من هنا لا من داخلها: عنصرُ القائمة يُغلق القائمةَ عند النقر، فلو كانت
 * النافذةُ معلّقةً به سقطت معه قبل أن تُفتح.
 *
 * `enabled` عرضٌ لا حماية — كلا المسارين يرفض أيّ قاعدةٍ لا تحوي `modonty_dev`.
 */
export function DevToolsMenu({ enabled }: { enabled: boolean }) {
  const [syncOpen, setSyncOpen] = useState(false);
  const [wipeOpen, setWipeOpen] = useState(false);
  const [rebuildOpen, setRebuildOpen] = useState(false);

  if (!enabled) return null;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label="Development tools"
            title="أدوات التطوير (قاعدة الاختبار فقط)"
            className="inline-flex size-8 items-center justify-center rounded-md border border-amber-500/30 bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 dark:text-amber-400"
          >
            <Wrench className="size-4" aria-hidden />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-72">
          <DropdownMenuLabel className="text-[11px] font-normal text-muted-foreground">
            أدوات التطوير — تعمل على{" "}
            <code className="bg-muted rounded px-1">modonty_dev</code> وحدها
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuItem
            onSelect={() => {
              // تُترك القائمةُ تُغلق كعادتها، ثمّ تُفتح النافذةُ في الدورة التالية.
              //
              // جُرّب `e.preventDefault()` أوّلاً فبقيت القائمةُ مفتوحةً خلف النافذة
              // (`data-state="open"`)، وبإغلاق النافذة علقت الصفحة: يبقى على `html`
              // قفلُ التمرير و`pointer-events` فلا يستجيب شيء. مقيسٌ حيّاً ١٧ سبتمبر ٢٠٢٦.
              setTimeout(() => setSyncOpen(true), 0);
            }}
            className="cursor-pointer gap-2"
          >
            <Database className="size-4 text-amber-600 dark:text-amber-400" aria-hidden />
            <div className="flex flex-col">
              <span className="text-sm">مزامنة من الإنتاج</span>
              <span className="text-[11px] text-muted-foreground">
                نسخةٌ طبق الأصل — تمسح المحليّة
              </span>
            </div>
          </DropdownMenuItem>

          <DropdownMenuItem
            onSelect={() => {
              setTimeout(() => setRebuildOpen(true), 0);
            }}
            className="cursor-pointer gap-2"
          >
            <RefreshCw className="size-4 text-red-600 dark:text-red-400" aria-hidden />
            <div className="flex flex-col">
              <span className="text-sm">إعادة بناء الطلبات</span>
              <span className="text-[11px] text-muted-foreground">
                إخلاءٌ ثمّ طلبٌ لكلّ عميل من بياناته
              </span>
            </div>
          </DropdownMenuItem>

          <DropdownMenuItem
            onSelect={() => {
              setTimeout(() => setWipeOpen(true), 0);
            }}
            className="cursor-pointer gap-2"
          >
            <Eraser className="size-4 text-muted-foreground" aria-hidden />
            <div className="flex flex-col">
              <span className="text-sm">إخلاءٌ فقط</span>
              <span className="text-[11px] text-muted-foreground">
                بلا بناء — لفحص قاعدةٍ فارغة
              </span>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <SyncLocalDialog open={syncOpen} onOpenChange={setSyncOpen} />
      <WipeOrdersDialog open={wipeOpen} onOpenChange={setWipeOpen} />
      <RebuildOrdersDialog open={rebuildOpen} onOpenChange={setRebuildOpen} />
    </>
  );
}
