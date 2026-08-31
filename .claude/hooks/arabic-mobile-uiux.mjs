#!/usr/bin/env node
/**
 * بوّابة واجهة الموبايل العربية — تعمل بعد كل Edit/Write/MultiEdit على `console-mobile/src`.
 *
 * سببها: خالد (٢٩ أغسطس ٢٠٢٦) — «أنت ultra senior mobile UI/UX، خلّها قاعدة ذهبية وحطّ لها هوك
 * يمسك أي واجهة سيئة، التطبيق لناس عربية». القاعدة المكتوبة تُنسى؛ الهوك لا يُنسى.
 *
 * المصادر التي تُنفَّذ هنا حرفياً:
 *   documents/mobile/UIUX-RULES.md      — §١ اللمس ٤٨dp · §٢ اللون لا ينقل الحالة وحده ·
 *                                          §٣ سلّم المسافات · §٤ جدول الخطوط · §٧ أثر الضغط ·
 *                                          §٩ RTL والعربية · §١٠ صفر hex داخل ملفّ شاشة
 *   documents/mobile/ENGINEERING-RULES.md — §١ FlashList · §٣ expo-image · §٤ صفر هارد كود ·
 *                                          §٥ response.ok قبل json و«ممنوع catch {} صامت»
 *
 * الخرق الصلب يُعاد إلى النموذج بـ`decision: block` فيُصلَح فوراً.
 * والملاحظة اللينة تُعرض ولا توقف العمل — كي لا تصير البوّابة ضجيجاً يُتجاهل.
 */

import { readFileSync } from 'node:fs';

const SCOPE = /console-mobile[\\/]src[\\/].*\.tsx$/;
/** المكوّنات الأساسية هي التي تملك حقّ تعريف القيم؛ الشاشة تستهلك فقط. */
const PRIMITIVE = /console-mobile[\\/]src[\\/](theme|components[\\/]ui|components[\\/]brand)[\\/]/;

function readStdin() {
  try {
    return readFileSync(0, 'utf8');
  } catch {
    return '';
  }
}

/** يحذف التعليقات حتى لا يُبلَّغ عن نصّ عربي داخل شرحٍ مكتوب للمطوّر. */
function withoutComments(source) {
  return source.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' ')).replace(/^\s*\/\/.*$/gm, '');
}

