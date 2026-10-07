import type { CommentStatus } from "@prisma/client";

export function clientFeedbackStatusMeta(status: CommentStatus) {
  if (status === "PENDING")
    return { label: "بانتظار المراجعة", classes: "bg-amber-50 text-amber-700 ring-amber-200" };
  if (status === "APPROVED")
    return { label: "معتمد", classes: "bg-emerald-50 text-emerald-700 ring-emerald-200" };
  if (status === "REJECTED")
    return { label: "مرفوض", classes: "bg-red-50 text-red-700 ring-red-200" };
  return { label: "محذوف", classes: "bg-slate-100 text-slate-600 ring-slate-200" };
}
