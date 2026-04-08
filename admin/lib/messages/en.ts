import type {
  SuccessKey,
  ErrorKey,
  ConfirmKey,
  ArticleHintKey,
  AuthorHintKey,
  CategoryHintKey,
  TagHintKey,
  IndustryHintKey,
  ClientHintKey,
  UserHintKey,
  SettingHintKey,
  FaqHintKey,
  ContactMessageHintKey,
  SubscriptionTierHintKey,
} from './types';

// ─── SUCCESS MESSAGES ───
const success: Record<SuccessKey, string> = {
  created: 'Created successfully',
  updated: 'Updated successfully',
  deleted: 'Deleted successfully',
  saved: 'Saved successfully',
  published: 'Published successfully',
  archived: 'Archived successfully',
  restored: 'Restored successfully',
  copied: 'Copied to clipboard',
  uploaded: 'Uploaded successfully',
  sent: 'Sent successfully',
  read: 'Read',
  replied: 'Replied',
  exported: 'Exported',
  success: 'Success',
} as const;

// ─── ERROR MESSAGES ───
const error: Record<ErrorKey, string> = {
  required: 'This field is required',
  email: 'Invalid email address',
  url: 'Invalid URL',
  slug_exists: 'This slug is already in use',
  unauthorized: 'No permission to perform this action — login required',
  not_found: 'Resource not found',
  conflict: 'Data conflict — try again',
  validation_failed: 'Check data before proceeding',
  server_error: 'Server error occurred. Try again later',
  file_too_large: 'File is too large — maximum 5 MB',
  invalid_file_type: 'File type not supported',
  network_error: 'Connection error — check internet',
  permission_denied: 'You do not have permission to perform this action',
  upload_failed: 'Upload failed',
  delete_failed: 'Delete failed',
  update_failed: 'Update failed',
  copy_failed: 'Copy failed',
  export_failed: 'Export failed',
  cloudinary_missing: 'Cloudinary settings missing',
  invalid_filename: 'Generated filename is invalid',
  operation_failed: 'Operation failed',
  save_failed: 'Save failed',
  failed: 'Failed',
  error: 'Error',
} as const;

// ─── CONFIRMATION MESSAGES ───
const confirm: Record<ConfirmKey, string> = {
  delete: 'Are you sure you want to delete? This cannot be undone',
  unsaved_changes: 'You have unsaved changes. Do you want to continue?',
  publish: 'Are you sure you want to publish this content?',
  archive: 'Are you sure you want to archive this item?',
} as const;

