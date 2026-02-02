/**
 * SEO validation utilities
 * Functions for validating SEO titles and descriptions
 */

export interface ValidationResult {
  valid: boolean;
  message?: string;
}

/**
 * Validate SEO title length and format
 */
export function validateSEOTitle(title: string): ValidationResult {
  if (!title) {
    return { valid: false, message: "عنوان SEO مطلوب" };
  }
  if (title.length > 60) {
    return {
      valid: false,
      message: `عنوان SEO طويل جداً (${title.length}/60 حرف). الأفضل 50-60 حرف.`,
    };
  }
  if (title.length < 30) {
    return {
      valid: true,
      message: `عنوان SEO قصير (${title.length} حرف). الأفضل 50-60 حرف.`,
    };
  }
  return { valid: true };
}

/**
 * Validate SEO description length
 */
export function validateSEODescription(description: string): ValidationResult {
  if (!description) {
    return { valid: false, message: "وصف SEO مطلوب" };
  }
  const length = description.length;
  if (length < 120) {
    return {
      valid: true,
      message: `وصف SEO قصير (${length} حرف). الأفضل 155-160 حرف.`,
    };
  }
  if (length > 160) {
    return {
      valid: false,
      message: `وصف SEO طويل جداً (${length}/160 حرف). الأفضل 155-160 حرف.`,
    };
  }
  if (length >= 155 && length <= 160) {
    return { valid: true, message: "ممتاز! طول الوصف مثالي." };
  }
  return { valid: true };
}
