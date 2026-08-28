/** Greetings, pleasantries, and meta identity questions — never out-of-scope. */
const GREETING_PATTERNS = [
  /^(hi|hello|hey|hiya|yo|sup|howdy)\s*!?$/i,
  /^(مرحبا?|أهلا|هلا|سلام|مرحبتين|السلام عليكم|أهلين)\s*!?$/i,
  /^(thanks?|thank you|شكرا|شكراً|مشكور|يعطيك العافية)\s*!?$/i,
  /^(ok|okay|تمام|حسنا)\s*!?$/i,
  /^(bye|goodbye|مع السلامة)\s*!?$/i,
  // Identity/meta questions — bot should answer these regardless of topic.
  //
  // الفصحى وحدها لا تكفي: الزائر السعودي والمصري يكتب «مين أنت» و«إنت مين» و«وش أنت»،
  // وهي أشيع من «من أنت». مقيس حيّاً ٢٨ أغسطس على مودو شات: «مين أنت؟» سقطت في مسار
  // البحث وأُجيبت «ما عندي جواب موثّق لسؤالك في محتوى العقارات» — سؤالٌ عن مودو نفسه
  // رُدَّ بأنه خارج المحتوى، بينما «من أنت؟» رجعت التعريف الصحيح.
  /^(من|مين|ما|إيش|ايش|وش|إنت|انت|إنتَ)\s*(أنت|انت|مين|هو)\s*[?؟!]*$/i,
  /^(what are you|who are you|who r u|whos this|who's this)\s*[?؟]?$/i,
  /^(ماذا تفعل|ما وظيفتك|كيف تعمل|وش تسوي|إيش تسوي|ايش تسوي|بتعمل إيه|تقدر تسوي إيش)\s*[?؟]?$/i,
  /^(what can you do|how do you work)\s*[?؟]?$/i,
];

export function isGreetingOrShortPleasantry(text: string): boolean {
  const t = text.trim();
  if (t.length < 3) return true;
  // أربع كلمات لا كلمتان: الحارس القديم (`<= 2`) كان يمنع أنماطه الإنجليزية نفسها من
  // العمل أصلاً — «who are you?» ثلاث كلمات و«what can you do» أربع، فلم يُطابَق أيٌّ
  // منهما يوماً رغم كتابته في القائمة (مقيس ٢٨ أغسطس ٢٠٢٦). والأنماط كلها مثبّتة
  // الطرفين (`^…$`)، فتوسيع الحدّ لا يلتقط سؤال محتوى: «أفضل استثمار عقاري الآن»
  // أربع كلمات ولا يطابق شيئاً.
  if (t.split(/\s+/).length <= 4 && t.length < 30) {
    return GREETING_PATTERNS.some((p) => p.test(t));
  }
  return false;
}
