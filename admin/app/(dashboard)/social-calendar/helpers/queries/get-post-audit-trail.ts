import { db } from "@/lib/db";

export interface PostAuditRow {
  id: string;
  action: string;
  userName: string | null;
  userEmail: string;
  userRole: string | null;
  summary: string | null;
  createdAt: Date;
}

/** سجلّ التدقيق لهذا المنشور — مَن كتب ومَن نقل ومَن نشر (PRD §٤.٣د). */
export async function getPostAuditTrail(postId: string): Promise<PostAuditRow[]> {
  return db.auditLog.findMany({
    where: { entity: "SocialPost", entityId: postId },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: { id: true, action: true, userName: true, userEmail: true, userRole: true, summary: true, createdAt: true },
  });
}
