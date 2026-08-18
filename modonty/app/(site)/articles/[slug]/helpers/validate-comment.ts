/** ما يُقبل نصّاً لتعليق: منظَّف من الوسوم، وبطول معقول. */
export function sanitizeComment(content: string): string {
  const trimmed = content.trim();
  return trimmed
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
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
