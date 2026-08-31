/**
 * لون الشريك حين يُستعمل **نصّاً** — لا تعبئةً — على أرضية معلومة.
 *
 * القياس الذي أوجب هذا الملفّ (٣١ أغسطس، صفحة تواصل على السمة الداكنة):
 * `#1D4ED8` نصّاً على `#151519` = **٢٫٧٣:١** — وWCAG 1.4.3 يفرض ٤٫٥:١ للنصّ الصغير.
 * ستّة عناصر في صفحة واحدة سقطت به (تواصل · فين نحن · افتح الاتجاهات · اترك رقمك…).
 *
 * `partner-site-palette.ts` قِيست لحالةٍ أخرى: نصٌّ **أبيض فوق تعبئة** باللون. الحالة
 * المعكوسة — اللون نصّاً فوق الأرضية — لم تُقَس قطّ، ولا يمكن أن تنجح بلوحةٍ ثابتة:
 * لون الشريك يختاره هو، والأرضية تختلف بين السمتين.
 *
 * فالحلّ يُحسب لا يُخمَّن: نُبقي الصبغة والتشبّع كما هما — فتبقى الهويّة — ونحرّك
 * الإضاءة نحو الأرضية المعاكسة درجةً درجة حتى تبلغ النسبة ٤٫٥.
 */

interface Hsl {
  h: number;
  s: number;
  l: number;
}

function hexToHsl(hex: string): Hsl | null {
  const m = /^#([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  const n = parseInt(m[1], 16);
  const r = ((n >> 16) & 255) / 255;
  const g = ((n >> 8) & 255) / 255;
  const b = (n & 255) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h = Math.round(h * 60);
    if (h < 0) h += 360;
  }
  const l = (max + min) / 2;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  return { h, s: s * 100, l: l * 100 };
}

/** HSL → RGB بالمعادلة القياسية (CSS Color 4 §7). */
function hslToRgb({ h, s, l }: Hsl): [number, number, number] {
  const S = s / 100;
  const L = l / 100;
  const c = (1 - Math.abs(2 * L - 1)) * S;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = L - c / 2;
  const [r, g, b] =
    h < 60 ? [c, x, 0] :
    h < 120 ? [x, c, 0] :
    h < 180 ? [0, c, x] :
    h < 240 ? [0, x, c] :
    h < 300 ? [x, 0, c] : [c, 0, x];
  return [(r + m) * 255, (g + m) * 255, (b + m) * 255];
}

function luminance([r, g, b]: [number, number, number]): number {
  const f = (v: number) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

function contrast(a: [number, number, number], b: [number, number, number]): number {
  const x = luminance(a) + 0.05;
  const y = luminance(b) + 0.05;
  return x > y ? x / y : y / x;
}

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/**
 * ثلاثيّ HSL للون الشريك بعد تعديل إضاءته حتى يبلغ `min` مقابل `bgHex`.
 * يرجع `null` لأي قيمة ليست ستّ خانات ست عشرية — فالقيمة المعطوبة لا تُخرج CSS مكسوراً.
 */
export function readableInkHsl(hex: string, bgHex: string, min = 4.5): string | null {
  const hsl = hexToHsl(hex);
  if (!hsl) return null;
  const bg = hexToRgb(bgHex);
  // الاتجاه: أرضية داكنة → نفتح اللون · أرضية فاتحة → نغمقه.
  const step = luminance(bg) < 0.5 ? 1 : -1;
  // الدوران على أعدادٍ صحيحة: القيمة المفحوصة هي القيمة المكتوبة نفسها. التقريب بعد
  // الفحص كان يُنزل النتيجة إلى ٤٫٤٩ — تحت الحدّ بمقدار لا يُرى ويُسقط الفحص.
  let l = Math.round(hsl.l);
  const s = Math.round(hsl.s);
  for (let i = 0; i <= 100; i++) {
    if (contrast(hslToRgb({ h: hsl.h, s, l }), bg) >= min) break;
    const next = l + step;
    if (next < 0 || next > 100) break;
    l = next;
  }
  return `${hsl.h} ${s}% ${l}%`;
}
