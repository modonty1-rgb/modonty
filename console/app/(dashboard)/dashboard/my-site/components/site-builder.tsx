"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { AlertTriangle, Check, ChevronLeft, Palette, X } from "lucide-react";
import { PARTNER_SITE_PALETTE } from "@modonty/shared/lib/partner-site";
import { HEADER_TEMPLATES, type HeaderTemplateKey } from "@modonty/shared/components/partner-site/free/header";
import { FOOTER_TEMPLATES, type FooterTemplateKey } from "@modonty/shared/components/partner-site/free/footer";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@modonty/shared/components/ui/sheet";

import { cn } from "@/lib/utils";
import { PAGE_LABELS, type BlocksPage } from "@/lib/my-site/page-keys";
import type { MissingBlock } from "@/lib/my-site/build-missing-data";
import type { MySiteData } from "@/lib/my-site/get-my-site-data";
import { SITE_PAGE_TOOLS } from "@/app/(dashboard)/components/site-page-tools";
import { SiteToolButton } from "@/app/(dashboard)/components/site-tool-button";

import { saveMySite } from "../actions/save-my-site";

type ToolKey = "look" | BlocksPage;

/**
 * ONE tool for the whole look — colour, top bar and footer together (Khalid 2026-08-30:
 * «تاب كامل عشان ثلاثة اختيارات؟»). Three tabs each holding a handful of choices spent a
 * click and a context switch per decision, in a panel with room for all three at once.
 * «العنوان» is not here at all: the subdomain is parked.
 */
const LOOK_TOOL = {
  key: "look" as const,
  label: "شكل الموقع",
  Icon: Palette,
  hint: "اللون والشريط العلوي والذيل — يظهرون في كل صفحات موقعك.",
};

function toolTitle(key: ToolKey): string {
  return key === "look" ? LOOK_TOOL.label : `صفحة ${PAGE_LABELS[key]}`;
}
function toolHint(key: ToolKey): string {
  return key === "look" ? LOOK_TOOL.hint : "أقسام الصفحة بالترتيب الذي يراه الزائر. أطفئ اللي ما تبغاه.";
}

/**
 * The two frames the partner decides on. 390×844 is the phone design size (iPhone 12/13/14).
 * The desktop is 1280×900, not the project's 1280×800 measuring reference: at 800 the phone
 * frame is genuinely TALLER than the desktop one (844 > 800 CSS px) — arithmetically correct
 * and visually absurd. 900 is a real laptop viewport and restores the picture the partner
 * expects, with the width — the number the breakpoints care about — untouched.
 */
const DESKTOP = { w: 1280, h: 900 };
const PHONE = { w: 390, h: 844 };

interface SiteBuilderProps {
  initial: MySiteData;
  /** لكل صفحة: أقسامها التي لن تظهر لأن بياناتها ناقصة — محسوبة على الخادم. */
  missing: Record<BlocksPage, MissingBlock[]>;
}

/**
 * «موقعي» — one screen: the choices sit in the top bar as icons, the site itself fills the
 * rest on both devices at once (Khalid 2026-08-30). Picking anything repaints both frames.
 *
 * The panel FLOATS over the stage instead of pushing it: pushing shrank the 1280 frame to
 * ≈26% of its width exactly while a choice was being made — measured on a 1440 window.
 */
