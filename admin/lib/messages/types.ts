import type { z } from 'zod';

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

// Toast descriptions
export type DescriptionKey =
  | 'article_save_error'
  | 'article_save_success'
  | 'articles_exported'
  | 'articles_export_failed'
  | 'article_no_data'
  | 'article_content_required'
  | 'categories_exported'
  | 'categories_export_failed'
  | 'tags_exported'
  | 'tags_export_failed'
  | 'industries_exported'
  | 'industries_export_failed'
  | 'jsonld_copied'
  | 'jsonld_copy_failed'
  | 'seo_preview_failed'
  | 'citations_extracted'
  | 'citations_error'
  | 'client_required'
  | 'media_copied'
  | 'media_copy_failed'
  | 'media_deleted'
  | 'media_delete_failed'
  | 'media_upload_error'
  | 'category_deleted'
  | 'category_delete_failed'
  | 'tag_deleted'
  | 'tag_delete_failed'
  | 'industry_deleted'
  | 'industry_delete_failed'
  | 'client_deleted'
  | 'client_delete_failed'
  | 'clients_exported'
  | 'clients_export_failed'
  | 'author_updated'
  | 'author_update_failed'
  | 'faq_created'
  | 'faq_updated'
  | 'faq_deleted'
  | 'faq_status_changed'
  | 'faq_create_failed'
  | 'faq_update_failed'
  | 'message_status_updated'
  | 'message_update_failed'
  | 'message_replied'
  | 'message_deleted'
  | 'media_metadata_updated'
  | 'media_verify_failed'
  | 'cloudinary_missing'
  | 'invalid_filename'
  | 'search_data_updated'
  | 'settings_load_failed'
  | 'upload_in_progress'
  | 'upload_complete'
  | 'upload_failed'
  | 'copy_to_clipboard_success'
  | 'copy_to_clipboard_failed'
  | 'file_format_error'
  | 'file_size_error'
  | 'tier_created'
  | 'tier_updated'
  | 'tier_deleted'
  | 'tier_create_failed'
  | 'tier_update_failed'
  | 'tier_delete_failed'
  | 'user_created'
  | 'user_updated'
  | 'user_deleted'
  | 'user_create_failed'
  | 'user_update_failed'
  | 'user_delete_failed'
  | 'password_changed'
  | 'password_change_failed'
  | 'validation_complete'
  | 'validation_failed'
  | 'copied_to_clipboard'
  | 'copy_failed'
  | 'id_copied'
  | 'unexpected_error'
  | 'save_error'
  | 'test_data_created'
  | 'test_data_failed'
  | 'database_check_required'
  | 'form_filled'
  | 'seo_fixes_applied'
  | 'seo_fixes_error'
  | 'seed_test_complete'
  | 'seed_test_failed'
  | 'database_backup_complete'
  | 'database_restore_complete';

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
  | 'subscriptionTier'
  | 'credentialsTitle'
  | 'businessType'
  | 'keywords'
  | 'languages'
  | 'parentCompany'
  | 'organizationType'
  | 'legalForm'
  | 'socialDescription'
  | 'twitterHandle'
  | 'gaTrackingId'
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

// Subscription Tiers hints
export type SubscriptionTierHintKey =
  | 'name'
  | 'description'
  | 'price'
  | 'features';

// Union of all hint keys
export type HintKey =
  | ArticleHintKey
  | AuthorHintKey
  | CategoryHintKey
  | TagHintKey
  | IndustryHintKey
  | ClientHintKey
  | UserHintKey
  | SettingHintKey
  | FaqHintKey
  | ContactMessageHintKey
  | SubscriptionTierHintKey;
