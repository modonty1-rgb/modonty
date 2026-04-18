import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IconEmail } from "@/lib/icons";
import Link from "@/components/link";
import { CtaTrackedLink } from "@/components/cta-tracked-link";
import { MarkAsReadOnOpen } from "./components/mark-as-read-on-open";
import { BellRevalidateTrigger } from "./components/bell-revalidate-trigger";

export const metadata: Metadata = {
  title: "الإشعارات",
  robots: { index: false, follow: false },
};

interface NotificationsPageProps {
  searchParams: Promise<{ id?: string; tab?: string }>;
}

const TAB_ALL = "all";
const TAB_NEW = "new";
const TAB_READ = "read";
const TABS = [
  { value: TAB_ALL, label: "الكل" },
  { value: TAB_NEW, label: "جديد" },
  { value: TAB_READ, label: "مقروء" },
] as const;

export default async function NotificationsPage({ searchParams }: NotificationsPageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/users/login");
  }

  const userId = session.user.id;
  const resolved = await searchParams;
  const { id: selectedId, tab: tabParam } = resolved;
  const tab = tabParam === TAB_NEW || tabParam === TAB_READ ? tabParam : TAB_ALL;

  const notifications = await db.notification.findMany({
    where: { userId },
    orderBy: [{ readAt: "asc" }, { createdAt: "desc" }],
    take: 50,
  });

  let selectedNotification = null;
  let contactMessage = null;
  let faqReply: { question: string; answer: string | null; article: { title: string; slug: string } } | null = null;
  let notificationsList = notifications;

  if (selectedId) {
    selectedNotification = await db.notification.findFirst({
      where: { id: selectedId, userId },
    });
    if (selectedNotification?.relatedId) {
      if (selectedNotification.type === "faq_reply") {
        faqReply = await db.articleFAQ.findFirst({
          where: { id: selectedNotification.relatedId },
          select: {
            question: true,
            answer: true,
            article: { select: { title: true, slug: true } },
          },
        });
      } else {
        contactMessage = await db.contactMessage.findFirst({
          where: { id: selectedNotification.relatedId, userId },
        });
      }
    }
  }

  let client = null;
  if (selectedNotification) {
    const clientId = selectedNotification.clientId ?? contactMessage?.clientId ?? null;
    if (clientId) {
      client = await db.client.findUnique({
        where: { id: clientId },
        select: { id: true, name: true, email: true, slug: true },
      });
    }
  }

  const showDetail = selectedNotification && (contactMessage || faqReply);

  const filteredList =
    tab === TAB_NEW
      ? notificationsList.filter((n) => n.readAt == null)
      : tab === TAB_READ
        ? notificationsList.filter((n) => n.readAt != null)
        : notificationsList;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-[1128px] px-4 py-8">
        <h1 className="text-2xl font-semibold leading-tight text-foreground mb-6">
          صندوق البريد
        </h1>
        {/* Refresh layout so bell count syncs on every visit */}
        <BellRevalidateTrigger justMarkedAsRead={true} />
        <MarkAsReadOnOpen
          notificationId={
            selectedNotification?.readAt == null ? selectedId ?? null : null
          }
        />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1 border-border hover:shadow-md transition-shadow flex flex-col max-h-[min(70vh,32rem)] lg:max-h-[70vh]">
            <CardHeader className="p-4 shrink-0">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <IconEmail className="h-5 w-5" />
                القائمة
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 flex flex-col flex-1 min-h-0">
            <div className="flex gap-1 border-b border-border mb-4 shrink-0">
              {TABS.map((t) => (
                <Link
                  key={t.value}
                  href={`/users/notifications?tab=${t.value}`}
                  className={`px-3 py-2 text-sm font-medium transition-colors rounded-t-md ${
                    tab === t.value
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  {t.label}
                </Link>
              ))}
            </div>
            {filteredList.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">لا توجد إشعارات</p>
            ) : (
              <div className="overflow-y-auto flex-1 min-h-0 -mx-1 px-1" aria-label="قائمة صندوق البريد">
                <div className="space-y-2">
                {filteredList.map((n) => {
                  const isSelected = selectedId === n.id;
                  const isUnread = !n.readAt;
                  return (
                    <Link
                      key={n.id}
                      href={`/users/notifications?id=${n.id}&tab=${tab}`}
                      className={`block p-3 rounded-lg border transition-colors ${
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "border-border hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2 flex-1 min-w-0">
                          {isUnread ? (
                            <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5" />
                          ) : (
                            <IconEmail className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-foreground truncate">
                              {n.title}
                            </p>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {n.body}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {n.createdAt.toLocaleString("ar-SA")}
                            </p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 border-border hover:shadow-md transition-shadow">
          <CardHeader className="p-4">
            <CardTitle className="text-lg font-semibold">تفاصيل الرسالة</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            {!showDetail ? (
              <p className="text-center text-sm text-muted-foreground py-12">
                اختر رسالة لعرض التفاصيل
              </p>
            ) : faqReply ? (
              <div className="space-y-4">
                {client && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">من</p>
                    {client.slug ? (
                      <CtaTrackedLink
                        href={`/clients/${encodeURIComponent(client.slug)}`}
                        label="Visit client from notification"
                        type="LINK"
                        clientId={client.id}
                        className="font-medium text-primary underline hover:opacity-80 transition-opacity"
                      >
                        {client.name}
                      </CtaTrackedLink>
                    ) : (
                      <p className="font-medium text-foreground">{client.name}</p>
                    )}
                  </div>
                )}
                {faqReply.article && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">المقال</p>
                    <Link
                      href={`/articles/${faqReply.article.slug}`}
                      className="text-sm text-primary underline hover:opacity-80 transition-opacity"
                    >
                      {faqReply.article.title}
                    </Link>
                  </div>
                )}
                <div className="border-t border-border pt-4">
                  <p className="text-sm text-muted-foreground mb-2">سؤالك</p>
                  <div className="p-4 rounded-lg bg-muted">
                    <p className="text-sm text-foreground leading-relaxed">{faqReply.question}</p>
                  </div>
                </div>
                {faqReply.answer && (
                  <div className="border-t border-border pt-4">
                    <p className="text-sm text-muted-foreground mb-2">
                      الرد{client ? ` من ${client.name}` : ""}
                    </p>
                    <div className="p-4 rounded-lg bg-muted">
                      <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                        {faqReply.answer}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : contactMessage ? (
              <div className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">من</p>
                    {client?.slug ? (
                      <CtaTrackedLink
                        href={`/clients/${encodeURIComponent(client.slug)}`}
                        label="Visit client from notification"
                        type="LINK"
                        clientId={client.id}
                        className="font-medium text-primary underline hover:opacity-80 transition-opacity"
                      >
                        {client.name}
                      </CtaTrackedLink>
                    ) : (
                      <p className="font-medium text-foreground">
                        {client?.name ?? "—"}
                      </p>
                    )}
                    {client?.email && (
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {client.email}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      مرسل الاستفسار: {contactMessage.name} ({contactMessage.email})
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">الموضوع</p>
                    <p className="font-medium text-foreground">{contactMessage.subject}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">تاريخ الاستلام</p>
                    <p className="text-sm text-foreground">
                      {contactMessage.createdAt.toLocaleString("ar-SA")}
                    </p>
                  </div>
                </div>

                <div className="border-t border-border pt-4">
                  <p className="text-sm text-muted-foreground mb-2">الرسالة</p>
                  <div className="p-4 rounded-lg bg-muted">
                    <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                      {contactMessage.message}
                    </p>
                  </div>
                </div>

                {contactMessage.replyBody && (
                  <div className="border-t border-border pt-4">
                    <p className="text-sm text-muted-foreground mb-2">
                      الرد من{" "}
                      {client?.slug ? (
                        <CtaTrackedLink
                          href={`/clients/${encodeURIComponent(client.slug)}`}
                          label="Visit client from notification"
                          type="LINK"
                          clientId={client.id}
                          className="text-primary underline hover:opacity-80 transition-opacity"
                        >
                          {client.name}
                        </CtaTrackedLink>
                      ) : (
                        (client?.name ?? "—")
                      )}
                    </p>
                    <div className="p-4 rounded-lg bg-muted">
                      <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                        {contactMessage.replyBody}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
  );
}
