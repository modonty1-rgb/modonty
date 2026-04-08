import { messages } from './ar';

// Zod error messages — use with .refine() and .superRefine()
export const validationMessages = {
  required: messages.error.required,
  email: messages.error.email,
  url: messages.error.url,
  slug_exists: messages.error.slug_exists,
  minLength: (n: number) => `يجب أن لا يقل عن ${n} أحرف`,
  maxLength: (n: number) => `يجب ألا يزيد عن ${n} حرف`,
  min: (n: number) => `يجب أن يكون ${n} على الأقل`,
  max: (n: number) => `يجب ألا يزيد عن ${n}`,
} as const;

// Toast error handler — use in catch blocks
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    if (error.message.includes('slug')) return messages.error.slug_exists;
    if (error.message.includes('unique')) return messages.error.conflict;
    if (error.message.includes('not found')) return messages.error.not_found;
    if (error.message.includes('unauthorized')) return messages.error.unauthorized;
    if (error.message.includes('permission')) return messages.error.permission_denied;
    if (error.message.includes('upload')) return messages.error.upload_failed;
    if (error.message.includes('delete')) return messages.error.delete_failed;
  }
  return messages.error.server_error;
}
