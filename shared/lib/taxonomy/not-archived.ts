/**
 * شرط «غير مؤرشف» للتصنيف والوسم والصناعة — مصدر واحد لكل قراءة حيّة (الموقع · السايت ماب ·
 * llms.txt · مودو · اختيارات الأدمن والكونسول). المؤرشف مخفيّ من الموقع ورابطه 410 (خالد ١٦ أكتوبر ٢٠٢٦).
 *
 * بذراعين لأن الحقل جديد: الصفوف القديمة ما فيها `archivedAt` أصلاً، والحقل الغائب على مونجو
 * لا يطابق `null` — النسخة أحادية الذراع كانت ستُخفي كل التصنيفات الموجودة.
 */
export const NOT_ARCHIVED: { OR: ({ archivedAt: null } | { archivedAt: { isSet: boolean } })[] } = {
  OR: [{ archivedAt: null }, { archivedAt: { isSet: false } }],
};

/** عكسه: مؤرشف فعلاً — الحقل موجود وفيه تاريخ. لصفحة الحذف (System ← Deletion). */
export const IS_ARCHIVED: { AND: ({ archivedAt: { isSet: boolean } } | { archivedAt: { not: null } })[] } = {
  AND: [{ archivedAt: { isSet: true } }, { archivedAt: { not: null } }],
};
