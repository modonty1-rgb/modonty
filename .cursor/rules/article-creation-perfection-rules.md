# Article Creation Perfection Rules (Temporary)

## 🎯 Objective
Perfect the article creation flow before moving to article updates. Focus on validation, UX, error handling, and data integrity.

---

## 📋 Current Architecture

### File Structure
```
admin/app/(dashboard)/articles/
├── new/page.tsx                    # Entry point for new article
├── components/
│   ├── article-form-context.tsx   # Main form state management
│   ├── article-form-sections.tsx  # Section accordion container
│   ├── article-form-store.ts      # Zustand store for persistence
│   ├── sections/
│   │   ├── basic-section.tsx      # Title, slug, excerpt, client, category, tags
│   │   ├── content-section.tsx     # Rich text editor + stats
│   │   ├── seo-section.tsx         # SEO fields + preview
│   │   ├── media-section.tsx       # Featured image + gallery
│   │   ├── tags-faq-section.tsx   # Tags + FAQs
│   │   └── seo-validation-section.tsx # Validation results
│   └── sticky-save-button.tsx     # Save button
└── actions/
    └── articles-actions.ts        # createArticle() server action
```

### Data Flow
1. **Page Load**: `new/page.tsx` → Fetches clients, categories, authors, tags
2. **Form Provider**: `ArticleFormProvider` initializes form state
3. **Sections**: Accordion-based sections with status indicators
4. **Auto-fill**: Multiple `useEffect` hooks auto-generate slug, SEO fields
5. **Save**: `createArticle()` server action validates and saves to DB
6. **Status**: Always creates with `WRITING` status

---

## ✅ Required Improvements

### 1. Validation Rules (MANDATORY)

#### Pre-Save Validation
- [ ] **Title**: Required, 10-100 characters, no special chars at start/end
- [ ] **Slug**: Required, unique per client, valid URL format, auto-generated from title
- [ ] **Client**: Required, must exist in DB
- [ ] **Content**: Required, minimum 100 words for quality
- [ ] **SEO Title**: 50-60 characters (optimal), max 60
- [ ] **SEO Description**: 150-160 characters (optimal), max 160
- [ ] **Canonical URL**: Valid URL format, unique per article

#### Real-time Validation
- [ ] Show validation errors inline (red border + error message)
- [ ] Character counters for title (50-60), excerpt (150-160), SEO fields
- [ ] SEO preview card updates in real-time
- [ ] Section status indicators (completed/error/empty)

#### Server-side Validation
- [ ] Validate all required fields before DB insert
- [ ] Check slug uniqueness per client
- [ ] Validate client/category/author existence
- [ ] Return specific error messages per field

### 2. User Experience (UX)

#### Form Flow
- [ ] **Progressive Disclosure**: Sections expand as user completes previous ones
- [ ] **Save State**: Auto-save draft every 30 seconds (debounced)
- [ ] **Unsaved Changes**: Warn before leaving page with unsaved changes
- [ ] **Loading States**: Show loading spinner during save
- [ ] **Success Feedback**: Toast notification on successful save
- [ ] **Error Feedback**: Clear error messages with actionable fixes

#### Visual Feedback
- [ ] **Section Status**: Green checkmark (complete), Yellow (incomplete), Red (errors)
- [ ] **Progress Indicator**: Show completion percentage (e.g., "4/6 sections complete")
- [ ] **Field Hints**: Helpful hints below each field (e.g., "50-60 characters for SEO")
- [ ] **Character Counters**: Visual indicators for optimal length

#### Accessibility
- [ ] All form fields have proper labels
- [ ] Error messages are announced to screen readers
- [ ] Keyboard navigation works through all sections
- [ ] Focus management on save/error

### 3. Data Integrity

#### Auto-generation Rules
- [ ] **Slug**: Auto-generate from title, sanitize, ensure uniqueness
- [ ] **SEO Title**: Auto-generate from title + client name (if available)
- [ ] **SEO Description**: Auto-generate from excerpt (first 160 chars)
- [ ] **Canonical URL**: Auto-generate from slug + client slug
- [ ] **OG Fields**: Auto-fill from SEO fields if empty
- [ ] **Twitter Fields**: Auto-fill from OG fields if empty

#### Default Values
- [ ] **Status**: Always `WRITING` for new articles
- [ ] **Author**: Always Modonty author (singleton)
- [ ] **Meta Robots**: `index, follow` for published, `noindex, follow` for drafts
- [ ] **Content Format**: `rich_text` (default)
- [ ] **Language**: `ar` (Arabic)
- [ ] **Sitemap Priority**: 0.5 (default), 0.8 if featured

#### Computed Fields
- [ ] **Word Count**: Calculate from content
- [ ] **Reading Time**: Calculate from word count (avg 200 words/min)
- [ ] **Content Depth**: `short` (<300), `medium` (300-1000), `long` (>1000)
- [ ] **Breadcrumb Path**: Generate from category + title

### 4. Error Handling

#### Client-side Errors
- [ ] **Validation Errors**: Show inline with field
- [ ] **Network Errors**: Show toast with retry option
- [ ] **Save Errors**: Show specific error message, preserve form data
- [ ] **Auto-save Errors**: Log silently, retry on next change

#### Server-side Errors
- [ ] **Database Errors**: Return user-friendly messages
- [ ] **Validation Errors**: Return field-specific errors
- [ ] **Slug Conflicts**: Suggest alternative slug
- [ ] **Missing Dependencies**: Clear error (e.g., "Modonty author not found")

