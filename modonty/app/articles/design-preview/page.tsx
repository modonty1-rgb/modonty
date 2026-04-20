"use client";

/**
 * DESIGN PREVIEW — Identical replica of the real article page
 * ▸ مستقل كلياً — zero imports من كود المشروع
 * ▸ للتصميم والتجربة فقط، لا تُنشر
 */

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";

// ─── Mock Data ────────────────────────────────────────────────────────────────

const ARTICLE = {
  title: "الذكاء الاصطناعي في الرعاية الصحية السعودية 2025",
  excerpt:
    "كيف يُحدث الذكاء الاصطناعي ثورة في الرعاية الصحية السعودية: من التشخيص بالأشعة إلى التطبيب عن بُعد. تطبيقات حقيقية ونتائج مذهلة في مستشفيات المملكة.",
  author: {
    name: "Modonty",
    initial: "M",
    jobTitle: "محرر أول — تقنية وصحة",
    bio: "Modonty is a leading content platform providing high-quality articles and insights.",
    slug: "modonty",
    social: [
      { key: "twitter", label: "إكس / تويتر", icon: "𝕏" },
      { key: "snapchat", label: "سناب شات", icon: "👻" },
      { key: "instagram", label: "انستغرام", icon: "📷" },
      { key: "linkedin", label: "لينكد إن", icon: "in" },
    ],
  },
  date: "قبل يوم واحد",
  dateIso: "2025-03-15",
  readingTimeMinutes: 6,
  wordCount: 1240,
  client: {
    name: "متجر نوفا للإلكترونيات",
    slug: "nova-electronics",
    desc: "متجر إلكتروني رائد في المملكة متخصص في الإلكترونيات.",
    logo: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=80&h=80&q=80&fit=crop",
    hero: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=480&q=70",
  },
  category: { name: "التسويق الرقمي", slug: "digital-marketing" },
  tags: ["ذكاء اصطناعي", "الصحة", "رؤية 2030", "SEO"],
  image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=1200&q=80",
  stats: { likes: 48, dislikes: 2, favorites: 31, views: 2140, comments: 4, questions: 3 },
  citations: [
    "منظمة الصحة العالمية — تقرير الذكاء الاصطناعي في الرعاية الصحية 2025",
    "هيئة الصحة السعودية — الاستراتيجية الوطنية للتحول الرقمي الصحي",
    "المجلة الطبية السعودية، العدد 42، 2025",
  ],
};

const TOC_ITEMS = [
  { id: "revolution", text: "ثورة الذكاء الاصطناعي في المستشفيات", level: 2 },
  { id: "current-apps", text: "التطبيقات الحالية", level: 2 },
  { id: "radiology", text: "التشخيص بالأشعة", level: 3 },
  { id: "telemedicine", text: "التطبيب عن بُعد", level: 3 },
  { id: "challenges", text: "التحديات والحلول", level: 2 },
  { id: "future", text: "المستقبل", level: 2 },
];

const MORE_FROM_MODONTY = [
  { id: "m1", title: "ما هو الذكاء الاصطناعي التوليدي؟", client: "مدونتي", readTime: "٤ دقائق" },
  { id: "m2", title: "كيف تبدأ مشروعك الرقمي في 2025", client: "مدونتي", readTime: "٦ دقائق" },
  { id: "m3", title: "أفضل أدوات التسويق الرقمي", client: "مدونتي", readTime: "٥ دقائق" },
];

const MORE_FROM_CLIENT = [
  { id: "c1", title: "أفضل 10 ساعات ذكية لعام 2025", readTime: "٣ دقائق" },
  { id: "c2", title: "دليل شراء اللابتوب المناسب", readTime: "٧ دقائق" },
  { id: "c3", title: "مقارنة أفضل الهواتف في السوق السعودي", readTime: "٥ دقائق" },
];

const RELATED_ARTICLES = [
  { id: "r1", title: "دليل SEO المتاجر الإلكترونية 2025", client: "متجر نوفا", readTime: "٥ دقائق", likes: 32 },
  { id: "r2", title: "مستقبل التجارة الإلكترونية في السعودية", client: "متجر نوفا", readTime: "٤ دقائق", likes: 19 },
  { id: "r3", title: "أفضل تقنيات الذكاء الاصطناعي للأعمال الصغيرة", client: "متجر نوفا", readTime: "٣ دقائق", likes: 27 },
];

const FAQS = [
  { q: "هل الذكاء الاصطناعي يمكنه تشخيص الأمراض بدقة كاملة؟", a: "لا، الذكاء الاصطناعي أداة مساعدة للطبيب وليس بديلاً عنه. دقته تصل إلى 94.5% في بعض التطبيقات لكنه يحتاج مراجعة بشرية دائماً." },
  { q: "ما أبرز المستشفيات السعودية التي تستخدم الذكاء الاصطناعي؟", a: "مستشفى الملك فيصل التخصصي، مستشفى الحرس الوطني، وعدد من مستشفيات نيوم." },
  { q: "هل بيانات المرضى آمنة مع الذكاء الاصطناعي؟", a: "تعتمد المستشفيات السعودية بروتوكولات تشفير متقدمة وتخزين محلي وفق اشتراطات هيئة الصحة السعودية." },
];