export function SiteBuilder({ initial, missing }: SiteBuilderProps) {
  const [open, setOpen] = useState<ToolKey | null>(null);
  const [headerTemplate, setHeaderTemplate] = useState<HeaderTemplateKey>(initial.headerTemplate);
  const [footerTemplate, setFooterTemplate] = useState<FooterTemplateKey>(initial.footerTemplate);
  const [primaryColor, setPrimaryColor] = useState<string | null>(initial.primaryColor);
  const [page, setPage] = useState<BlocksPage>("home");
  const [pending, startTransition] = useTransition();


  /**
   * WIDTH decides the scale — height never does.
   *
   * An earlier version shrank both devices until the whole stage fitted `window.innerHeight`,
   * so the page itself had zero overflow and therefore no scrollbar. On a window that is
   * taller than the visible screen (a maximised window whose bottom sits under the Windows
   * task bar) `innerHeight` is honest and the arithmetic is right, yet the phone's lower half
   * is off-screen with no way to scroll to it: the fit removed the very scrollbar that would
   * have reached it. So the stage keeps its natural height and the page scrolls like a page.
   *
   * ResizeObserver, not a resize listener — the row also changes width when the sidebar
   * collapses, and that fires no window resize.
   */
  const stage = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.7);

  // The sheet must start where the bar ends. A fixed 96px guessed it wrong (measured: the
  // bar's bottom is 167 when the page is at the top, and it moves as the page scrolls),
  // so the offset is measured, not assumed.
  const [barBottom, setBarBottom] = useState(0);
  useEffect(() => {
    const read = () => setBarBottom(Math.round(bar.current?.getBoundingClientRect().bottom ?? 0));
    read();
    window.addEventListener("scroll", read, { passive: true });
    window.addEventListener("resize", read);
    return () => { window.removeEventListener("scroll", read); window.removeEventListener("resize", read); };
  }, []);
  useEffect(() => {
    const node = stage.current;
    if (!node) return;
    const fit = () => {
      // ONE scale for both frames. Two scales made the phone taller on screen than the
      // desktop (measured: 844 vs 603) — a picture that contradicts what the partner knows
      // about his own devices, and a preview that argues with reality is not a preview.
      const chrome = 24 + 24; // الفجوة بين الإطارين + حدّ الجهاز
      setScale(Math.min(1, Math.max(0.3, (node.clientWidth - chrome) / (DESKTOP.w + PHONE.w))));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(node);
    return () => ro.disconnect();
  }, []);

  // Escape closes the panel — a docked panel still owes the keyboard a way out (WCAG 2.1.2).
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  /**
   * Choosing is not saving (Khalid 2026-08-30: «أحدد الشكل اللي أبغاه، بعدين أسوي حفظ»).
   * Every pick moves local state only, the previews repaint from it, and nothing reaches the
   * database until «حفظ». So a partner can try five headers without publishing four of them.
   */
  /**
   * The baseline is what was last SAVED, not the props this screen mounted with.
   * Comparing against `initial` left the bar saying «فيه تغييرات ما انحفظت» forever after a
   * successful save — the row was written (verified in the database) while the screen kept
   * claiming it was not. A save that looks like a failure is a failure.
   */
  const [saved, setSaved] = useState(() => ({
    headerTemplate: initial.headerTemplate,
    footerTemplate: initial.footerTemplate,
    primaryColor: initial.primaryColor,
  }));

  const dirty =
    headerTemplate !== saved.headerTemplate ||
    footerTemplate !== saved.footerTemplate ||
    primaryColor !== saved.primaryColor;

  function save() {
    startTransition(async () => {
      // بلا `subdomain`: هذه الشاشة لا تملكه، فلا تكتبه.
      const res = await saveMySite({ headerTemplate, footerTemplate, primaryColor });
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      setSaved({ headerTemplate, footerTemplate, primaryColor });
      toast.success("انحفظ — التغيير ظاهر على موقعك");
    });
  }

  /**
   * `URLSearchParams`, never string concatenation: the colour is a hex, and a raw `#` in a
   * query string starts the FRAGMENT. `?c=#0D9488&p=home` reached the server as `c=""` with
   * everything after it dropped — the pick saved and the preview never changed colour.
   */
  const preview = (over: Partial<{ h: string; f: string; c: string; p: string; bare: boolean; only: "header" | "footer" }> = {}) => {
    const qs = new URLSearchParams({
      h: over.h ?? headerTemplate,
      f: over.f ?? footerTemplate,
      c: over.c ?? primaryColor ?? "default",
      p: over.p ?? page,
    });
    if (over.bare) qs.set("bare", "1");
    if (over.only) qs.set("only", over.only);
    return `/site-preview?${qs.toString()}`;
  };
  const src = preview();

  return (
    <div className="relative">
      {/* ── الشريط العلوي: كل الاختيارات أيقونات ───────────────── */}
      {/* شريط فرعيّ له لونه: لوحة تحكّم الموقع، لا جزء من الصفحة البيضاء تحته
          (خالد ٣٠ أغسطس: «خلي الشريط الفرعي باين، أديه لون مميز»). */}
      {/* z-[60] فوق الشيت (z-50): الشريط يبقى مرئياً وقابلاً للضغط واللوحة مفتوحة،
          فينتقل من أداة لأخرى بضغطة — لا بإغلاق ثم فتح. */}
      <div ref={bar} className="sticky top-0 z-[60] -mx-4 mb-5 border-y border-primary/20 bg-primary/[0.07] px-4 py-2.5 backdrop-blur sm:mx-0 sm:rounded-xl sm:border">
        {/* صفّان لا واحد: الأدوات تلتفّ في عمودها، وزرّ الحفظ عمودٌ ثابت بجانبها.
            حين كان الجميع في `flex-wrap` واحد نزل الزرّ وحده إلى سطر تحت. */}
        <div className="flex items-start gap-3">
          <div className="flex flex-1 flex-wrap items-center gap-1.5">
          {/* `text-primary/70` قِيس ٢٫٨٤:١ على أرضية الشريط — تحت حدّ WCAG 1.4.3 (٤٫٥:١
              لنصّ ١١px). اللون كاملاً بلا شفافية. */}
          <SiteToolButton
            label={LOOK_TOOL.label}
            Icon={LOOK_TOOL.Icon}
            active={open === "look"}
            onClick={() => setOpen(open === "look" ? null : "look")}
          />

          <span className="mx-1.5 h-10 w-px shrink-0 bg-primary/25" aria-hidden />
          <span className="shrink-0 pe-1 text-[11px] font-bold tracking-wide text-primary">الصفحات</span>

          {/* الصفحة تُعرَض لا تُضبَط: القسم يظهر إن كانت بياناته موجودة ويغيب إن غابت.
              وحين يغيب شيء يُرفَع مثلّث تنبيه على الأيقونة — والضغط عليه يشرح ما الناقص
              وأين يُدخَل، لا أن يطلب من الشريك قراراً (خالد ٣٠ أغسطس). */}
          {SITE_PAGE_TOOLS.map(({ key, label, Icon }) => (
            <SiteToolButton
              key={key}
              label={label}
              Icon={Icon}
              active={page === key}
              warn={missing[key]?.length ?? 0}
              onClick={() => { setPage(key); setOpen(missing[key]?.length ? key : null); }}
            />
          ))}

          </div>

          <div className="flex shrink-0 items-center gap-2">
            <span className="whitespace-nowrap text-[11px] text-muted-foreground">
              {dirty ? "فيه تغييرات ما انحفظت" : "كل شيء محفوظ"}
            </span>
            <button
              type="button"
              onClick={save}
              disabled={!dirty || pending}
              className="min-h-11 whitespace-nowrap rounded-lg bg-primary px-5 text-xs font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {pending ? "جارٍ الحفظ…" : "حفظ ونشر"}
            </button>
          </div>
        </div>
      </div>

      {/* ── المسرح: الجهازان جنب بعض، وكلاهما يعرض نفس الصفحة ──── */}
      <div ref={stage} className="flex items-start justify-end gap-6">
        <DeviceFrame title="كمبيوتر" size={DESKTOP} src={src} scale={scale} />
        <DeviceFrame title="جوّال" size={PHONE} src={src} scale={scale} phone />
      </div>

      {/* ── اللوحة: شيت shadcn، ٧٠٪ من الشاشة، بلا تعتيم ────────────
          `modal={false}` + غطاء شفّاف: الشيت يعدّل ما خلفه، وتعتيمُه يلغي فائدته. */}
      <Sheet open={open !== null} onOpenChange={(o) => !o && setOpen(null)} modal={false}>
        {open !== null && (
          <SheetContent
            side="right"
            overlayClassName="bg-transparent"
            showClose={false}
            style={{ top: barBottom }}
            // `bg-muted` لا `bg-card`: في السمة الداكنة قِيس `--card` = `--background`
            // حرفياً (222.2 84% 4.9%)، فاللوحة كانت تذوب في الصفحة. `--muted` عند 17.5%
            // إضاءة — سطح مرتفع يُرى بوضوح في السمتين.
            className="flex h-auto w-[70vw] max-w-none flex-col gap-0 border-s-2 border-s-primary/40 bg-muted p-0 shadow-2xl sm:max-w-none"
          >
            <SheetHeader className="shrink-0 border-b bg-background/40 px-5 py-4 text-start">
              <div className="flex items-start gap-3">
                <div className="min-w-0">
                  <SheetTitle className="text-base">{toolTitle(open)}</SheetTitle>
                  <SheetDescription className="mt-0.5 text-xs">{toolHint(open)}</SheetDescription>
                </div>
                {/* زرّ إغلاق مكتوب لا أيقونة صغيرة في الزاوية: الهدف ٤٤ والتسمية ظاهرة. */}
                <SheetClose className="ms-auto flex min-h-11 shrink-0 items-center gap-1.5 rounded-lg border bg-background px-3 text-xs font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <X className="h-4 w-4" aria-hidden />
                  إغلاق
                </SheetClose>
              </div>

              {/* اللون في رأس الشيت الثابت لا داخل المنطقة التي تُمرَّر: يبقى تحت اليد
                  بينما ينزل الشريك في قوالب الهيدر والذيل (خالد ٣٠ أغسطس). */}
              {open === "look" && (
                <div className="mt-3 flex items-center gap-2 border-t pt-3">
                  <span className="shrink-0 text-xs font-medium text-muted-foreground">لونك</span>
                  <ColorChoices value={primaryColor} onPick={setPrimaryColor} />
                </div>
              )}
            </SheetHeader>
            <div className="min-h-0 flex-1 overflow-y-auto p-5">
              {open === "look" && (
                <div className="flex flex-col gap-8">
                  <Group title="الشريط العلوي" hint="خمسة أشكال — كلها بشعارك وصفحاتك ولونك.">
                    <ShapeChoices
                      options={HEADER_TEMPLATES.map((t) => ({ key: t.key, name: t.name }))}
                      value={headerTemplate}
                      onPick={(k) => setHeaderTemplate(k as HeaderTemplateKey)}
                      previewSrc={(k) => preview({ h: k, bare: true, only: "header" })}
                      cropSource={300}
                    />
                  </Group>

                  <Group title="ذيل الموقع" hint="أربعة أشكال — كلها بخدماتك وصفحاتك وتواصلك.">
                    <ShapeChoices
                      options={FOOTER_TEMPLATES.map((t) => ({ key: t.key, name: t.name }))}
                      value={footerTemplate}
                      onPick={(k) => setFooterTemplate(k as FooterTemplateKey)}
                      previewSrc={(k) => preview({ f: k, bare: true, only: "footer" })}
                      cropSource={420}
                    />
                  </Group>
                </div>
              )}

              {open !== "look" && <MissingList rows={missing[open] ?? []} page={PAGE_LABELS[open]} />}
            </div>
          </SheetContent>
        )}
      </Sheet>
    </div>
  );
}

