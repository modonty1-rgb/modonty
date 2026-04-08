import type {
  SuccessKey,
  ErrorKey,
  ConfirmKey,
} from './types';

// ─── SUCCESS MESSAGES ───
const success: Record<SuccessKey, string> = {
  saved: 'Saved successfully',
  updated: 'Updated successfully',
  approved: 'Approved successfully',
  rejected: 'Rejected successfully',
  passwordChanged: 'Password changed successfully',
  copied: 'Copied to clipboard',
} as const;

// ─── ERROR MESSAGES ───
const error: Record<ErrorKey, string> = {
  invalidCredentials: 'Invalid email or password',
  wrongPassword: 'Current password is incorrect',
  notFound: 'This item not found',
  unauthorized: 'You are not authorized to perform this action',
  conflict: 'Data conflict occurred',
  serverError: 'Server error occurred. Try again later',
  required: 'This field is required',
  feedback_required: 'Feedback is required when requesting changes',
  answer_required: 'Enter reply text',
  reply_required: 'Reply text is required',
} as const;

// ─── CONFIRMATION MESSAGES ───
const confirm: Record<ConfirmKey, string> = {
  delete: 'Are you sure you want to delete? This cannot be undone',
  approve: 'Are you sure you want to approve this content?',
  reject: 'Are you sure you want to reject this content?',
  logout: 'Are you sure you want to log out?',
} as const;

// ─── EXPORT ───
export const messages = {
  success,
  error,
  confirm,
} as const;
