"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Bell, Loader2 } from "lucide-react";

import { Popover, PopoverContent, PopoverTrigger } from "@modonty/shared/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { getNotificationInbox, type InboxItem } from "../actions/get-notification-inbox";
import { markAllNotificationsRead } from "../actions/mark-all-notifications-read";
import { markNotificationRead } from "../actions/mark-notification-read";

const N = new Intl.NumberFormat("ar-EG");

/**
 * جرس التنبيهات في رأس الكونسول (خالد ١٦ أكتوبر ٢٠٢٦) — نفس صندوق تطبيق الجوّال: اعتماد مقال،
 * نشر ريل أو رفضه بسببه، سؤال قارئ، طلب تواصل… العدّاد من الخادم مع الصفحة، والقائمة تُجلب عند الفتح.
 */
export function NotificationBell({ initialUnread }: { initialUnread: number }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(initialUnread);
  const [items, setItems] = useState<InboxItem[] | null>(null);
  const [loading, startLoading] = useTransition();

  const load = () =>
    startLoading(async () => {
      const r = await getNotificationInbox();
      setItems(r.items);
      setUnread(r.unreadCount);
    });

  const openItem = (item: InboxItem) => {
    setOpen(false);
    if (item.unread) {
      setItems((prev) => prev?.map((x) => (x.id === item.id ? { ...x, unread: false } : x)) ?? prev);
      void markNotificationRead(item.id).then((r) => setUnread(r.unreadCount));
    }
    if (item.href) router.push(item.href);
  };

  const readAll = () =>
    startLoading(async () => {
      const r = await markAllNotificationsRead();
      setUnread(r.unreadCount);
      setItems((prev) => prev?.map((x) => ({ ...x, unread: false })) ?? prev);
    });

  return (
    <Popover
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (o) load();
      }}
    >
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          title="التنبيهات"
          aria-label={unread ? `التنبيهات — ${N.format(unread)} جديد` : "التنبيهات"}
          className={cn("relative h-10 w-10 max-md:size-10 after:absolute after:-inset-0.5 after:content-['']", open && "bg-primary/10 text-primary")}
        >
          <Bell className="h-4 w-4" />
          {unread > 0 && (
            <span className="absolute -top-0.5 -end-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-xs font-semibold leading-none text-destructive-foreground tabular-nums">
              {unread > 9 ? "9+" : N.format(unread)}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[min(22rem,calc(100vw-2rem))] p-0" dir="rtl">
        <div className="flex items-center justify-between border-b px-3 py-2">
          <p className="text-sm font-semibold">
            التنبيهات{unread > 0 ? <span className="ms-1 text-xs font-normal text-muted-foreground">({N.format(unread)} جديد)</span> : null}
          </p>
          {unread > 0 ? (
            <Button type="button" variant="ghost" size="sm" className="h-7 text-xs" onClick={readAll} disabled={loading}>
              تعليم الكل كمقروء
            </Button>
          ) : null}
        </div>
        <div className="max-h-[60vh] overflow-y-auto">
          {items === null ? (
            <p className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> نجيب التنبيهات…
            </p>
          ) : items.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-sm font-medium">ما في تنبيهات جديدة</p>
              <p className="mt-1 text-xs text-muted-foreground">نعلمك هنا بأي شيء يحتاج قرارك أو متابعتك.</p>
            </div>
          ) : (
            <ul className="divide-y">
              {items.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => openItem(item)}
                    className={cn("flex w-full gap-2 px-3 py-2.5 text-start hover:bg-muted/60", item.unread && "bg-primary/5")}
                  >
                    <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", item.unread ? "bg-primary" : "bg-transparent")} aria-hidden />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold">{item.title}</span>
                      <span className="block text-xs leading-relaxed text-muted-foreground">{item.body}</span>
                      <span className="mt-0.5 block text-[11px] text-muted-foreground">{item.timeLabel}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
