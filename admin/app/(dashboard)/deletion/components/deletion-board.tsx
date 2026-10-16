"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Archive, ExternalLink, EyeOff, Globe, Loader2, Trash2 } from "lucide-react";

import { CountTab } from "@/components/admin/count-tab";
import { DataTable, type Column } from "@/components/admin/data-table";
import { DetailCard, Fact, FactGroup, FilterRow } from "@/components/shared/advanced-table";
import { KpiToggle, type KpiMeta } from "@/components/admin/kpi-toggle";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import {
  deleteReel,
  deleteArticle,
  deleteCategory,
  deleteClient,
  deleteIndustry,
  deleteTag,
  getInboundLinks,
  type DeleteResult,
  type InboundLinks,
} from "@/lib/deletion";
import { Input } from "@/components/ui/input";

import type { DeletionAction, DeletionKind, DeletionRow } from "../helpers/get-deletion-rows";
import type { RedirectTarget, RedirectTargets } from "../helpers/get-redirect-targets";

const N = new Intl.NumberFormat("ar-EG");

type StatusKey = "live" | "closed";

/**
 * لونٌ واحد لكل معنى (وصفة Advanced Table): أزرق شغّال عند جوجل · رمادي مقفل. ولا «محجوب» هنا:
 * الصفحة تعرض ما ينقدر يُحذف فقط (خالد ١٦ أكتوبر ٢٠٢٦)، والموانع تُعاد على الخادم عند الحذف.
 */
const STATUS: Record<StatusKey, KpiMeta & { icon: React.ComponentType<{ className?: string }>; test: (r: DeletionRow) => boolean }> = {
  live: { label: "صفحته شغّالة", tone: "bg-sky-500/15 text-sky-600 dark:text-sky-400", ring: "ring-sky-500", icon: Globe, test: (r) => r.live },
  closed: { label: "صفحته مقفلة", tone: "bg-slate-500/15 text-slate-600 dark:text-slate-300", ring: "ring-slate-500", icon: EyeOff, test: (r) => !r.live },
};
const STATUS_KEYS = Object.keys(STATUS) as StatusKey[];

type Run = (id: string, redirectToId?: string | null) => Promise<DeleteResult>;

/** الأنواع التي يُعرض لها «حوّل رابطه لصفحة بديلة» عند الحذف — التصنيف والوسم والصناعة لها «الدمج» في صفحاتها. */
const REDIRECTABLE: DeletionKind[] = ["client", "article"];

/** «archive» يسحب من جوجل ويبقي الصفّ (يرجع من صفحته) · «delete» يمسحه نهائياً. */
const KINDS: { kind: DeletionKind; label: string; one: string; run: Partial<Record<DeletionAction, Run>> }[] = [
  { kind: "client", label: "العملاء", one: "العميل", run: { delete: deleteClient } },
  { kind: "article", label: "المقالات المؤرشفة", one: "المقال", run: { delete: deleteArticle } },
  { kind: "reel", label: "الريلز المؤرشفة", one: "الريل", run: { delete: deleteReel } },
  { kind: "category", label: "التصنيفات", one: "التصنيف", run: { delete: deleteCategory } },
  { kind: "tag", label: "الوسوم", one: "الوسم", run: { delete: deleteTag } },
  { kind: "industry", label: "الصناعات", one: "الصناعة", run: { delete: deleteIndustry } },
];

