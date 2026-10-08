// يولّد `src/components/brand/icon-geometry.ts` من مصدر الماركة الوحيد `shared/components/icons/`.
//
// لماذا مولِّد لا نسخ يدوي: أيقونات الويب عناصر SVG للمتصفّح (`<svg>`/`<path>`) ولا تُرسم في React Native،
// فيلزم تحويلها إلى react-native-svg. التحويل هنا آلي: تُقرأ الهندسة **حرفياً** من ملفّ الماركة
// (d · x · y · rx · transform · strokeWidth …)، ويُستبدل اللون فقط: جسم الأيقونة ← `primary`،
// والماسة التركوازية ← `accent`. لا رسم ولا تعديل. إعادة التشغيل بعد أي تغيير في shared:
//   pnpm --filter ./modonty-mobile icons
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const iconsDir = join(here, '..', '..', 'shared', 'components', 'icons');
const out = join(here, '..', 'src', 'components', 'brand', 'icon-geometry.ts');

/** اسم الأيقونة في التطبيق ← ملفّ الماركة. */
const ICONS = {
  home: 'modonty-home-mark.tsx',
  articles: 'modonty-articles-mark.tsx',
  reels: 'modonty-reels-mark.tsx',
  search: 'modonty-search-mark.tsx',
  profile: 'modonty-profile-mark.tsx',
  categories: 'modonty-categories-mark.tsx',
  tags: 'modonty-tags-mark.tsx',
  industries: 'modonty-industries-mark.tsx',
  partner: 'modonty-partner-mark.tsx',
  like: 'modonty-like-mark.tsx',
  bookmark: 'modonty-bookmark-mark.tsx',
  comment: 'modonty-comment-mark.tsx',
  share: 'modonty-share-mark.tsx',
  notifications: 'modonty-notifications-mark.tsx',
  arrow: 'modonty-arrow-mark.tsx',
  error: 'modonty-error-mark.tsx',
  refresh: 'modonty-refresh-mark.tsx',
  info: 'modonty-info-mark.tsx',
  filter: 'modonty-filter-mark.tsx',
  sort: 'modonty-sort-mark.tsx',
  booking: 'modonty-booking-mark.tsx',
  phone: 'modonty-phone-mark.tsx',
  email: 'modonty-email-mark.tsx',
  location: 'modonty-location-mark.tsx',
  whatsapp: 'modonty-whatsapp-mark.tsx',
  login: 'modonty-login-mark.tsx',
  logout: 'modonty-logout-mark.tsx',
  check: 'modonty-check-mark.tsx',
  views: 'modonty-views-mark.tsx',
  clock: 'modonty-clock-mark.tsx',
  play: 'modonty-play-mark.tsx',
  rating: 'modonty-rating-mark.tsx',
  trust: 'modonty-trust-mark.tsx',
  question: 'modonty-question-mark.tsx',
  audio: 'modonty-audio-mark.tsx',
  trending: 'modonty-trending-mark.tsx',
  gallery: 'modonty-gallery-mark.tsx',
  calendar: 'modonty-calendar-mark.tsx',
  directions: 'modonty-directions-mark.tsx',
  support: 'modonty-support-mark.tsx',
  company: 'modonty-company-mark.tsx',
  keypoints: 'modonty-keypoints-mark.tsx',
  toc: 'modonty-toc-mark.tsx',
  feedback: 'modonty-feedback-mark.tsx',
  // خانات صفحة /modonty (`modonty/app/(site)/modonty/helpers/sectors.ts`) — ملفّات بعدّة علامات: `ملف#الدالّة`.
  quran: 'modonty-sector-marks.tsx#ModontyQuranMark',
  luckyWheel: 'modonty-sector-marks.tsx#ModontyLuckyWheelMark',
  football: 'modonty-sector-marks.tsx#ModontyFootballMark',
  markets: 'modonty-sector-marks.tsx#ModontyMarketsMark',
  entertainment: 'modonty-sector-marks.tsx#ModontyEntertainmentMark',
  education: 'modonty-sector-marks.tsx#ModontyEducationMark',
  health: 'modonty-sector-marks.tsx#ModontyHealthMark',
  idea: 'modonty-sector-marks.tsx#ModontyIdeaMark',
  ai: 'modonty-brand-icons.tsx#ModontyAiMark',
  link: 'modonty-brand-icons.tsx#ModontyLinkMark',
};

const TAGS = { path: 'Path', rect: 'Rect', circle: 'Circle', g: 'G', ellipse: 'Ellipse', line: 'Line', polyline: 'Polyline', polygon: 'Polygon' };
const KEEP = new Set(['d', 'x', 'y', 'width', 'height', 'rx', 'ry', 'cx', 'cy', 'r', 'x1', 'x2', 'y1', 'y2', 'points', 'transform', 'strokeWidth', 'strokeLinecap', 'strokeLinejoin', 'strokeMiterlimit', 'fillRule', 'clipRule', 'opacity', 'fillOpacity', 'strokeOpacity', 'strokeDasharray']);
const ACCENT = /accent|#00d8d8/i;