const COMMENTS_DATA = [
  { id: "c1", author: "سارة الحربي", initial: "س", text: "مقال رائع جداً! أتمنى لو تحدثتم أكثر عن تطبيقات الذكاء الاصطناعي في طب الأسنان.", date: "منذ ساعة", likes: 4 },
  { id: "c2", author: "محمد القحطاني", initial: "م", text: "هل هناك دراسات سعودية محلية تدعم هذه الأرقام؟ أريد مصادر للاقتباس منها.", date: "منذ ٣ ساعات", likes: 7 },
  { id: "c3", author: "نورة العتيبي", initial: "ن", text: "ممتاز. شاركته مع فريق العمل في المستشفى. هذا بالضبط ما نحتاج فهمه.", date: "منذ يوم", likes: 12 },
  { id: "c4", author: "فهد البقمي", initial: "ف", text: "أتمنى تغطية موضوع الذكاء الاصطناعي في الصحة النفسية في مقال قادم.", date: "منذ يومين", likes: 3 },
];

const BODY_HTML = `
<h2 id="revolution">ثورة الذكاء الاصطناعي في المستشفيات السعودية</h2>
<p>تشهد المملكة العربية السعودية تحولاً جذرياً في القطاع الصحي بفضل الذكاء الاصطناعي. مع رؤية 2030، تستثمر المملكة مليارات الريالات في التقنيات الصحية الذكية.</p>
<p>أظهرت الدراسات أن أنظمة الذكاء الاصطناعي تستطيع <strong>تشخيص سرطان الثدي بدقة 94.5%</strong>، متفوقة على بعض الأطباء المتخصصين. هذه التقنية تُنقذ آلاف المرضى سنوياً من خلال الكشف المبكر.</p>
<h2 id="current-apps">التطبيقات الحالية</h2>
<h3 id="radiology">التشخيص بالأشعة</h3>
<p>تستخدم مستشفيات الرياض وجدة أنظمة الذكاء الاصطناعي لقراءة صور الأشعة السينية والرنين المغناطيسي، مما يقلل وقت التشخيص من أيام إلى دقائق.</p>
<h3 id="telemedicine">التطبيب عن بُعد</h3>
<p>منصات مثل صحة وموعد تتيح للمرضى استشارة الأطباء عن بُعد مع دعم الذكاء الاصطناعي للتشخيص الأولي وتوجيه المريض للتخصص المناسب.</p>
<h2 id="challenges">التحديات والحلول</h2>
<p>رغم التقدم الكبير، تواجه هذه التقنيات تحديات في خصوصية البيانات والثقة. الحل يكمن في تنظيمات واضحة وشفافية في آلية عمل الخوارزميات.</p>
<h2 id="future">المستقبل</h2>
<p>بحلول 2030، ستكون 50% من التشخيصات الروتينية مدعومة بالذكاء الاصطناعي. هذا لا يعني استبدال الأطباء، بل تمكينهم بأدوات أذكى وأدق.</p>
`;

// ─── Hooks ────────────────────────────────────────────────────────────────────

function useReadingProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const update = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(total > 0 ? Math.min((window.scrollY / total) * 100, 100) : 0);
    };
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  return progress;
}

function useActiveSection(ids: string[]) {
  const [active, setActive] = useState<string>("");
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(e.target.id);
        }
      },
      { rootMargin: "-20% 0px -70% 0px" }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, [ids]);
  return active;
}

