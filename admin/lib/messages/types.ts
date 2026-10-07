

// Success toast messages
export type SuccessKey =
  | 'created'
  | 'updated'
  | 'deleted'
  | 'saved'
  | 'published'
  | 'archived'
  | 'restored'
  | 'copied'
  | 'uploaded'
  | 'sent'
  | 'read'
  | 'replied'
  | 'exported'
  | 'success';

// Error toast messages
export type ErrorKey =
  | 'required'
  | 'email'
  | 'url'
  | 'slug_exists'
  | 'unauthorized'
  | 'not_found'
  | 'conflict'
  | 'validation_failed'
  | 'server_error'
  | 'file_too_large'
  | 'invalid_file_type'
  | 'network_error'
  | 'permission_denied'
  | 'upload_failed'
  | 'delete_failed'
  | 'update_failed'
  | 'copy_failed'
  | 'export_failed'
  | 'cloudinary_missing'
  | 'invalid_filename'
  | 'operation_failed'
  | 'save_failed'
  | 'cannot_publish'
  | 'failed'
  | 'error';

// Confirmation messages
export type ConfirmKey =
  | 'delete'
  | 'unsaved_changes'
  | 'publish'
  | 'archive';

// ─── ENTITY HINT KEYS ─── (organized by entity)

// Articles form hints
export type ArticleHintKey =
  | 'title'
  | 'slug'
  | 'content'
  | 'metaTitle'
  | 'metaDescription'
  | 'focusKeyword'
  | 'wordCount'
  | 'images'
  | 'status'
  | 'authors'
  | 'category'
  | 'tags'
  | 'publishedAt';

// Authors form hints
export type AuthorHintKey =
  | 'name'
  | 'slug'
  | 'email'
  | 'bio'
  | 'avatar'
  | 'jobTitle'
  | 'expertiseAreas'
  | 'credentials'
  | 'memberOf'
  | 'metaTitle'
  | 'metaDescription';

// Categories form hints
export type CategoryHintKey =
  | 'name'
  | 'slug'
  | 'description'
  | 'icon'
  | 'metaTitle'
  | 'metaDescription'
  | 'metaKeywords';

// Tags form hints
export type TagHintKey =
  | 'name'
  | 'slug'
  | 'description'
  | 'metaTitle'
  | 'metaDescription';

// Industries form hints
export type IndustryHintKey =
  | 'name'
  | 'slug'
  | 'description'
  | 'metaTitle'
  | 'metaDescription';

// Clients form hints
export type ClientHintKey =
  | 'name'
  | 'slug'
  | 'phone'
  | 'email'
  | 'contactType'
  | 'parentOrganization'
  | 'businessBrief'
  | 'country'
  | 'region'
  | 'city'
  | 'latitude'
  | 'longitude'
  | 'postalCode'
  | 'tradeLicense'
  | 'taxId'
  | 'credentialsTitle'
  | 'businessType'
  | 'keywords'
  | 'languages'
  | 'parentCompany'
  | 'organizationType'
  | 'legalForm'
  | 'socialDescription'
  | 'twitterHandle'
  | 'canonical'
  | 'robots'
  | 'twitterCard'
  | 'paymentStatus';

// Users form hints
export type UserHintKey =
  | 'email'
  | 'name'
  | 'role'
  | 'password'
  | 'permissions';

// Settings form hints
export type SettingHintKey =
  | 'siteName'
  | 'siteUrl'
  | 'defaultSeoTitle'
  | 'defaultSeoDescription'
  | 'defaultLanguage';

// FAQ hints
export type FaqHintKey =
  | 'question'
  | 'answer'
  | 'category';

// Contact Messages hints
export type ContactMessageHintKey =
  | 'name'
  | 'email'
  | 'subject'
  | 'message';