/**
 * ما ينقص هذه الصفحة — لا مفاتيح، بل سطرٌ لكل قسم غائب ورابط الشاشة التي يُدخَل منها.
 * الشريك لا يقرّر ظهور القسم؛ يقرّر أن يملأ بياناته أو لا.
 */
function MissingList({ rows, page }: { rows: MissingBlock[]; page: string }) {
  if (rows.length === 0) {
    return (
      <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
        صفحة «{page}» كاملة — كل أقسامها فيها بيانات وتظهر للزائر.
      </p>
    );
  }
  return (
    <div className="flex flex-col gap-3">
      <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm leading-relaxed text-amber-200">
        <b>{rows.length} من أقسام «{page}» ما تظهر للزائر</b> لأن بياناتها ناقصة. املأها من الشاشة المذكورة
        وتظهر على موقعك تلقائياً — بلا أي إعداد هنا.
      </p>
      <ul className="grid gap-2 [grid-template-columns:repeat(auto-fill,minmax(280px,1fr))]">
        {rows.map((b) => (
          <li key={b.key}>
            <a
              href={b.href}
              className="flex min-h-14 items-center gap-3 rounded-lg border bg-background px-3 transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" aria-hidden />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm">{b.name}</span>
                <span className="block text-xs text-muted-foreground">تُدخَل من «{b.where}»</span>
              </span>
              <ChevronLeft className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** One titled block inside the panel — three groups share one sheet, so each needs its own head. */
function Group({ title, hint, children }: { title: string; hint: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="text-sm font-bold text-foreground">{title}</h3>
      <p className="mb-3 mt-0.5 text-xs text-muted-foreground">{hint}</p>
      {children}
    </section>
  );
}

/**
 * One device: a real iframe, so the templates' `md:` breakpoints read the frame's own width.
 * The scale is decided by the stage, not by the frame — a frame that measured its own
 * wrapper was measuring itself, and the phone lost its place in the row.
 */
function DeviceFrame({
  title, size, src, scale, phone = false,
}: {
  title: string;
  size: { w: number; h: number };
  src: string;
  scale: number;
  phone?: boolean;
}) {
  return (
    <div className="flex shrink-0 flex-col gap-2">
      <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        {title}
        <code className="rounded bg-muted px-1.5 py-0.5 text-[11px]" dir="ltr">{size.w}×{size.h}</code>
        {scale < 1 && <span className="text-[11px] opacity-70" dir="ltr">{Math.round(scale * 100)}%</span>}
      </span>
      {/* حدّ الجهاز على غلاف خارجي، والصندوق القاصّ بمقاس المرسوم تماماً.
          حين كان الحدّ على الصندوق نفسه، ابتلع `border-box` عشرين بكسلاً من المحتوى —
          وهي حافّة الشريط اليسرى في RTL، أي شريط التمرير بذاته (مقيس: الإطار يبدأ عند
          x=6 والمرئي يبدأ عند x=26). */}
      {/* نصف قطر الغلاف = نصف قطر الصندوق الداخلي + سماكة الحدّ، وإلا انكسر المنحنى
          وبدا الجهاز مربّعاً: ٢rem + ١٢px ≈ ٢٫٧٥rem. */}
      <div className={cn("w-fit bg-background", phone ? "rounded-[2.75rem] border-[12px] border-foreground/85 shadow-xl" : "rounded-2xl border shadow-sm")}>
        <div
          className={cn("overflow-hidden", phone ? "rounded-[2rem]" : "rounded-[0.85rem]")}
          style={{ width: size.w * scale, height: size.h * scale }}
        >
          <iframe
            src={src}
            title={`معاينة ${title}`}
            width={size.w}
            height={size.h}
            className="origin-top-right border-0"
            style={{ transform: `scale(${scale})` }}
          />
        </div>
      </div>
    </div>
  );
}

function ColorChoices({ value, onPick }: { value: string | null; onPick: (c: string | null) => void }) {
  return (
    <div role="radiogroup" aria-label="اللون الأساسي" className="flex flex-wrap items-center gap-1">
      <button
        type="button"
        role="radio"
        aria-checked={value === null}
        onClick={() => onPick(null)}
        className="group flex min-h-11 items-center px-1"
      >
        <span className={cn("rounded-full border px-3 py-1 text-xs", value === null ? "border-primary bg-primary/5 font-medium" : "group-hover:bg-muted/40")}>
          لون مدونتي
        </span>
      </button>
      {PARTNER_SITE_PALETTE.map((c) => {
        const selected = value === c.hex;
        return (
          <button
            key={c.hex}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={c.label}
            title={c.label}
            onClick={() => onPick(c.hex)}
            className="group grid h-11 w-11 place-items-center"
          >
            <span
              className={cn("grid h-7 w-7 place-items-center rounded-full ring-offset-2 ring-offset-background", selected && "ring-2 ring-foreground")}
              style={{ backgroundColor: c.hex }}
            >
              {selected && <Check className="h-3.5 w-3.5 text-white" aria-hidden />}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/**
 * Choosing by SHAPE, not by name: every option is the real template rendered with his own
 * logo, pages and colour — cropped to the band that actually differs (the top for headers,
 * the bottom for footers) so five options fit in a 420px panel.
 */
function ShapeChoices({
  options, value, onPick, previewSrc, cropSource, fromBottom = false,
}: {
  options: { key: string; name: string }[];
  value: string;
  onPick: (key: string) => void;
  previewSrc: (key: string) => string;
  /** How many pixels OF THE SITE to show — the band where the templates differ. */
  cropSource: number;
  fromBottom?: boolean;
}) {
  // The scale follows the panel, it is not a constant. It used to be a hard 0.29, chosen when
  // the panel was 420px wide; in today's 1195px sheet that painted every template 371px wide
  // and left the rest empty — deciding on a thumbnail with the room for the real thing.
  const box = useRef<HTMLDivElement>(null);
  const [k, setK] = useState(0.3);
  const FRAME_H = 1600; // ارتفاع الإطار الذي نقصّ منه
  useEffect(() => {
    const n = box.current;
    if (!n) return;
    const fit = () => setK(Math.min(1, Math.max(0.2, (n.clientWidth - 4) / DESKTOP.w)));
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(n);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={box} role="radiogroup" className="flex flex-col gap-3">
      {options.map((o) => {
        const selected = value === o.key;
        return (
          <button
            key={o.key}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onPick(o.key)}
            className={cn(
              "overflow-hidden rounded-xl border-2 text-start transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              selected ? "border-primary ring-4 ring-primary/15" : "hover:border-muted-foreground/40",
            )}
          >
            <div className="pointer-events-none overflow-hidden bg-background" style={{ height: Math.round(cropSource * k) }}>
              <iframe
                src={previewSrc(o.key)}
                title={o.name}
                width={DESKTOP.w}
                height={FRAME_H}
                tabIndex={-1}
                className="origin-top-right border-0"
                style={{
                  transform: `scale(${k})`,
                  marginTop: fromBottom ? `-${Math.round((FRAME_H - cropSource) * k)}px` : 0,
                }}
              />
            </div>
            <span className={cn("flex items-center gap-2 border-t px-3 py-2 text-xs", selected ? "bg-primary/10 font-bold text-primary" : "text-muted-foreground")}>
              {o.name}
              <span className="ms-auto rounded-full border px-2 py-0.5 text-[11px]">{selected ? "مختار ✓" : "اختر"}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
