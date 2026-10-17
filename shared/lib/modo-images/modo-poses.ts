/**
 * Modo's official images — the poses, their meaning, and how they are read from `Settings.modoImages`.
 *
 * Khalid, 17 Oct 2026: Modo is one of the core client's («مدونتي») assets, uploaded through the admin's
 * media procedure — «ما في هارد كودد نهائي». So this file holds NO url: only the pose names the admin
 * fills (/modonty/modo) and the site and the mobile apps read.
 *
 * Plain module — no `server-only`: the admin form, the site and the mobile API all import it.
 */

export const MODO_POSES = [
  { key: "avatar", label: "الأفاتار (رأس وكتفين على كحلي)", use: "صورة مودو الافتراضية: الأزرار، بطاقات «اسأل مودو»، رأس المحادثة" },
  { key: "wave", label: "يلوّح", use: "الترحيب وأول رد في المحادثة" },
  { key: "front", label: "واقف مبتسم", use: "رد عادي" },
  { key: "thinking", label: "يفكّر", use: "أثناء ما يكتب الجواب" },
  { key: "point", label: "يشير بيده", use: "رد فيه شركاء أو مصادر يدلّك عليها" },
  { key: "thumbs", label: "إبهام", use: "رد عادي" },
  { key: "reading", label: "يقرأ", use: "رد مبني على مقال" },
  { key: "surprised", label: "متفاجئ", use: "ما لقى جواب يضمنه" },
  { key: "phone", label: "يمسك جوال", use: "الدعوة لتجربة مودو" },
  { key: "laptop", label: "على لابتوب", use: "حالات العمل والبحث" },
  { key: "original", label: "الأصلية (العدسة المكبّرة)", use: "الهوية الرسمية — الحملات والسوشيال" },
] as const;

export type ModoPose = (typeof MODO_POSES)[number]["key"];
export type ModoImages = Partial<Record<ModoPose, string>>;
