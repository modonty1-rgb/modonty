import { messages } from './ar';

// Zod error messages — use with .refine() and .superRefine()
export const validationMessages = {
  required: messages.error.required,
  invalidCredentials: messages.error.invalidCredentials,
  wrongPassword: messages.error.wrongPassword,
  minLength: (n: number) => `Must be at least ${n} characters`,
  maxLength: (n: number) => `Must not exceed ${n} characters`,
  min: (n: number) => `Must be at least ${n}`,
  max: (n: number) => `Must not exceed ${n}`,
} as const;

// Toast error handler — use in catch blocks
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    if (error.message.includes('credentials')) return messages.error.invalidCredentials;
    if (error.message.includes('password')) return messages.error.wrongPassword;
    if (error.message.includes('not found')) return messages.error.notFound;
    if (error.message.includes('unauthorized')) return messages.error.unauthorized;
    if (error.message.includes('conflict')) return messages.error.conflict;
  }
  return messages.error.serverError;
}
