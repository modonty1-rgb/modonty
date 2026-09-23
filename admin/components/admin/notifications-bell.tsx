"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Bell, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  listMyNotificationsAction,
  markNotificationReadAction,
  markAllNotificationsReadAction,
} from "@/lib/notifications/actions";
import { getNotificationMeta, type NotificationLike } from "@/lib/notifications/registry";
import { playChime, primeChime } from "@/lib/notifications/chime";
import { RealtimeEvent, staffChannel } from "@/lib/realtime/channels";
import { useRealtime } from "@/lib/realtime/use-realtime";

/**
 * **شبكةُ أمانٍ لا وسيلةَ تحديث.**
 *
 * كان ٣٠ ثانية — أي ١٢٬٤٨٠ نداءً يوميّاً من ١٣ موظّفاً، ٢٥ ألف استعلامٍ على مونغو،
 * تسعةٌ وتسعون بالمئة منها ترجع «ما في جديد». (خالد ٢٠ سبتمبر ٢٠٢٦: «هذي كلها
 * overload على Database و API Request».)
 *
 * صار البثُّ اللحظيُّ هو الطريق، وهذا يبقى لحالةٍ واحدة: أن يسقط Pusher أو تنفد
 * حصّتُه. خمسُ دقائقَ تعني ١٦ نداءً في يوم الموظّف بدل ٩٦٠ — وتضمن أنّ أسوأَ ما
 * يحدث تأخيرٌ، لا إشعارٌ يضيع.
 */
const FALLBACK_POLL_MS = 300_000;

function timeAgo(date: Date): string {
  const diff = Date.now() - new Date(date).getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return "just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d ago`;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
  }).format(new Date(date));
}

export function NotificationsBell() {
  const router = useRouter();
  const { data: session } = useSession();
  const staffId = (session?.user as { id?: string } | undefined)?.id ?? null;
  const [items, setItems] = useState<NotificationLike[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  /**
   * آخرُ عددٍ غير مقروء رأيناه. النغمةُ لزيادته فقط — لا لأوّل تحميل (`null`)، ولا حين
   * ينقص بعد «Mark all read»، فلا يرنّ الجرسُ على إشعاراتٍ قديمة في كلّ صفحة.
   */
  const lastUnread = useRef<number | null>(null);

  async function refresh() {
    const res = await listMyNotificationsAction(20);
    setItems(res.items);
    setUnreadCount(res.unreadCount);
    if (lastUnread.current !== null && res.unreadCount > lastUnread.current) playChime();
    lastUnread.current = res.unreadCount;
  }

  // المتصفّحُ لا يسمح بالصوت قبل أوّل تفاعل — نفتحه عند أوّل ضغطةٍ أو زرّ (انظر chime.ts).
  useEffect(() => {
    const unlock = () => primeChime();
    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, FALLBACK_POLL_MS);
    return () => clearInterval(id);
  }, []);

  // البثُّ اللحظيّ: يصل الإشعارُ لفاتن في مصر وخالد في السعوديّة في نفس اللحظة.
  // الحمولةُ إشارةٌ فقيرة — نعيد الجلبَ من مونغو، مصدرِ الحقيقة.
  useRealtime(staffId ? staffChannel(staffId) : null, RealtimeEvent.NOTIFICATION_NEW, refresh);

  function handleRowClick(n: NotificationLike) {
    const meta = getNotificationMeta(n.type);
    setOpen(false);

    if (!n.readAt) {
      // optimistic update
      setItems((prev) =>
        prev.map((it) => (it.id === n.id ? { ...it, readAt: new Date() } : it))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
      startTransition(async () => {
        await markNotificationReadAction(n.id);
      });
    }

    router.push(meta.href(n));
  }

  function handleMarkAllRead() {
    if (unreadCount === 0) return;
    setItems((prev) =>
      prev.map((it) => (it.readAt ? it : { ...it, readAt: new Date() }))
    );
    setUnreadCount(0);
    startTransition(async () => {
      await markAllNotificationsReadAction();
      await refresh();
    });
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9" aria-label="Notifications">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -end-0.5 flex items-center justify-center h-4 min-w-4 px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold leading-none">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-[380px] p-0 max-w-[calc(100vw-2rem)]"
      >
        <header className="flex items-center justify-between border-b px-4 py-3">
          <div>
            <h3 className="text-sm font-semibold">Notifications</h3>
            <p className="text-xs text-muted-foreground">
              {unreadCount > 0
                ? `${unreadCount} unread`
                : "You're all caught up"}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0 || isPending}
            className="h-7 gap-1 text-xs"
          >
            <Check className="h-3 w-3" />
            Mark all read
          </Button>
        </header>

        <div className="max-h-[420px] overflow-y-auto">
          {items.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-2 text-sm font-medium">No notifications yet</p>
              <p className="mt-1 text-xs text-muted-foreground">
                We&apos;ll notify you when something needs attention.
              </p>
            </div>
          ) : (
            <ul className="divide-y">
              {items.map((n) => (
                <NotificationRow
                  key={n.id}
                  notification={n}
                  onClick={() => handleRowClick(n)}
                />
              ))}
            </ul>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function NotificationRow({
  notification,
  onClick,
}: {
  notification: NotificationLike;
  onClick: () => void;
}) {
  const meta = getNotificationMeta(notification.type);
  const Icon = meta.icon;
  const isUnread = !notification.readAt;

  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "w-full flex gap-3 px-4 py-3 text-start transition-colors hover:bg-muted/60",
          isUnread && "bg-primary/5"
        )}
      >
        <div
          className={cn(
            "grid h-9 w-9 shrink-0 place-items-center rounded-lg ring-1",
            meta.toneClasses
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1 space-y-0.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {meta.label}
            </span>
            <span className="text-[10px] text-muted-foreground tabular-nums shrink-0">
              {timeAgo(notification.createdAt)}
            </span>
          </div>
          <p className="text-sm font-medium leading-tight line-clamp-1">
            {notification.title}
          </p>
          <p className="text-xs text-muted-foreground line-clamp-2 leading-snug">
            {notification.body}
          </p>
        </div>
        {isUnread && (
          <span
            className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary"
            aria-label="Unread"
          />
        )}
      </button>
    </li>
  );
}