// ─── TOAST DESCRIPTIONS ───
const descriptions = {
  // Articles
  article_save_error: 'Error saving article',
  article_save_success: 'Article saved successfully and pending admin review',
  articles_exported: 'Articles exported successfully',
  articles_export_failed: 'Failed to export articles',
  article_no_data: 'No data to export',
  article_content_required: 'Please add content to the article first',

  // Categories, Tags, Industries (export)
  categories_exported: 'Categories exported successfully',
  categories_export_failed: 'Failed to export categories',
  tags_exported: 'Tags exported successfully',
  tags_export_failed: 'Failed to export tags',
  industries_exported: 'Industries exported successfully',
  industries_export_failed: 'Failed to export industries',

  // JSON-LD & SEO
  jsonld_copied: 'JSON-LD copied',
  jsonld_copy_failed: 'Copy failed',
  seo_preview_failed: 'Failed to preview fixes',
  citations_extracted: 'Trusted sources added',
  citations_error: 'Error extracting links',
  client_required: 'Please select a client first to ensure backlinks are tracked correctly',

  // Media
  media_copied: 'Image link copied',
  media_copy_failed: 'Failed to copy link',
  media_deleted: 'File deleted',
  media_delete_failed: 'Failed to delete file',
  media_upload_error: 'Upload to Cloudinary failed',

  // Categories, Tags, Industries
  category_deleted: 'Category deleted',
  category_delete_failed: 'Failed to delete category',
  tag_deleted: 'Tag deleted',
  tag_delete_failed: 'Failed to delete tag',
  industry_deleted: 'Industry deleted',
  industry_delete_failed: 'Failed to delete industry',

  // Clients
  client_deleted: 'Client deleted',
  client_delete_failed: 'Failed to delete client',
  clients_exported: 'Clients exported successfully',
  clients_export_failed: 'Failed to export clients',

  // Authors
  author_updated: 'Author updated successfully',
  author_update_failed: 'Failed to update author',

  // FAQ & Contact
  faq_created: 'FAQ created successfully',
  faq_updated: 'FAQ updated successfully',
  faq_deleted: 'FAQ deleted',
  faq_status_changed: 'FAQ status changed',
  faq_create_failed: 'Failed to create FAQ',
  faq_update_failed: 'Failed to update FAQ',
  message_status_updated: 'Message status updated',
  message_update_failed: 'Failed to update message status',
  message_replied: 'Message marked as replied',
  message_deleted: 'Message deleted successfully',

  // Media Upload
  upload_in_progress: 'Uploading...',
  upload_complete: 'Upload completed',
  upload_failed: 'Upload failed',
  copy_to_clipboard_success: 'Copied to clipboard',
  copy_to_clipboard_failed: 'Failed to copy to clipboard',
  file_format_error: 'File format not supported',
  file_size_error: 'File size is too large',

  // Subscription Tiers
  tier_created: 'Subscription plan created successfully',
  tier_updated: 'Subscription plan updated successfully',
  tier_deleted: 'Subscription plan deleted successfully',
  tier_create_failed: 'Failed to create subscription plan',
  tier_update_failed: 'Failed to update subscription plan',
  tier_delete_failed: 'Failed to delete subscription plan',

  // Users
  user_created: 'User created successfully',
  user_updated: 'User updated successfully',
  user_deleted: 'User deleted successfully',
  user_create_failed: 'Failed to create user',
  user_update_failed: 'Failed to update user',
  user_delete_failed: 'Failed to delete user',
  password_changed: 'Password changed successfully',
  password_change_failed: 'Failed to change password',

  // Media Management
  media_metadata_updated: 'File metadata updated successfully',
  media_verify_failed: 'Failed to verify file usage',
  cloudinary_missing: 'Cloudinary settings missing',
  invalid_filename: 'Generated filename is invalid',

  // Validation & Copy
  validation_complete: 'Validation successful',
  validation_failed: 'Validation failed',
  copied_to_clipboard: 'Copied to clipboard',
  copy_failed: 'Copy failed',
  id_copied: 'ID copied successfully',
  search_data_updated: 'Search data updated',

  // Settings
  settings_load_failed: 'Failed to load settings',

  // Generic
  unexpected_error: 'Unexpected error occurred',
  save_error: 'Error saving. Try again',
  test_data_created: 'Test data created successfully',
  test_data_failed: 'Failed to create test data',
  database_check_required: 'Please ensure clients, categories, and authors exist in the database',
  form_filled: 'Form filled with generated content successfully',
  seo_fixes_applied: 'Issues fixed',
  seo_fixes_error: 'Error applying fixes',
  seed_test_complete: 'Test completed successfully',
  seed_test_failed: 'Test failed. Please check inputs and try again',
  database_backup_complete: 'Backup completed',
  database_restore_complete: 'Database restored',
} as const;

