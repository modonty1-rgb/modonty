// Shared plain-English labels + colours + entity grouping for the audit log.
// Used by both the log table and the per-staff activity page so they never drift.

export const ACTION_LABEL: Record<string, string> = {
  "article.create": "Created article",
  "article.update": "Edited article",
  "article.delete": "Deleted article",
  "article.publish": "Published article",
  "article.transition": "Changed article stage",
  "article.schedule": "Scheduled article",
  "article.resetStatus": "Reset article status",
  "client.create": "Added client",
  "client.update": "Edited client",
  "client.delete": "Deleted client",
  "client.activate": "Activated client",
  "client.suspend": "Suspended client",
  "client.seo": "Edited client SEO",
  "client.logo": "Changed client logo",
  "client.hero": "Changed client cover",
  "client.verification": "Updated client verification",
  "client.slugChange": "Changed client link",
  "category.create": "Created category",
  "category.update": "Edited category",
  "category.delete": "Deleted category",
  "tag.create": "Created tag",
  "tag.update": "Edited tag",
  "tag.delete": "Deleted tag",
  "author.create": "Created author",
  "author.update": "Edited author",
  "author.delete": "Deleted author",
  "industry.create": "Created industry",
  "industry.update": "Edited industry",
  "industry.delete": "Deleted industry",
  "media.create": "Uploaded image",
  "media.update": "Edited image",
  "media.seo": "Edited image SEO",
  "media.delete": "Deleted image",
  "contactMessage.delete": "Deleted message",
  "user.create": "Added staff",
  "user.update": "Edited staff",
  "user.delete": "Removed staff",
  "invoice.create": "Issued invoice",
  "invoice.paid": "Marked invoice paid",
  "invoice.archive": "Archived invoice",
  "invoice.send": "Sent invoice",
  "settings.update": "Updated settings",
  "database.maintenance": "Ran maintenance",
  "seo.cascade": "Regenerated SEO",
};

export function friendlyAction(action: string): string {
  return ACTION_LABEL[action] ?? action.replace(/\./g, " ");
}

// Colour by consequence: red = deleted, amber = went public / archived, violet = touched
// everything, emerald = created/activated, blue = edited, slate = the rest.
export function actionTone(action: string): string {
  if (action === "invoice.paid") return "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300";
  if (action === "invoice.archive") return "bg-amber-500/15 text-amber-600 dark:text-amber-300";
  if (action === "invoice.create" || action === "invoice.send")
    return "bg-blue-500/15 text-blue-600 dark:text-blue-300";
  if (action === "client.activate") return "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300";
  if (action === "client.suspend") return "bg-red-500/15 text-red-600 dark:text-red-300";
  if (["client.seo", "client.logo", "client.hero", "client.verification", "client.slugChange", "media.seo"].includes(action))
    return "bg-blue-500/15 text-blue-600 dark:text-blue-300";
  if (action.endsWith(".delete")) return "bg-red-500/15 text-red-600 dark:text-red-300";
  if (/\.(publish|transition|schedule|resetStatus)$/.test(action))
    return "bg-amber-500/15 text-amber-600 dark:text-amber-300";
  if (action === "database.maintenance" || action === "seo.cascade")
    return "bg-violet-500/15 text-violet-600 dark:text-violet-300";
  if (action.endsWith(".create")) return "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300";
  if (action.endsWith(".update")) return "bg-blue-500/15 text-blue-600 dark:text-blue-300";
  return "bg-muted text-muted-foreground";
}

export interface CategoryMeta {
  key: string;
  label: string;
  /** Tailwind classes for the breakdown bar fill. */
  bar: string;
}

// Group the many entities into the handful of areas a person actually works in.
export function entityCategory(entity: string): CategoryMeta {
  switch (entity) {
    case "Article":
      return { key: "articles", label: "Articles", bar: "bg-blue-500" };
    case "Client":
      return { key: "clients", label: "Clients", bar: "bg-violet-500" };
    case "Media":
      return { key: "media", label: "Media", bar: "bg-cyan-500" };
    case "Invoice":
      return { key: "billing", label: "Billing", bar: "bg-emerald-500" };
    case "Category":
    case "Tag":
    case "Author":
    case "Industry":
      return { key: "reference", label: "Reference", bar: "bg-amber-500" };
    case "User":
    case "Staff":
      return { key: "staff", label: "Staff", bar: "bg-pink-500" };
    default:
      // Settings · Database · Seo · ContactMessage
      return { key: "system", label: "System", bar: "bg-slate-500" };
  }
}