export function DeletionBoard({ rows, redirectTargets }: { rows: DeletionRow[]; redirectTargets: RedirectTargets }) {
  const router = useRouter();
  const { toast } = useToast();
  const [kind, setKind] = useState<DeletionKind>("client");
  const [status, setStatus] = useState<StatusKey | null>(null);
  /** للتصنيفات فقط: رئيسي · فرعي (خالد ١٦ أكتوبر ٢٠٢٦). */
  const [level, setLevel] = useState<0 | 1 | null>(null);
  const [target, setTarget] = useState<{ row: DeletionRow; action: DeletionAction } | null>(null);
  const [pending, startTransition] = useTransition();

  const meta = KINDS.find((k) => k.kind === kind)!;
  const ofKind = rows.filter((r) => r.kind === kind);
  const byLevel = kind === "category" && level !== null ? ofKind.filter((r) => (r.level ?? 0) === level) : ofKind;
  const shown = status ? byLevel.filter(STATUS[status].test) : byLevel;
  const isArchive = target?.action === "archive";
  const [redirectTo, setRedirectTo] = useState<RedirectTarget | null>(null);
  const [pickQuery, setPickQuery] = useState("");
  /** بعد الاختيار تختفي القائمة؛ «غيّر البديل» يرجّعها والمختار باقٍ ظاهراً فوقها. */
  const [changing, setChanging] = useState(false);
  const [inbound, setInbound] = useState<InboundLinks | null>(null);

  // كل نافذة تبدأ نظيفة، وتجيب المقالات التي تربط للصفحة (جوجل: عدّل الروابط الداخلية قبل الإزالة).
  useEffect(() => {
    setRedirectTo(null);
    setPickQuery("");
    setChanging(false);
    setInbound(null);
    if (!target) return;
    let alive = true;
    getInboundLinks(target.row.kind, target.row.id).then((r) => alive && setInbound(r)).catch(() => {});
    return () => {
      alive = false;
    };
  }, [target]);

  // البديل عند الحذف النهائي فقط — جوجل: «Use permanent redirects when you're sure that the redirect
  // won't be reverted». فالمقال المؤرشف يُعرض له البديل هنا (الأرشفة 410 قابلة للرجوع، الحذف لا).
  const canRedirect =
    !!target && target.action === "delete" && REDIRECTABLE.includes(target.row.kind) && (target.row.live || target.row.kind === "article");
  const candidates = canRedirect
    ? redirectTargets[target!.row.kind as "article" | "client"]
        .filter((r) => r.id !== target!.row.id)
        .filter((r) => !pickQuery.trim() || r.searchText.toLowerCase().includes(pickQuery.trim().toLowerCase()))
        .slice(0, 8)
    : [];

  const confirm = () => {
    if (!target) return;
    const { row, action } = target;
    const run = KINDS.find((k) => k.kind === row.kind)!.run[action]!;
    const done = action === "archive" ? "السحب" : "الحذف";
    startTransition(async () => {
      const res = await run(row.id, redirectTo?.id ?? null);
      setTarget(null);
      if (res.success) {
        toast({ title: `تم ${done}`, description: res.message, variant: "success" });
        router.refresh();
      } else {
        toast({ title: `ما تم ${done}`, description: res.error, variant: "destructive" });
      }
    });
  };

  const columns: Column<DeletionRow>[] = [
    {
      key: "name",
      header: "الاسم",
      sortable: true,
      render: (r) => (
        <div className="space-y-0.5">
          <Link href={r.adminHref} onClick={(e) => e.stopPropagation()} className="font-semibold hover:underline" dir="auto">
            {r.name}
          </Link>
          {r.subtitle ? <p className="text-xs text-muted-foreground" dir="auto">{r.subtitle}</p> : null}
        </div>
      ),
    },
    {
      key: "live",
      header: "عند جوجل",
      render: (r) => {
        const m = STATUS[r.live ? "live" : "closed"];
        return <span className={cn("whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-semibold", m.tone)}>{m.label}</span>;
      },
    },
    {
      key: "action",
      header: "",
      className: "w-[1%]",
      render: (r) => (
        <span className="flex justify-end gap-1.5">
          {r.actions.includes("archive") ? (
            <Button
              variant="outline"
              size="sm"
              disabled={r.blockers.length > 0 || pending}
              title={`اسحب ${meta.one} من جوجل وخلّه محفوظ`}
              onClick={(e) => {
                e.stopPropagation();
                setTarget({ row: r, action: "archive" });
              }}
            >
              <Archive className="size-4" aria-hidden />
              {r.kind === "reel" ? "اسحب" : "أرشف"}
            </Button>
          ) : null}
          {r.actions.includes("delete") ? (
            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:bg-destructive hover:text-destructive-foreground disabled:opacity-40"
              disabled={r.blockers.length > 0 || pending}
              title={r.blockers.length ? "فكّ المربوط به أولاً" : `احذف ${meta.one}`}
              onClick={(e) => {
                e.stopPropagation();
                setTarget({ row: r, action: "delete" });
              }}
            >
              <Trash2 className="size-4" aria-hidden />
              احذف
            </Button>
          ) : null}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-3">
      <div className="space-y-3">
      <section aria-label="الفلاتر" className="flex flex-col justify-center gap-2 rounded-lg border bg-card px-4 py-2.5">
        <FilterRow label="النوع">
          {KINDS.map((k) => (
            <CountTab
              key={k.kind}
              label={k.label}
              count={N.format(rows.filter((r) => r.kind === k.kind).length)}
              active={kind === k.kind}
              onClick={() => {
                setKind(k.kind);
                setStatus(null);
                setLevel(null);
              }}
            />
          ))}
        </FilterRow>
        {kind === "category" ? (
          <FilterRow label="المستوى">
            <CountTab label="الكل" count={N.format(ofKind.length)} active={level === null} onClick={() => setLevel(null)} />
            <CountTab label="رئيسي" count={N.format(ofKind.filter((r) => (r.level ?? 0) === 0).length)} active={level === 0} onClick={() => setLevel(level === 0 ? null : 0)} />
            <CountTab label="فرعي" count={N.format(ofKind.filter((r) => r.level === 1).length)} active={level === 1} onClick={() => setLevel(level === 1 ? null : 1)} />
          </FilterRow>
        ) : null}
      </section>
      <section aria-label="الحالات">
        <div className="grid grid-cols-2 gap-2">
          {STATUS_KEYS.map((key) => {
            const hits = ofKind.filter(STATUS[key].test).length;
            return (
              <KpiToggle
                key={key}
                variant="tile"
                meta={STATUS[key]}
                icon={STATUS[key].icon}
                value={N.format(hits)}
                active={status === key}
                disabled={hits === 0 && status !== key}
                onClick={() => setStatus(status === key ? null : key)}
              />
            );
          })}
        </div>
      </section>
      </div>

      <DataTable
        key={kind}
        data={shown}
        columns={columns}
        searchKey="searchText"
        searchPlaceholder={`ابحث في ${meta.label}…`}
        pageSize={25}
        emptyText="ما فيه شي هنا."
        arabic
        renderExpanded={(r) => <RowDetail r={r} />}
        expandLabel={(r) => `تفاصيل ${r.name}`}
      />

      <AlertDialog open={!!target} onOpenChange={(o) => !o && !pending && setTarget(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-start">
              {isArchive ? "تسحب" : "تحذف"} {meta.one} «{target?.row.name}»؟
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-1 text-start">
              {isArchive ? (
                <span className="block">
                  {target?.row.kind === "reel"
                    ? "ينسحب من الطلّات، وتعليقاته ومشاهداته تبقى — وترجّعه من «مؤرشف» في صفحة الريلز."
                    : "ينأرشف ويبقى محفوظ — وترجّعه بـ«Unarchive» من صفحته."}
                </span>
              ) : (
                <span className="block">ما ينرجع بعد الحذف.</span>
              )}
              {redirectTo ? (
                <span className="block">رابطه بيحوّل تحويلاً دائماً لـ«{redirectTo.name}» خلال ٥ دقايق، وجوجل ينقل قيمته له.</span>
              ) : target?.row.live ? (
                <span className="block">
                  صفحته شغّالة الحين — بعدها ترجع لجوجل «410 محذوف» خلال ٥ دقايق وتنشال من نتائج البحث.
                </span>
              ) : (
                <span className="block">صفحته مقفلة أصلاً، فما له أثر جديد على جوجل.</span>
              )}
              {target?.row.kind === "client" ? <span className="block">صوره وملفّاته على بني تنحذف معه.</span> : null}
              {target?.row.kind === "reel" ? <span className="block">ملفّه على بني وتعليقاته وإعجاباته تنحذف معه.</span> : null}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {/* جوجل: «replace all URLs that pointed to your own pages» — المقالات المنشورة التي تربط لها. */}
          <div className="rounded-md border px-3 py-2 text-xs" aria-live="polite">
            {!inbound ? (
              <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                <Loader2 className="size-3 animate-spin" aria-hidden /> نفحص هل فيه مقالات تربط لصفحته…
              </span>
            ) : inbound.count === 0 ? (
              <span className="text-muted-foreground">ما فيه مقال منشور يربط لصفحته.</span>
            ) : (
              <div className="space-y-1">
                <p className="font-semibold text-amber-700 dark:text-amber-400">
                  {N.format(inbound.count)} مقال منشور يربط لصفحته
                  {redirectTo ? " — روابطهم بتحوّل للبديل." : " — عدّل روابطهم أو اختر صفحة بديلة تحت."}
                </p>
                <ul className="space-y-0.5">
                  {inbound.items.map((a) => (
                    <li key={a.adminHref}>
                      <Link href={a.adminHref} target="_blank" className="hover:underline" dir="auto">
                        {a.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* جوجل: «If your page has… a clear replacement… return a 301». بلا اختيار = 410. */}
          {canRedirect ? (
            <div className="space-y-2 rounded-md border px-3 py-2">
              <p className="text-xs font-semibold">
                له صفحة بديلة؟ <span className="font-normal text-muted-foreground">(اختياري — بدونها يرجع رابطه 410)</span>
              </p>
              {/* المختار يبقى ظاهراً باسمه ورابطه — يفتحه الأدمن ويتأكّد قبل الحذف. */}
              {redirectTo ? (
                <div className="rounded-md border border-emerald-500/40 bg-emerald-500/5 px-3 py-2">
                  <p className="text-xs text-muted-foreground">البديل المختار — رابط المحذوف بيحوّل له:</p>
                  <p className="text-sm font-semibold" dir="auto">
                    {redirectTo.name}
                  </p>
                  {redirectTo.subtitle ? (
                    <p className="text-xs text-muted-foreground" dir="auto">
                      {redirectTo.subtitle}
                    </p>
                  ) : null}
                  <a
                    href={redirectTo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-flex items-center gap-1 break-all text-xs text-sky-700 hover:underline dark:text-sky-400"
                    dir="ltr"
                  >
                    {decodeURIComponent(redirectTo.url)} <ExternalLink className="size-3 shrink-0" aria-hidden />
                  </a>
                  <div className="mt-2 flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setChanging(true)} disabled={pending || changing}>
                      غيّر البديل
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setRedirectTo(null);
                        setChanging(false);
                      }}
                      disabled={pending}
                    >
                      بدون بديل (410)
                    </Button>
                  </div>
                </div>
              ) : null}
              {!redirectTo || changing ? (
                <>
                  <Input
                    value={pickQuery}
                    onChange={(e) => setPickQuery(e.target.value)}
                    placeholder={`ابحث عن ${meta.one} البديل بالعنوان أو اسم العميل…`}
                    className="h-8 text-sm"
                    autoFocus={changing}
                  />
                  <ul className="max-h-48 space-y-0.5 overflow-y-auto">
                    {candidates.map((c) => (
                      <li key={c.id}>
                        <button
                          type="button"
                          className={cn(
                            "w-full rounded px-2 py-1 text-start hover:bg-muted",
                            redirectTo?.id === c.id && "bg-emerald-500/10",
                          )}
                          onClick={() => {
                            setRedirectTo(c);
                            setChanging(false);
                          }}
                        >
                          <span className="block text-sm" dir="auto">
                            {c.name}
                          </span>
                          {c.subtitle ? (
                            <span className="block text-xs text-muted-foreground" dir="auto">
                              {c.subtitle}
                            </span>
                          ) : null}
                        </button>
                      </li>
                    ))}
                    {candidates.length === 0 ? <li className="px-2 py-1 text-xs text-muted-foreground">ما فيه نتيجة.</li> : null}
                  </ul>
                </>
              ) : null}
            </div>
          ) : null}
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel disabled={pending}>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                confirm();
              }}
              disabled={pending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
              {pending ? (isArchive ? "يسحب…" : "يحذف…") : isArchive ? "اسحبه من جوجل" : "احذف نهائياً"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/** «+» — بطاقة التفاصيل: ما يحتاجه الأدمن قبل الحذف (خالد ١٦ أكتوبر ٢٠٢٦). */
function RowDetail({ r }: { r: DeletionRow }) {
  const groups: React.ReactNode[] = [];
  if (r.facts.length) {
    groups.push(
      <FactGroup key="facts" title="المعلومات" spread>
        {r.facts.map((f) => (
          <Fact key={f.label} label={f.label} value={<span dir="auto">{f.value}</span>} />
        ))}
      </FactGroup>,
    );
  }
  groups.push(
    <FactGroup key="google" title="عند جوجل">
      <a
        href={r.publicUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="inline-flex items-center gap-1 break-all text-sm hover:underline"
        dir="ltr"
      >
        {decodeURIComponent(r.publicUrl)} <ExternalLink className="size-3 shrink-0" aria-hidden />
      </a>
      <p className="mt-1 text-xs text-muted-foreground">
        {r.live ? "صفحته شغّالة الحين — بعد الحذف ترجع 410." : "صفحته مقفلة — ترجع 410 من الحين."}
      </p>
    </FactGroup>,
  );
  return <DetailCard columns={r.facts.length ? "lg:grid-cols-[minmax(0,2fr)_1px_minmax(0,1fr)]" : "lg:grid-cols-[minmax(0,1fr)]"} groups={groups} />;
}