const HARD = [
  {
    id: 'hex',
    test: /#[0-9a-fA-F]{6}\b/,
    message: 'قيمة لون مكتوبة داخل ملفّ شاشة. UIUX §١٠: صفر hex — اللون من `theme.colors` عبر `useAppTheme()`.',
  },
  {
    id: 'font-literal',
    test: /\b(fontSize|lineHeight)\s*:\s*\d/,
    message: 'حجم خطّ أو ارتفاع سطر برقم مباشر. UIUX §٤: الجدول نهائي — استعمل `typography.*` من `theme/tokens`.',
  },
  {
    id: 'spacing-literal',
    test: /\b(padding|paddingTop|paddingBottom|paddingStart|paddingEnd|paddingHorizontal|paddingVertical|margin|marginTop|marginBottom|marginStart|marginEnd|marginHorizontal|marginVertical|gap|rowGap|columnGap|borderRadius)\s*:\s*\d/,
    message: 'مسافة أو زاوية برقم مباشر. UIUX §٣: السلّم ٤·٨·١٢·١٦·٢٠·٢٤·٣٢ — استعمل `spacing.*` أو `radii.*`.',
  },
  {
    id: 'rn-text',
    test: /import\s*\{[^}]*\bText\b[^}]*\}\s*from\s*'react-native'/,
    message: '`Text` من react-native مباشرةً. استعمل `AppText` — هو الذي يثبّت `maxFontSizeMultiplier` من توكن واحد.',
  },
  {
    id: 'rn-image',
    test: /import\s*\{[^}]*\bImage\b[^}]*\}\s*from\s*'react-native'/,
    message: '`Image` من react-native. ENGINEERING §٣: `expo-image` حصراً — كاش على القرص وتلاشٍ وblurhash.',
  },
  {
    id: 'silent-catch',
    test: /catch\s*(\([^)]*\))?\s*\{\s*\}/,
    message: '`catch {}` صامت. ENGINEERING §٥: الخطأ المبتلَع يظهر للمستخدم شاشةً فارغة بلا سبب.',
  },
  {
    id: 'json-before-ok',
    test: /await\s+response\.json\(\)(?![\s\S]{0,400}response\.ok)/,
    checkFile: (source) => /await\s+response\.json\(\)/.test(source) && !/response\.ok/.test(source),
    message: '`response.json()` بلا فحص `response.ok`. ENGINEERING §٥: `fetch` لا يرمي على ٤٠٤ ولا ٥٠٠.',
  },
  {
    id: 'arabic-literal',
    // نصّ عربي مرئي داخل JSX أو داخل خاصيّة نصّية — لا داخل accessibilityLabel وحدها.
    test: /(>[^<>{}\n]*[ء-ي][^<>{}\n]*<|(?:placeholder|label|title|text|message)\s*=\s*["'][^"']*[ء-ي])/,
    message: 'نصّ عربي مرئي مكتوب داخل الشاشة. ENGINEERING §٤: كل نصّ يراه المستخدم مصدره الـAPI؛ والاحتياط المكتوب في الكود هو المخالفة نفسها.',
  },
];

/**
 * لا تُطابَق وسوم JSX بـ`[^>]*>`: خاصيّة مثل `style={({ pressed }) => …}` تحمل `>` داخل السهم،
 * فينقطع الوسم قبل الخاصيّة المبحوث عنها ويصير البلاغ كاذباً. تُقرأ نافذة بعد بداية الوسم بدلها.
 */
function tagWindows(source, tagNames, windowSize = 500) {
  const opener = new RegExp(`<(${tagNames.join('|')})\\b`, 'g');
  const windows = [];
  let match = opener.exec(source);
  while (match !== null) {
    windows.push(source.slice(match.index, match.index + windowSize));
    match = opener.exec(source);
  }
  return windows;
}

const SOFT = [
  {
    id: 'a11y-label',
    detect: (source) => tagWindows(source, ['Pressable', 'TouchableOpacity', 'TouchableHighlight'])
      .filter((window) => !/accessibilityLabel/.test(window)).length,
    message: 'عنصر قابل للضغط بلا `accessibilityLabel` بالعربي. UIUX §٩.',
  },
  {
    id: 'press-feedback',
    detect: (source) => tagWindows(source, ['Pressable', 'TouchableOpacity'])
      .filter((window) => !/(pressed|android_ripple|activeOpacity)/.test(window)).length,
    message: 'ضغطة بلا أثر مرئي. UIUX §٧: كل ضغطة لها استجابة خلال ١٠٠ms، والصمت يُقرأ عطلاً فيضغط المستخدم مرّتين.',
  },
  {
    id: 'ltr-row',
    detect: (source) => (source.match(/flexDirection\s*:\s*'row'/g) ?? []).length,
    message: "`flexDirection: 'row'` في تطبيق عربي. UIUX §٩: الصفّ يُقرأ من اليمين — `row-reverse` هو الافتراضي هنا.",
  },
  {
    id: 'list-in-scrollview',
    detect: (source) => (/<ScrollView/.test(source) && /\.map\(/.test(source) && !/FlashList/.test(source) ? 1 : 0),
    message: 'قائمة مرسومة بـ`.map` داخل `ScrollView`. ENGINEERING §١: `FlashList` لكل قائمة تتجاوز شاشة — وإلا بقي كل عنصر حيّاً في الذاكرة.',
  },
  {
    id: 'touch-target',
    detect: (source) => (/<(Pressable|TouchableOpacity)\b/.test(source) && !/minTouchTarget|minHeight|hitSlop/.test(source) ? 1 : 0),
    message: 'هدف لمس بلا ارتفاع أدنى. UIUX §١: ٤٨×٤٨dp غير قابل للتفاوض — `control.minTouchTarget`.',
  },
];

function lineOf(source, pattern) {
  const lines = source.split('\n');
  for (let index = 0; index < lines.length; index += 1) {
    if (pattern.test(lines[index])) return index + 1;
  }
  return null;
}

const raw = readStdin();
let filePath = '';
try {
  const payload = JSON.parse(raw);
  filePath = payload?.tool_response?.filePath ?? payload?.tool_input?.file_path ?? '';
} catch {
  process.exit(0);
}

if (!filePath || !SCOPE.test(filePath) || PRIMITIVE.test(filePath)) process.exit(0);

let source = '';
try {
  source = readFileSync(filePath, 'utf8');
} catch {
  process.exit(0);
}
const code = withoutComments(source);

const hard = [];
for (const rule of HARD) {
  const hit = rule.checkFile ? rule.checkFile(code) : rule.test.test(code);
  if (!hit) continue;
  const line = lineOf(code, rule.test);
  hard.push(`• ${rule.message}${line === null ? '' : ` — سطر ${line}`}`);
}

const soft = [];
for (const rule of SOFT) {
  const count = rule.detect(code);
  if (count > 0) soft.push(`• ${rule.message}${count > 1 ? ` (${count} موضعاً)` : ''}`);
}

if (hard.length === 0 && soft.length === 0) process.exit(0);

const name = filePath.split(/[\\/]/).pop();
const blocks = [];
if (hard.length > 0) blocks.push(`🚫 خرق واجهة عربية في ${name}:\n${hard.join('\n')}`);
if (soft.length > 0) blocks.push(`⚠️ ملاحظات UI/UX في ${name}:\n${soft.join('\n')}`);
const report = blocks.join('\n\n');

const output = hard.length > 0
  ? {
    decision: 'block',
    reason: `${report}\n\nأصلحها الآن قبل المتابعة. المصدر: documents/mobile/UIUX-RULES.md و ENGINEERING-RULES.md.`,
    systemMessage: `بوّابة الواجهة العربية: ${hard.length} خرقاً في ${name}`,
  }
  : {
    systemMessage: `بوّابة الواجهة العربية: ${soft.length} ملاحظة في ${name}`,
    hookSpecificOutput: { hookEventName: 'PostToolUse', additionalContext: report },
  };

process.stdout.write(JSON.stringify(output));