### 5. Performance

#### Optimization
- [ ] **Debounced Auto-save**: Save only after 2s of inactivity
- [ ] **Memoized Calculations**: Word count, reading time, SEO validation
- [ ] **Lazy Loading**: Load sections on demand (accordion)
- [ ] **Optimistic Updates**: Show success immediately, sync in background

#### Data Fetching
- [ ] **Parallel Loading**: Fetch clients, categories, authors, tags in parallel
- [ ] **Caching**: Cache dropdown data (clients, categories, tags)
- [ ] **Error Boundaries**: Graceful fallback if data fetch fails

---

## 🚨 Critical Rules (NEVER BREAK)

### Production Safety
1. **Never** modify existing article update flow (focus on creation only)
2. **Never** change database schema without migration
3. **Never** remove existing validation (only add/improve)
4. **Never** break backward compatibility with existing articles
5. **Never** run `dev`/`build`/`start` without explicit confirmation

### Code Quality
1. **Strict TypeScript**: No `any`, no `unknown`, proper types
2. **Error Handling**: All async operations wrapped in try/catch
3. **Validation**: Client-side + server-side validation
4. **Accessibility**: ARIA labels, keyboard navigation
5. **Responsive**: Mobile + desktop layouts

### Form Behavior
1. **Auto-save**: Save draft every 30s (debounced)
2. **Unsaved Warning**: Warn before leaving with unsaved changes
3. **Status**: Always create with `WRITING` status
4. **Author**: Always use Modonty author (singleton)
5. **Slug**: Auto-generate, ensure uniqueness per client

---

## 📝 Implementation Checklist

### Phase 1: Validation
- [ ] Add client-side validation for all required fields
- [ ] Add real-time validation feedback (red borders, error messages)
- [ ] Add server-side validation in `createArticle()`
- [ ] Add slug uniqueness check per client
- [ ] Add character counters with optimal ranges

### Phase 2: UX Improvements
- [ ] Add auto-save functionality (debounced, every 30s)
- [ ] Add unsaved changes warning
- [ ] Add progress indicator (sections complete)
- [ ] Add success/error toast notifications
- [ ] Add loading states for save operations

### Phase 3: Data Integrity
- [ ] Ensure all auto-generation rules work correctly
- [ ] Add default values for all optional fields
- [ ] Add computed fields (word count, reading time, content depth)
- [ ] Add breadcrumb path generation

### Phase 4: Error Handling
- [ ] Add comprehensive error messages
- [ ] Add retry mechanisms for failed saves
- [ ] Add error boundaries for data fetching
- [ ] Add user-friendly error messages

### Phase 5: Performance
- [ ] Optimize auto-save (debouncing)
- [ ] Memoize expensive calculations
- [ ] Add lazy loading for sections
- [ ] Optimize data fetching (parallel, caching)

---

## 🔍 Testing Requirements

### Manual Testing
- [ ] Create article with all fields filled
- [ ] Create article with minimal fields (required only)
- [ ] Test validation errors (empty title, invalid slug, etc.)
- [ ] Test auto-save functionality
- [ ] Test unsaved changes warning
- [ ] Test slug uniqueness validation
- [ ] Test SEO field auto-generation
- [ ] Test error handling (network errors, DB errors)

### Edge Cases
- [ ] Very long title (>100 chars)
- [ ] Special characters in title/slug
- [ ] Duplicate slug (same client)
- [ ] Missing client/category/author
- [ ] Network failure during save
- [ ] Browser refresh with unsaved changes

---

## 📚 Reference Files

### Key Files to Review
- `admin/app/(dashboard)/articles/new/page.tsx` - Entry point
- `admin/app/(dashboard)/articles/components/article-form-context.tsx` - State management
- `admin/app/(dashboard)/articles/components/article-form-sections.tsx` - Section container
- `admin/app/(dashboard)/articles/components/sections/basic-section.tsx` - Basic fields
- `admin/app/(dashboard)/articles/components/sections/content-section.tsx` - Content editor
- `admin/app/(dashboard)/articles/components/sections/seo-section.tsx` - SEO fields
- `admin/app/(dashboard)/articles/actions/articles-actions.ts` - Server action
- `admin/app/(dashboard)/articles/helpers/section-status.ts` - Status logic
- `admin/lib/types/form-types.ts` - Type definitions

### Helper Functions
- `admin/app/(dashboard)/articles/helpers/seo-helpers.ts` - SEO utilities
- `admin/app/(dashboard)/articles/helpers/article-seo-config.ts` - SEO config

---

## 🎯 Success Criteria

### Article Creation is "Perfect" When:
1. ✅ All validation works (client + server)
2. ✅ User gets clear feedback at every step
3. ✅ Auto-save prevents data loss
4. ✅ All required fields are clearly marked
5. ✅ SEO fields auto-generate correctly
6. ✅ Error messages are actionable
7. ✅ Form is accessible (keyboard, screen readers)
8. ✅ Performance is smooth (no lag, fast saves)
9. ✅ Mobile experience is excellent
10. ✅ All edge cases are handled gracefully

---

## ⚠️ Notes

- This is a **temporary rule file** for perfecting article creation
- Focus **ONLY** on creation flow, not update flow
- Once creation is perfect, we'll move to article updates
- Follow all production safety rules from `nextjs.yml`
- Keep changes minimal and surgical
- Test thoroughly before marking complete

---

**Last Updated**: 2025-01-27
**Status**: Active - Article Creation Focus