function useHideOnScroll() {
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);
  useEffect(() => {
    const update = () => {
      const curr = window.scrollY;
      setVisible(curr < lastScrollY.current || curr < 80);
      lastScrollY.current = curr;
    };
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  return visible;
}

// ─── Atom Components ─────────────────────────────────────────────────────────

function InitialAvatar({ initial, size = "md" }: { initial: string; size?: "sm" | "md" | "lg" }) {
  const sz = size === "lg" ? "h-20 w-20 text-xl" : size === "sm" ? "h-8 w-8 text-sm" : "h-10 w-10 text-base";
  return (
    <div className={`${sz} rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold shrink-0`}>
      {initial}
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-muted/40 px-3 py-1 text-xs text-muted-foreground hover:bg-muted/70 transition-colors cursor-pointer">
      {children}
    </span>
  );
}

// ─── Reading Progress ────────────────────────────────────────────────────────

function ReadingProgressBar() {
  const progress = useReadingProgress();
  return (
    <div
      className="fixed top-0 left-0 right-0 z-[60] h-[3px] bg-gradient-to-r from-primary via-primary/80 to-primary/60 transition-all duration-100"
      style={{ width: `${progress}%` }}
      role="progressbar"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
    />
  );
}

// ─── Collapsible Section (identical to original accordion) ───────────────────

function CollapsibleSection({
  title,
  count,
  icon,
  children,
  forceOpen,
}: {
  title: string;
  count: number;
  icon: string;
  children: React.ReactNode;
  forceOpen?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const isOpen = forceOpen ?? open;
  return (
    <div className="rounded-xl border border-border/60 overflow-hidden mb-4">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <span className="text-base">{icon}</span>
          <span>انقر لعرض {title}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-foreground">
            {title} ({count})
          </span>
          <svg
            className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      {isOpen && <div className="px-5 pb-5 pt-2 border-t border-border/40">{children}</div>}
    </div>
  );
}

// ─── Left Sidebar (Column 1, visually RIGHT in RTL) ──────────────────────────

function ClientCard() {
  return (
    <div className="rounded-xl border border-border/60 bg-card overflow-hidden min-w-0">
      {/* Hero + Logo */}
      <div className="aspect-video w-full bg-muted relative overflow-hidden">
        <Image
          src={ARTICLE.client.hero}
          alt={ARTICLE.client.name}
          fill
          className="object-cover"
          sizes="240px"
        />
        {/* Scrim */}
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/40 to-transparent pointer-events-none z-[1]" />
        {/* Logo circle bottom-right */}
        <div className="absolute bottom-3 right-3 z-10 w-14 h-14 rounded-full overflow-hidden ring-2 ring-background shadow-lg bg-background flex items-center justify-center">
          <Image
            src={ARTICLE.client.logo}
            alt={ARTICLE.client.name}
            width={56}
            height={56}
            className="object-contain p-1.5"
            sizes="56px"
          />
        </div>
      </div>
      {/* Name + Description */}
      <div className="p-4 flex flex-col gap-2">
        <h2 className="font-semibold text-base leading-tight">
          <Link href={`/clients/${ARTICLE.client.slug}`} className="inline-flex items-center gap-1 text-foreground hover:text-primary transition-colors">
            {ARTICLE.client.name}
            <svg className="h-4 w-4 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">{ARTICLE.client.desc}</p>
      </div>
      {/* Ask Client CTA */}
      <div className="px-4 pb-4">
        <button
          type="button"
          className="w-full rounded-lg bg-primary text-primary-foreground text-sm font-semibold py-2.5 hover:bg-primary/90 transition-colors"
        >
          اسأل العميل
        </button>
      </div>
    </div>
  );
}

function SidebarEngagement() {
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [favorited, setFavorited] = useState(false);

  return (
    <div className="rounded-xl border border-border/60 bg-card p-5 flex flex-col gap-5 min-w-0">
      {/* Login prompt + interaction */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => { setLiked(!liked); if (disliked) setDisliked(false); }}
            className={`flex items-center gap-1 rounded-md px-2.5 py-1.5 text-sm transition-colors ${liked ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}
            title="إعجاب"
          >
            <svg className="h-4 w-4" fill={liked ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
            </svg>
            <span className="text-xs font-medium">{ARTICLE.stats.likes + (liked ? 1 : 0)}</span>
          </button>
          <button
            onClick={() => { setDisliked(!disliked); if (liked) setLiked(false); }}
            className={`flex items-center gap-1 rounded-md px-2.5 py-1.5 text-sm transition-colors ${disliked ? "text-destructive bg-destructive/10" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}
            title="عدم إعجاب"
          >
            <svg className="h-4 w-4" fill={disliked ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
            </svg>
          </button>
          <button
            onClick={() => setFavorited(!favorited)}
            className={`flex items-center gap-1 rounded-md px-2.5 py-1.5 text-sm transition-colors ${favorited ? "text-yellow-500 bg-yellow-500/10" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}
            title="حفظ"
          >
            <svg className="h-4 w-4" fill={favorited ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            <span className="text-xs font-medium">{ARTICLE.stats.favorites + (favorited ? 1 : 0)}</span>
          </button>
        </div>
        {/* Engagement metrics */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
          <span className="flex items-center gap-1">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            {ARTICLE.stats.views.toLocaleString("ar-SA")}
          </span>
          <span className="flex items-center gap-1">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            {ARTICLE.stats.comments}
          </span>
          <span className="flex items-center gap-1">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {ARTICLE.stats.questions}
          </span>
        </div>
      </div>
      {/* Share */}
      <div className="flex flex-col gap-3 border-t border-border/40 pt-4">
        <span className="text-xs font-semibold text-muted-foreground tracking-tight">شارك المقال</span>
        <div className="flex items-center gap-2 flex-wrap">
          <button type="button" className="flex items-center gap-1.5 rounded-md bg-muted/50 hover:bg-muted px-3 py-1.5 text-xs text-muted-foreground transition-colors">
            🔗 نسخ الرابط
          </button>
          <button type="button" className="flex items-center gap-1.5 rounded-md bg-muted/50 hover:bg-muted px-3 py-1.5 text-xs text-muted-foreground transition-colors">
            𝕏 تويتر
          </button>
          <button type="button" className="flex items-center gap-1.5 rounded-md bg-muted/50 hover:bg-muted px-3 py-1.5 text-xs text-muted-foreground transition-colors">
            in لينكد إن
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Right Sidebar (Column 3, visually LEFT in RTL) ──────────────────────────

function AuthorBio() {
  return (
    <div className="rounded-xl border border-border/60 bg-card px-4 py-3 flex items-center justify-between gap-3 min-w-0">
      {/* Logo + Name */}
      <Link href="/about" className="flex items-center gap-2.5 min-w-0 hover:opacity-80 transition-opacity">
        <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">
          M
        </div>
        <span className="text-sm font-semibold truncate">مدونتي</span>
        <svg className="h-3.5 w-3.5 text-muted-foreground shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      </Link>
      {/* Social icons */}
      <nav className="flex items-center gap-1 shrink-0" aria-label="وسائل التواصل مدونتي">
        {ARTICLE.author.social.map(({ key, label, icon }) => (
          <button
            key={key}
            type="button"
            className="inline-flex items-center justify-center w-6 h-6 rounded text-muted-foreground hover:text-primary hover:bg-muted/50 transition-colors text-[11px] font-semibold"
            aria-label={label}
          >
            {icon}
          </button>
        ))}
      </nav>
    </div>
  );
}

function NewsletterCTA() {
  const [email, setEmail] = useState("");
  return (
    <div className="rounded-xl border border-border/60 bg-card p-4 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <span className="text-base">📋</span>
        <p className="text-sm font-semibold">اشترك في النشرة الإخبارية</p>
      </div>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="البريد الإلكتروني"
        className="w-full rounded-lg border border-border/60 bg-muted/30 px-3 py-2 text-sm text-right focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-colors placeholder:text-muted-foreground/60"
      />
      <button type="button" className="w-full rounded-lg bg-primary text-primary-foreground text-sm font-semibold py-2 hover:bg-primary/90 transition-colors">
        اشترك
      </button>
    </div>
  );
}

function CommentFormBox({ articleId }: { articleId: string }) {
  const [text, setText] = useState("");
  return (
    <div className="rounded-xl border border-border/60 bg-card p-4 flex flex-col gap-3">
      <p className="text-sm font-semibold">أضف تعليق</p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="أضف تعليقاً"
        rows={3}
        className="w-full rounded-lg border border-border/60 bg-muted/30 px-3 py-2 text-sm text-right resize-none focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-colors placeholder:text-muted-foreground/60"
      />
      {text.trim() && (
        <button type="button" className="self-end rounded-full bg-primary text-primary-foreground text-xs font-semibold px-5 py-2 hover:bg-primary/90 transition-colors">
          نشر
        </button>
      )}
    </div>
  );
}

function ArticleTOC() {
  const ids = TOC_ITEMS.filter((t) => t.level === 2).map((t) => t.id);
  const active = useActiveSection(TOC_ITEMS.map((t) => t.id));

  return (
    <nav aria-label="جدول المحتويات">
      <p className="text-sm font-semibold mb-3 text-foreground">المحتويات</p>
      <ul className="space-y-1">
        {TOC_ITEMS.map((item) => (
          <li key={item.id} className={item.level === 3 ? "ps-4" : ""}>
            <a
              href={`#${item.id}`}
              className={`block text-sm py-0.5 transition-colors ${
                active === item.id
                  ? "text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {active === item.id && (
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary me-2 align-middle" />
              )}
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

// ─── Newsletter Dialog (lazy — only mounts on demand) ────────────────────────

function NewsletterDialog({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  function handleSubscribe() {
    if (email.trim()) setSubscribed(true);
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      {/* Sheet */}
      <div className="relative z-10 w-full sm:max-w-md bg-background rounded-t-2xl sm:rounded-2xl px-6 pb-8 pt-5 shadow-xl">
        {/* Handle */}
        <div className="w-10 h-1 rounded-full bg-border mx-auto mb-5 sm:hidden" />
        {/* Close */}
        <button type="button" onClick={onClose} className="absolute top-4 left-4 text-muted-foreground hover:text-foreground transition-colors">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {subscribed ? (
          <div className="text-center py-4">
            <p className="text-2xl mb-2">✅</p>
            <p className="font-semibold text-base">تم الاشتراك!</p>
            <p className="text-sm text-muted-foreground mt-1">ستصلك أحدث أخبار {ARTICLE.client.name} مباشرة</p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-full overflow-hidden ring-2 ring-border bg-muted shrink-0 flex items-center justify-center">
                <Image src={ARTICLE.client.logo} alt={ARTICLE.client.name} width={40} height={40} className="object-contain p-1" sizes="40px" />
              </div>
              <div>
                <p className="font-semibold text-sm">{ARTICLE.client.name}</p>
                <p className="text-xs text-muted-foreground">اشترك واحصل على أحدث المقالات والعروض</p>
              </div>
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubscribe()}
              placeholder="بريدك الإلكتروني"
              className="w-full rounded-xl border border-border/60 bg-muted/30 px-4 py-3 text-sm text-right focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-colors placeholder:text-muted-foreground/60 mb-3"
            />
            <button
              type="button"
              onClick={handleSubscribe}
              className="w-full rounded-xl bg-primary text-primary-foreground text-sm font-semibold py-3 hover:bg-primary/90 transition-colors"
            >
              اشترك الآن — مجاناً
            </button>
            <p className="text-center text-xs text-muted-foreground mt-3">لا رسائل مزعجة. إلغاء الاشتراك في أي وقت.</p>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Featured Image + Newsletter Trigger ──────────────────────────────────────

function FeaturedImageWithNewsletter() {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <div className="relative w-full mb-6 rounded-xl overflow-hidden bg-muted">
        <Image
          src={ARTICLE.image}
          alt={ARTICLE.title}
          width={1200}
          height={630}
          className="w-full h-auto object-contain"
          priority
          sizes="(max-width: 768px) 100vw, (max-width: 1128px) 60vw, 608px"
        />
        {/* Scrim + trigger only — no form here */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/50 to-transparent px-4 pb-4 pt-16 flex items-center gap-2 flex-wrap">
          <p className="text-white text-sm font-semibold">جديد {ARTICLE.client.name} في بريدك 🔔</p>
          <button
            type="button"
            onClick={() => setDialogOpen(true)}
            className="text-white/80 text-sm underline underline-offset-2 hover:text-white transition-colors whitespace-nowrap"
          >
            اشترك الآن ←
          </button>
        </div>
      </div>

      {/* Dialog — only mounts when opened */}
      {dialogOpen && <NewsletterDialog onClose={() => setDialogOpen(false)} />}
    </>
  );
}

// ─── Mobile Article Bar ───────────────────────────────────────────────────────

function MobileArticleBar({ onComment, onOpenSheet, onOpenNewsletter }: { onComment: () => void; onOpenSheet: () => void; onOpenNewsletter: () => void }) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const barVisible = useHideOnScroll();

  return (
    <div className={`lg:hidden sticky top-14 z-[45] bg-background/95 backdrop-blur-sm border-b border-border/60 px-3 py-1.5 flex items-center gap-1 transition-transform duration-300 ease-in-out ${barVisible ? "translate-y-0" : "-translate-y-full"}`}>

      {/* ── Zone 1: Client ── */}
      <Link href={`/clients/${ARTICLE.client.slug}`} className="shrink-0">
        <div className="h-8 w-8 rounded-full overflow-hidden ring-2 ring-border bg-background flex items-center justify-center">
          <Image src={ARTICLE.client.logo} alt={ARTICLE.client.name} width={32} height={32} className="object-contain p-0.5" sizes="32px" />
        </div>
      </Link>
      <button type="button" className="rounded-lg bg-primary text-primary-foreground text-xs font-semibold py-1.5 px-3 hover:bg-primary/90 transition-colors whitespace-nowrap">
        اسأل العميل
      </button>

      {/* ── Separator ── */}
      <div className="w-px h-5 bg-border/60 mx-1 shrink-0" />

      {/* ── Zone 2: Engagement (stacked icon + count) ── */}
      <button
        type="button"
        onClick={() => setLiked(!liked)}
        className={`flex items-center gap-1 px-2 py-1.5 rounded-lg transition-colors ${liked ? "text-primary bg-primary/10" : "text-muted-foreground hover:bg-muted/50"}`}
      >
        <svg className="h-4 w-4" fill={liked ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
        </svg>
        <span className="text-xs font-medium">{ARTICLE.stats.likes + (liked ? 1 : 0)}</span>
      </button>

      <button
        type="button"
        onClick={() => setSaved(!saved)}
        className={`flex items-center gap-1 px-2 py-1.5 rounded-lg transition-colors ${saved ? "text-yellow-500 bg-yellow-500/10" : "text-muted-foreground hover:bg-muted/50"}`}
      >
        <svg className="h-4 w-4" fill={saved ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
        <span className="text-xs font-medium">{ARTICLE.stats.favorites + (saved ? 1 : 0)}</span>
      </button>

      <button
        type="button"
        onClick={onComment}
        className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-muted-foreground hover:bg-muted/50 transition-colors"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        <span className="text-xs font-medium">{ARTICLE.stats.comments}</span>
      </button>

      {/* ── Newsletter ── */}
      <button
        type="button"
        onClick={onOpenNewsletter}
        className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-muted-foreground hover:bg-muted/50 transition-colors"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      </button>

      {/* ── Share ── */}
      <button
        type="button"
        onClick={() => {
          if (typeof navigator !== "undefined" && "share" in navigator) {
            (navigator as Navigator & { share: (d: object) => Promise<void> }).share({ title: ARTICLE.title, url: window.location.href });
          } else {
            void (navigator as Navigator).clipboard?.writeText(window.location.href);
          }
        }}
        className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-muted-foreground hover:bg-muted/50 transition-colors"
        aria-label="مشاركة المقال"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
      </button>

      {/* ── Burger → Sheet ── */}
      <button
        type="button"
        onClick={onOpenSheet}
        className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-muted-foreground hover:bg-muted/50 transition-colors ms-auto"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </div>
  );
}

// ─── Mobile Sidebar Sheet ─────────────────────────────────────────────────────

function MobileSidebarSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const activeSection = useActiveSection(TOC_ITEMS.map((t) => t.id));
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full bg-background rounded-t-2xl shadow-xl max-h-[88vh] overflow-y-auto">
        {/* Handle */}
        <div className="w-10 h-1 rounded-full bg-border mx-auto mt-3 mb-1" />

        <div className="px-5 pb-10 pt-2 flex flex-col gap-5">

          {/* ── 1. Client Card ── */}
          <div className="rounded-xl border border-border/60 overflow-hidden">
            <div className="aspect-video w-full bg-muted relative overflow-hidden">
              <Image src={ARTICLE.client.hero} alt={ARTICLE.client.name} fill className="object-cover" sizes="100vw" />
              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
              <div className="absolute bottom-3 right-3 w-12 h-12 rounded-full overflow-hidden ring-2 ring-background shadow bg-background flex items-center justify-center">
                <Image src={ARTICLE.client.logo} alt={ARTICLE.client.name} width={48} height={48} className="object-contain p-1" sizes="48px" />
              </div>
            </div>
            <div className="p-4 flex flex-col gap-2">
              <Link href={`/clients/${ARTICLE.client.slug}`} onClick={onClose} className="font-semibold text-sm hover:text-primary transition-colors flex items-center gap-1">
                {ARTICLE.client.name}
                <svg className="h-3.5 w-3.5 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <p className="text-xs text-muted-foreground leading-relaxed">{ARTICLE.client.desc}</p>
              <button type="button" className="w-full mt-1 rounded-lg bg-primary text-primary-foreground text-sm font-semibold py-2.5 hover:bg-primary/90 transition-colors">
                اسأل العميل
              </button>
            </div>
          </div>

          <div className="h-px bg-border/40" />

          {/* ── 2. Newsletter ── */}
          <div>
            <p className="text-sm font-semibold mb-1">جديد {ARTICLE.client.name} في بريدك 🔔</p>
            <p className="text-xs text-muted-foreground mb-3">اشترك واحصل على أحدث المقالات والعروض</p>
            {subscribed ? (
              <p className="text-sm text-primary font-medium">✅ تم الاشتراك!</p>
            ) : (
              <div className="flex gap-2">
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="بريدك الإلكتروني"
                  className="flex-1 rounded-xl border border-border/60 bg-muted/30 px-3 py-2.5 text-sm text-right focus:outline-none focus:border-primary/60 transition-colors placeholder:text-muted-foreground/60 min-w-0"
                />
                <button
                  type="button"
                  onClick={() => { if (newsletterEmail.trim()) setSubscribed(true); }}
                  className="rounded-xl bg-primary text-primary-foreground text-sm font-semibold px-4 py-2.5 hover:bg-primary/90 transition-colors whitespace-nowrap shrink-0"
                >
                  اشترك
                </button>
              </div>
            )}
          </div>

          <div className="h-px bg-border/40" />

          {/* ── 3. TOC ── */}
          <div>
            <p className="text-sm font-semibold mb-3">المحتويات</p>
            <ul className="space-y-1">
              {TOC_ITEMS.map((item) => (
                <li key={item.id} className={item.level === 3 ? "ps-4" : ""}>
                  <a
                    href={`#${item.id}`}
                    onClick={onClose}
                    className={`block text-sm py-1 transition-colors ${activeSection === item.id ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    {activeSection === item.id && <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary me-2 align-middle" />}
                    {item.text}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="h-px bg-border/40" />

          {/* ── 4. Share ── */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-3">شارك المقال</p>
            <div className="flex items-center gap-2 flex-wrap">
              <button type="button" className="flex items-center gap-2 rounded-xl bg-muted/50 hover:bg-muted px-4 py-2.5 text-sm transition-colors">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                مشاركة
              </button>
              <button type="button" className="flex items-center gap-2 rounded-xl bg-muted/50 hover:bg-muted px-4 py-2.5 text-sm transition-colors">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                نسخ الرابط
              </button>
            </div>
          </div>

          <div className="h-px bg-border/40" />

          {/* ── 5. Modonty branding ── */}
          <div className="flex items-center justify-between gap-3">
            <Link href="/about" onClick={onClose} className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
              <div className="h-9 w-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">M</div>
              <div>
                <p className="text-sm font-semibold">مدونتي</p>
                <p className="text-xs text-muted-foreground">منصة المحتوى العربي</p>
              </div>
            </Link>
            <nav className="flex items-center gap-1">
              {ARTICLE.author.social.map(({ key, label, icon }) => (
                <button key={key} type="button" aria-label={label} className="inline-flex items-center justify-center w-7 h-7 rounded text-muted-foreground hover:text-primary hover:bg-muted/50 transition-colors text-[11px] font-semibold">
                  {icon}
                </button>
              ))}
            </nav>
          </div>

          <div className="h-px bg-border/40" />

          {/* ── 6. Citations ── */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-3">المصادر والمراجع</p>
            <ul className="space-y-2">
              {ARTICLE.citations.map((citation, i) => (
                <li key={i} className="text-xs text-muted-foreground leading-relaxed">
                  {i + 1}. {citation}
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DesignPreviewPage() {
  const [commentText, setCommentText] = useState("");
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [newsletterOpen, setNewsletterOpen] = useState(false);

  function handleCommentClick() {
    setCommentsOpen(true);
    setTimeout(() => {
      document.getElementById("comments-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }

  return (
    <>
      <ReadingProgressBar />

      {/* Design Preview Banner */}
      <div className="bg-yellow-500/10 border-b border-yellow-500/30 text-center py-1.5 text-xs text-yellow-600 dark:text-yellow-400 font-medium">
        🎨 Design Preview – صفحة تجريبية فقط
      </div>

      {/* Breadcrumb */}
      <nav className="container mx-auto max-w-[1128px] px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-2 text-xs text-muted-foreground" aria-label="مسار التنقل">
        <Link href="/" className="hover:text-foreground transition-colors flex items-center gap-1">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          الرئيسية
        </Link>
        <span>›</span>
        <Link href="/clients" className="hover:text-foreground transition-colors">العملاء</Link>
        <span>›</span>
        <Link href={`/clients/${ARTICLE.client.slug}`} className="hover:text-foreground transition-colors">{ARTICLE.client.name}</Link>
        <span>›</span>
        <span className="text-foreground truncate max-w-[200px]">{ARTICLE.title}</span>
      </nav>

      {/* ── Mobile Article Bar — sticky below breadcrumb ── */}
      <MobileArticleBar onComment={handleCommentClick} onOpenSheet={() => setSheetOpen(true)} onOpenNewsletter={() => setNewsletterOpen(true)} />

      {/* ── Main Layout ─────────────────────────────────────────────────────── */}
      <main
        id="main-content"
        className="container mx-auto max-w-[1128px] px-4 sm:px-6 lg:px-8 py-6 md:py-8 pb-40 lg:pb-8 flex-1"
      >
        <div className="flex flex-col lg:grid lg:grid-cols-[240px_1fr_280px] lg:items-start gap-6 md:gap-8">

          {/* ── Column 1: Client + Engagement (visually RIGHT in RTL) ───────── */}
          <aside className="hidden lg:flex w-[240px] min-w-0 shrink-0 flex-col gap-6" aria-label="مشاركة وتفاعل">
            <div className="sticky top-[3.5rem] flex flex-col gap-6">
              <ClientCard />
              <SidebarEngagement />
            </div>
          </aside>

          {/* ── Column 2: Article Content ────────────────────────────────────── */}
          <div className="w-full min-w-0">
            <article>
              {/* Header */}
              <header className="mb-6 md:mb-8">
                <h1 className="text-2xl md:text-3xl font-semibold mb-4">{ARTICLE.title}</h1>
                <p className="text-base md:text-lg text-muted-foreground mb-6 leading-relaxed">{ARTICLE.excerpt}</p>
                <div className="flex flex-row flex-wrap items-center gap-2 sm:gap-4 text-sm text-muted-foreground mb-4">
                  <span>{ARTICLE.author.name}</span>
                  <time dateTime={ARTICLE.dateIso}>{ARTICLE.date}</time>
                  <span>⏱️ {ARTICLE.readingTimeMinutes} دقيقة قراءة</span>
                  <span>📝 {ARTICLE.wordCount.toLocaleString("ar-SA")} كلمة</span>
                  <span className="flex items-center gap-1">
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    {ARTICLE.stats.views.toLocaleString("ar-SA")}
                  </span>
                  <button
                    type="button"
                    onClick={() => document.getElementById("faq-section")?.scrollIntoView({ behavior: "smooth", block: "start" })}
                    className="flex items-center gap-1 hover:text-primary transition-colors"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {ARTICLE.stats.questions}
                  </button>
                </div>
              </header>

              {/* Featured Image + Newsletter Overlay */}
              <FeaturedImageWithNewsletter />

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                <Tag>🏪 {ARTICLE.client.name}</Tag>
                <Tag>📁 {ARTICLE.category.name}</Tag>
                {ARTICLE.tags.map((t) => <Tag key={t}>🏷 {t}</Tag>)}
              </div>

              {/* Article Body */}
              <div
                className="prose prose-base md:prose-lg max-w-none mb-8 md:mb-12"
                style={{ lineHeight: "1.6" }}
                dangerouslySetInnerHTML={{ __html: BODY_HTML }}
              />

              {/* ── Collapsible Sections (identical to original) ── */}

              {/* الأسئلة الشائعة */}
              <div id="faq-section">
              <CollapsibleSection title="الأسئلة الشائعة" count={ARTICLE.stats.questions} icon="❓">
                <div className="space-y-4">
                  {FAQS.map((faq, i) => (
                    <div key={i} className="border-b border-border/40 pb-4 last:border-0 last:pb-0">
                      <p className="text-sm font-semibold mb-1.5">{faq.q}</p>
                      <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                    </div>
                  ))}
                </div>
              </CollapsibleSection>
              </div>

              {/* التعليقات */}
              <div id="comments-section">
              <CollapsibleSection title="التعليقات" count={ARTICLE.stats.comments} icon="💬" forceOpen={commentsOpen}>
                <div className="space-y-4">
                  {COMMENTS_DATA.map((c) => (
                    <div key={c.id} className="flex gap-3">
                      <InitialAvatar initial={c.initial} size="sm" />
                      <div className="flex-1 rounded-xl bg-muted/30 px-4 py-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold">{c.author}</span>
                          <span className="text-xs text-muted-foreground">{c.date}</span>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">{c.text}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          <button type="button" className="flex items-center gap-1 hover:text-primary transition-colors">
                            👍 {c.likes}
                          </button>
                          <button type="button" className="hover:text-primary transition-colors">رد</button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {/* Comment form inline */}
                  <div className="flex gap-3 pt-2">
                    <InitialAvatar initial="أ" size="sm" />
                    <div className="flex-1">
                      <textarea
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="أضف تعليقاً..."
                        rows={3}
                        className="w-full rounded-xl border border-border/60 bg-muted/30 px-4 py-3 text-sm text-right resize-none focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-colors placeholder:text-muted-foreground/60"
                      />
                      {commentText.trim() && (
                        <div className="flex justify-end mt-2">
                          <button type="button" className="rounded-full bg-primary text-primary-foreground text-xs font-semibold px-5 py-2 hover:bg-primary/90 transition-colors">
                            نشر التعليق
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CollapsibleSection>
              </div>

              {/* المزيد من MODONTY */}
              <CollapsibleSection title="المزيد من MODONTY" count={MORE_FROM_MODONTY.length} icon="📋">
                <ul className="space-y-3">
                  {MORE_FROM_MODONTY.map((a) => (
                    <li key={a.id} className="flex items-start gap-3 text-sm">
                      <span className="text-muted-foreground text-xs mt-0.5">⏱️ {a.readTime}</span>
                      <Link href="#" className="hover:text-primary transition-colors">{a.title}</Link>
                    </li>
                  ))}
                </ul>
              </CollapsibleSection>

              {/* المزيد من العميل */}
              <CollapsibleSection title={`المزيد من ${ARTICLE.client.name}`} count={MORE_FROM_CLIENT.length} icon="📋">
                <ul className="space-y-3">
                  {MORE_FROM_CLIENT.map((a) => (
                    <li key={a.id} className="flex items-start gap-3 text-sm">
                      <span className="text-muted-foreground text-xs mt-0.5">⏱️ {a.readTime}</span>
                      <Link href="#" className="hover:text-primary transition-colors">{a.title}</Link>
                    </li>
                  ))}
                </ul>
              </CollapsibleSection>

              {/* مقالات قد تهمك */}
              <CollapsibleSection title="مقالات قد تهمك" count={RELATED_ARTICLES.length} icon="✨">
                <ul className="space-y-3">
                  {RELATED_ARTICLES.map((a) => (
                    <li key={a.id} className="flex items-start justify-between gap-3 text-sm">
                      <Link href="#" className="hover:text-primary transition-colors flex-1">{a.title}</Link>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
                        <span>⏱️ {a.readTime}</span>
                        <span>👍 {a.likes}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </CollapsibleSection>

              {/* Article Footer */}
              <footer className="mt-6 pt-4 border-t border-border/30 text-xs text-muted-foreground space-y-1">
                <p>نشر بواسطة <Link href={`/clients/${ARTICLE.client.slug}`} className="text-primary hover:underline">{ARTICLE.client.name}</Link> · آخر تحديث: قبل ساعتين</p>
                <p>عمق المحتوى: short</p>
                <p>الرخصة: https://creativecommons.org/licenses/by/4.0/</p>
              </footer>
            </article>
          </div>

          {/* ── Column 3: Author + Newsletter + Comment + TOC (visually LEFT in RTL) */}
          <aside className="hidden lg:flex min-w-0 flex-col gap-6" aria-label="جدول المحتويات">
            <div className="[&_section]:my-0">
              <AuthorBio />
            </div>
            <NewsletterCTA />
            <CommentFormBox articleId="preview-article-id" />
            <ArticleTOC />
          </aside>

        </div>

      </main>

      {/* ── Mobile Sidebar Sheet — lazy ── */}
      <MobileSidebarSheet open={sheetOpen} onClose={() => setSheetOpen(false)} />

      {/* ── Newsletter Dialog from Bar — lazy ── */}
      {newsletterOpen && <NewsletterDialog onClose={() => setNewsletterOpen(false)} />}
    </>
  );
}
