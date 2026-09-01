/**
 * ما يُقبل نصّاً لتعليق: بلا وسوم HTML، وبطول معقول.
 *
 * ── لماذا لا نهرّب هنا (٣١ أغسطس ٢٠٢٦) ────────────────────────────────
 * كانت هذه الدالّة تحوّل `<` و`>` و`"` و`'` و`/` إلى كياناتها HTML **قبل التخزين**.
 * وهذا خطأ في المكان لا في النيّة:
 *
 *  ① التعليق يُعرض `{comment.content}` داخل JSX، ورياكت يهرّب قيم JSX تلقائياً.
 *    فالهروب المخزَّن يُهرَّب مرّة ثانية عند العرض، فيرى الزائر `&quot;` نصّاً خاماً.
 *  ② `&` نفسه كان يُهرَّب في الدوالّ الشقيقة، فكل حفظ يضيف طبقة:
 *    `&quot;` ← `&amp;quot;` ← `&amp;amp;quot;`. قِيس على الإنتاج ٣١ أغسطس:
 *    ١٨ صفّاً في `faqs` و`client_faqs` وصلت إلى سبع طبقات.
 *  ③ النصّ نفسه يُرسَل إلى JSON-LD، وكيانات HTML لا معنى لها في JSON — تصل جوجل
 *    كما هي.
 *
 * الحماية الحقيقية عقدٌ في رياكت: الخطر محصور في `dangerouslySetInnerHTML`
 * («🔴 SECURITY HOLE: passing untrusted input» — توثيق react.dev الرسمي)، و`{value}`
 * آمن بالتعريف. فالتعليق يُعرض نصّاً في `{...}`، وهو ما تفعله كل مكوّناته.
 *
 * وما نمنعه هنا هو الوسم نفسه لا شكله: أي `<...>` يُحذف، فلا يصل النصّ إلى أي
 * مستهلك يحقنه HTMLاً حتى لو أُضيف واحدٌ لاحقاً.
 */
export function sanitizeComment(content: string): string {
  return content.trim().replace(/<[^>]*>/g, "");
}

export function validateCommentContent(content: string): { valid: boolean; error?: string } {
  if (!content || content.trim().length === 0) {
    return { valid: false, error: "Comment content is required" };
  }
  if (content.length > 1000) {
    return { valid: false, error: "Comment is too long (max 1000 characters)" };
  }
  return { valid: true };
}
