/**
 * القارئ الذي يفعل الفعل — بنفس الحقول التي تقرؤها أكشنات الويب من `session.user`.
 *
 * دوال `…As(actor, …)` تأخذه صريحاً بدل أن تقرأ `auth()` بنفسها، فيناديها غلاف الويب (من
 * الكوكي) ونقطة التطبيق (من Bearer) — منطق واحد، بابان. هذه الدوال **ليست** Server Actions
 * (لا `"use server"`): لو كانت، لصار أي متصفّح يناديها بمعرّف قارئ غيره.
 */
export interface ReaderActor {
  id: string;
  name: string | null;
  email: string | null;
}
