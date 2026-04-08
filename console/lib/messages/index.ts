export { messages } from './ar';
export type {
  SuccessKey,
  ErrorKey,
  ConfirmKey,
} from './types';

import { messages } from './ar';
import type {
  SuccessKey,
  ErrorKey,
  ConfirmKey,
} from './types';

// Helper functions for convenience
export function getSuccessMessage(key: SuccessKey): string {
  return messages.success[key];
}

export function getErrorMessage(key: ErrorKey): string {
  return messages.error[key];
}

export function getConfirmMessage(key: ConfirmKey): string {
  return messages.confirm[key];
}
