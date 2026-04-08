// Success toast messages
export type SuccessKey =
  | 'saved'
  | 'updated'
  | 'approved'
  | 'rejected'
  | 'passwordChanged'
  | 'copied';

// Error toast messages
export type ErrorKey =
  | 'invalidCredentials'
  | 'wrongPassword'
  | 'notFound'
  | 'unauthorized'
  | 'conflict'
  | 'serverError'
  | 'required'
  | 'feedback_required'
  | 'answer_required'
  | 'reply_required';

// Confirmation messages
export type ConfirmKey = 'delete' | 'approve' | 'reject' | 'logout';
