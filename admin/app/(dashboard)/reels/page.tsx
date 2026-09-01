import { redirect } from "next/navigation";

// `/reels` صار عنوان القسم لا عنوان شاشة. الطابور هو ما يُفتح أوّلاً لأنه الوحيد
// الذي ينتظر قراراً — والباقي سجلّ يُراجَع عند الحاجة.
//
// `redirect` لا `rewrite`: العنوان في شريط المتصفّح يجب أن يقول أيّ حالة يرى المستخدم،
// وإلا نسخ رابطاً لا يفتح ما نسخه.
export default function ReelsIndexPage() {
  redirect("/reels/pending");
}
