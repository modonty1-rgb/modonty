/** Greetings, pleasantries, and meta identity questions — never out-of-scope. */
const GREETING_PATTERNS = [
  /^(hi|hello|hey|hiya|yo|sup|howdy)\s*!?$/i,
  /^(مرحبا?|أهلا|هلا|سلام|مرحبتين|السلام عليكم|أهلين)\s*!?$/i,
  /^(thanks?|thank you|شكرا|شكراً|مشكور|يعطيك العافية)\s*!?$/i,
  /^(ok|okay|تمام|حسنا)\s*!?$/i,
  /^(bye|goodbye|مع السلامة)\s*!?$/i,
  // Identity/meta questions — bot should answer these regardless of topic
  /^(من أنت|ما أنت|من انت|ما انت|what are you|who are you)\s*[?؟]?$/i,
  /^(ماذا تفعل|ما وظيفتك|كيف تعمل|what can you do|how do you work)\s*[?؟]?$/i,
];

export function isGreetingOrShortPleasantry(text: string): boolean {
  const t = text.trim();
  if (t.length < 3) return true;
  if (t.split(/\s+/).length <= 2 && t.length < 25) {
    return GREETING_PATTERNS.some((p) => p.test(t));
  }
  return false;
}