function paint(value) {
  const v = value.trim();
  if (v === 'none') return 'none';
  if (ACCENT.test(v)) return 'accent';
  if (/^#fff(fff)?$/i.test(v)) return 'white';
  return 'primary';
}

function parseAttrs(src) {
  const attrs = {};
  const re = /([a-zA-Z][\w:-]*)=(?:"([^"]*)"|\{([^}]*)\})/g;
  let m;
  while ((m = re.exec(src))) attrs[m[1]] = m[2] ?? m[3];
  return attrs;
}

function convert(name, spec) {
  const [file, fn] = spec.split('#');
  let src = readFileSync(join(iconsDir, file), 'utf8');
  // `{...stroke}` في ملفّ العلامات المتعدّدة: كائن مشترك أعلى الملفّ (`const stroke = { stroke: "currentColor", … }`).
  const shared = {};
  const sharedBlock = src.match(/const stroke = \{([\s\S]*?)\}/);
  if (sharedBlock) for (const [, k, v] of sharedBlock[1].matchAll(/(\w+):\s*"?([^",\n]+)"?/g)) shared[k] = v.trim();
  if (fn) {
    // ملفّ بعدّة علامات: نقصّ دالّة العلامة المطلوبة وحدها حتى الدالّة التالية.
    const start = src.indexOf(`export function ${fn}(`);
    if (start < 0) throw new Error(`${spec}: export not found`);
    const next = src.indexOf('export function', start + 1);
    src = src.slice(start, next < 0 ? undefined : next);
  }
  const exports = src.match(/export function/g) ?? [];
  if (exports.length !== 1) throw new Error(`${spec}: expected one export, found ${exports.length}`);
  const body = src.match(/<svg[^>]*>([\s\S]*?)<\/svg>/);
  if (!body) throw new Error(`${file}: no <svg> body`);
  const inner = body[1].replace(/\{\/\*[\s\S]*?\*\/\}/g, '');
  const root = { children: [] };
  const stack = [root];
  const tagRe = /<(\/?)([a-zA-Z]+)([^>]*?)(\/?)>/g;
  let m;
  while ((m = tagRe.exec(inner))) {
    const [, closing, tag, rawAttrs, selfClosing] = m;
    // `</path>` الصريح لا يُغلق شيئاً — `g` وحده يفتح مستوى.
    if (closing) { if (tag === 'g') stack.pop(); continue; }
    if (!TAGS[tag]) throw new Error(`${file}: unsupported <${tag}> — port by hand`);
    const a = { ...(rawAttrs.includes('{...stroke}') ? shared : {}), ...parseAttrs(rawAttrs) };
    const node = { t: TAGS[tag] };
    for (const [k, v] of Object.entries(a)) {
      if (k === 'fill' || k === 'stroke') node[k] = paint(v);
      else if (KEEP.has(k)) node[k] = /^-?\d+(\.\d+)?$/.test(v) ? Number(v) : v;
      else if (k === 'mask' || k === 'id' || k === 'clipPath') throw new Error(`${file}: <${tag} ${k}> — port by hand`);
    }
    if (tag === 'g' && !selfClosing) { node.children = []; stack.at(-1).children.push(node); stack.push(node); }
    else stack.at(-1).children.push(node);
  }
  return root.children;
}

const lines = [];
const skipped = [];
for (const [name, file] of Object.entries(ICONS)) {
  try { lines.push(`  ${JSON.stringify(name)}: ${JSON.stringify(convert(name, file))},`); }
  catch (e) { skipped.push(`${name}: ${e.message}`); }
}

writeFileSync(out, `// ملفّ مولَّد — لا يُعدَّل يدوياً. المصدر: shared/components/icons/ · المولِّد: scripts/generate-icons.mjs
/* eslint-disable */
export type IconPaint = 'primary' | 'accent' | 'white' | 'none';
export type IconNode = {
  t: 'Path' | 'Rect' | 'Circle' | 'G' | 'Ellipse' | 'Line' | 'Polyline' | 'Polygon';
  fill?: IconPaint;
  stroke?: IconPaint;
  children?: IconNode[];
  [attr: string]: string | number | IconNode[] | undefined;
};

export const ICON_GEOMETRY = {
${lines.join('\n')}
} satisfies Record<string, IconNode[]>;

export type IconGeometryName = keyof typeof ICON_GEOMETRY;
`);
console.log(`wrote ${lines.length} icons`);
if (skipped.length) console.log('skipped:\n' + skipped.join('\n'));
