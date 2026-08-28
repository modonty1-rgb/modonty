/** How the platform is reached, and how it signs what it sends. */

// Official contact email (per project_prod_business_info_values — corrects legacy support@jbrseo.com).
export const CONTACT_EMAIL = "modonty@modonty.com";

// ترويسة «من» للبريد المعاملاتي. الاسم مكتوب هنا لا مقروءاً من `Settings`، وهو من
// «ثوابت البريد المشتركة» الباقية عمداً: قالب البريد يُبنى في سياقات لا قاعدةَ فيها
// (edge · قوالب مشتركة بين ثلاثة تطبيقات)، وجعلُه `async` يعدي على كل قالب في الثلاثة.
// كان يقرأ `BRAND_EN` الذي حُذف في ٢٨ أغسطس بعد سقوط آخر مستهلك له.
export const NOREPLY_FROM = "Modonty <no-reply@modonty.com>";
