"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Archive, ClipboardCheck, KanbanSquare, LayoutGrid, Send, UserCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { RealtimeEvent, staffChannel } from "@/lib/realtime/channels";
import { useRealtime } from "@/lib/realtime/use-realtime";

const ITEMS = [
  { href: "/tasks", label: "Board", icon: LayoutGrid, hint: "Four columns — where the work stands" },
  // Tasks you sent to a colleague that they finished — waiting for your approval or your
  // note (Khalid, 2026-09-23: «مراجعاتي… تكون موجودة عنده على طول»).
  { href: "/tasks/reviews", label: "Reviews", icon: ClipboardCheck, hint: "Tasks you sent, waiting for your approval" },
  // «Report» said nothing about what is inside it — Khalid (2026-09-04): «الـdaily report
  // إنه بيشوفوا الـtasks اللي موجودة، فخلّي المصطلح يكون واضح». The name now states the
  // content: every person's tasks for a chosen day, next to «Board» which shows only stages.
  // خالد (٢٣ سبتمبر ٢٠٢٦): الصفحةُ كانت تخلط التقريرَ بالإسناد. فانقسمت: الإسنادُ ومتابعتُه في
  // «Assign Task»، والتقريرُ أسبوعيٌّ «بمعنى الكلمة» — مَن أنجز ومَن تأخّر — لا قائمةَ مهامّ اليوم.
  { href: "/tasks/assign", label: "Assign Task", icon: Send, hint: "Hand a task to a colleague and follow it" },
  { href: "/daily-tasks", label: "Team Report", icon: UserCheck, hint: "Weekly: who finished what, who is late" },
  { href: "/tasks/archive", label: "Archive", icon: Archive, hint: "Taken off the board" },
] as const;

/**
 * Task management, in the top bar rather than the sidebar.
 *
 * Khalid moved it here (2026-09-02): it is crossed into from wherever you happen
 * to be, and the sidebar buries it under eleven collapsed groups. It is not a
 * place you navigate to so much as one you check.
 *
 * The trigger lights up whenever any of its pages is open, so the bar still says
 * where you are.
 */
export function TasksMenu({
  canViewReports = false,
  myOpenTasks = 0,
  pendingReviews = 0,
}: {
  canViewReports?: boolean;
  myOpenTasks?: number;
  /** Tasks I sent that a colleague moved to REVIEW — they wait on me, so they count as mine. */
  pendingReviews?: number;
}) {
  const waiting = myOpenTasks + pendingReviews;
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const staffId = (session?.user as { id?: string } | undefined)?.id ?? null;

  /**
   * الرقمُ يُحسب على السيرفر في `app/(dashboard)/layout.tsx`، و`revalidatePath` هناك
   * يصل مَن نفّذ الحركة وحده. فمَن أُسنِدت إليه المهمّةُ يبقى على رقمه القديم حتّى
   * ينتقل — إلّا أن يُخبَره أحد. هذا هو الإخبار: نبضةٌ تُبطِل ما رسمه السيرفر،
   * فيُعاد الحسابُ من مونغو بلا أن يلمس الموظّفُ شيئاً.
   */
  useRealtime(staffId ? staffChannel(staffId) : null, RealtimeEvent.TASKS_CHANGED, () => router.refresh());
  // The Report link used to be filtered on `session.user.role === "ADMIN"`. It is now a
  // permission on the staff row (Khalid, 2026-09-04), and the session token does not carry
  // it — a token minted before the box was ticked would keep the link hidden until the next
  // sign-in. So the layout reads it on the server and passes it down.
  const items = ITEMS
    // الإسنادُ والتقريرُ لمن يرى التقارير — نفسُ حارس `createTask` وحارس الصفحتين.
    .filter((item) => (item.href !== "/daily-tasks" && item.href !== "/tasks/assign") || canViewReports)
    .map((item) => item.href === "/tasks/archive" && canViewReports
      ? { ...item, label: "Team Archive", hint: "Archived tasks from everyone" }
      : item);
  const active = items.some(
    (i) => pathname === i.href || (i.href !== "/tasks" && pathname.startsWith(i.href)),
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          aria-label={waiting > 0 ? `Tasks — ${myOpenTasks} مفتوحة · ${pendingReviews} بانتظار مراجعتك` : "Tasks"}
          className={cn(
            "h-8 gap-1.5 text-xs font-medium",
            active && "bg-accent text-accent-foreground",
          )}
        >
          <KanbanSquare className="size-4" aria-hidden />
          <span className="hidden sm:inline">Tasks</span>
          {/**
            * **العدد على الزرّ لا داخل القائمة** (خالد ٢٠ سبتمبر ٢٠٢٦: «أعرف كم تاسك
            * عندي»). ورقمٌ يحتاج فتحَ قائمةٍ ليُقرأ لا يُقرأ.
            *
            * ويختفي عند الصفر: شارةٌ تقول «٠» تشغل العينَ بلا خبر، والفراغُ نفسُه خبر.
            */}
          {waiting > 0 ? (
            <span
              className="ms-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold tabular-nums leading-none text-primary-foreground"
              title={`${myOpenTasks} مهمّة مفتوحة مُسنَدة إليك · ${pendingReviews} بانتظار مراجعتك`}
            >
              {waiting > 99 ? "99+" : waiting}
            </span>
          ) : null}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel>Tasks</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {items.map(({ href, label, icon: Icon, hint }) => {
          const current = pathname === href;
          return (
            <DropdownMenuItem key={href} asChild>
              <Link
                href={href}
                aria-current={current ? "page" : undefined}
                className={cn("flex items-start gap-2", current && "bg-accent")}
              >
                <Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="text-[13px] font-medium">{label}</span>
                  <span className="text-[11px] text-muted-foreground">{hint}</span>
                </span>
                {href === "/tasks/reviews" && pendingReviews > 0 ? (
                  <span className="ms-auto grid h-5 min-w-5 place-items-center rounded-full bg-sky-600 px-1 text-[11px] font-bold tabular-nums text-white">
                    {pendingReviews > 99 ? "99+" : pendingReviews}
                  </span>
                ) : null}
              </Link>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
