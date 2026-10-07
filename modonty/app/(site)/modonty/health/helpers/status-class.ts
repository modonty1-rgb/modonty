// «معتمد» good news; a refusal, suspension or withdrawal must stand out.
export const statusClass = (s = "") => (s === "معتمد" ? "text-primary" : /رفض|سحب|تعليق/.test(s) ? "text-destructive" : "text-foreground/80");