// ─── FORM HINTS (ORGANIZED BY ENTITY) ───
const hints = {
  article: {
    title: 'Article title — appears in search results',
    slug: 'URL slug — affects SEO',
    content: 'Main article content',
    metaTitle: 'Search engine title — 50-60 characters',
    metaDescription: 'Summary description — 150-160 characters',
    focusKeyword: 'Target keyword',
    wordCount: 'Total word count',
    images: 'Article images',
    status: 'Article status — draft or published',
    authors: 'One or more authors',
    category: 'Article category',
    tags: 'Related tags',
    publishedAt: 'Publication date',
  } satisfies Record<ArticleHintKey, string>,

  author: {
    name: 'Author full name',
    slug: 'Unique URL slug',
    email: 'Contact email',
    bio: 'Brief author bio',
    avatar: 'Author image',
    jobTitle: 'Example: Content platform, digital publisher',
    expertiseAreas: 'Comma-separated',
    credentials: 'Each credential on new line',
    memberOf: 'Comma-separated',
    metaTitle: 'Title that appears in Google — 30-60 characters',
    metaDescription: 'Description in search results — 120-160 characters',
  } satisfies Record<AuthorHintKey, string>,

  category: {
    name: 'Unique category name',
    slug: 'URL slug — auto-generated',
    description: 'Category description',
    icon: 'Category icon',
    metaTitle: 'Title that appears in Google — 50-60 characters',
    metaDescription: 'Description in search results — 150-160 characters',
    metaKeywords: 'Used in SEO — recommended 50+ characters',
  } satisfies Record<CategoryHintKey, string>,

  tag: {
    name: 'Unique tag name',
    slug: 'URL slug — auto-generated',
    description: 'Tag description',
  } satisfies Record<TagHintKey, string>,

  industry: {
    name: 'Industry name',
    slug: 'URL slug — auto-generated',
    description: 'Industry description',
  } satisfies Record<IndustryHintKey, string>,

  client: {
    name: 'Appears in articles and published content',
    slug: 'Auto-generated from name — used in page URLs',
    phone: 'Primary contact phone number',
    email: 'Appears in contact data and Schema.org',
    contactType: 'Contact type in Schema.org ContactPoint',
    parentOrganization: 'If client is a branch of another company — leave empty if independent',
    businessBrief: 'Company tagline — appears in SEO data — max 100 characters',
    country: 'Main headquarters country',
    region: 'Used in Schema.org to define service area',
    city: 'Appears in address data — Schema.org',
    latitude: 'Map coordinates — Schema.org GeoCoordinates',
    longitude: 'Map coordinates — Schema.org GeoCoordinates',
    postalCode: 'Postal code — mandatory from 2026',
    tradeLicense: 'Commercial registration number — optional',
    taxId: 'Tax registration number from tax authority — 15 digits',
    subscriptionTier: 'Current subscription plan',
    credentialsTitle: 'Client login data',
    businessType: 'Helps writers customize content and style',
    keywords: 'Keywords for writers — comma-separated',
    languages: 'Communication languages — appear in SEO data',
    parentCompany: 'Optional — if client is a branch of another company',
    organizationType: 'Organization type in SEO — differs from legal form',
    legalForm: 'Company legal form — differs from organization type',
    socialDescription: 'Organization description in Schema.org — 100+ characters recommended',
    twitterHandle: 'Official X/Twitter account for client',
    gaTrackingId: 'Optional — only if client wants separate tracking',
    canonical: 'Prevents duplicate content — specifies original page',
    robots: 'Controls search engine indexing for this client',
    twitterCard: 'Content format when shared on X/Twitter',
    paymentStatus: 'Payment status for subscription',
  } satisfies Record<ClientHintKey, string>,

  user: {
    email: 'Unique email address',
    name: 'User full name',
    role: 'User role — admin or editor',
    password: 'Strong password — letters and numbers',
    permissions: 'Allowed permissions',
  } satisfies Record<UserHintKey, string>,

  settings: {
    siteName: 'Site name',
    siteUrl: 'Base URL',
    defaultSeoTitle: 'Default SEO title',
    defaultSeoDescription: 'Default SEO description',
    defaultLanguage: 'Default language',
  } satisfies Record<SettingHintKey, string>,

  faq: {
    question: 'Frequently asked question',
    answer: 'Detailed answer',
    category: 'Question category',
  } satisfies Record<FaqHintKey, string>,

  contactMessage: {
    name: 'Sender name',
    email: 'Sender email',
    subject: 'Message subject',
    message: 'Message content',
  } satisfies Record<ContactMessageHintKey, string>,

  subscriptionTier: {
    name: 'Plan name',
    description: 'Plan description',
    price: 'Plan price',
    features: 'Included features',
  } satisfies Record<SubscriptionTierHintKey, string>,
} as const;

// ─── EXPORT ───
export const messages = {
  success,
  error,
  confirm,
  descriptions,
  hints,
} as const;
