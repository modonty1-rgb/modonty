# FAQ Schema Migration Guide

## Overview

This guide explains how to apply the database schema changes for the complete FAQ feedback functionality.

## Schema Changes

1. **FAQ Model Updates:**
   - Added `downvoteCount` field (Int?, default 0)
   - Changed `upvoteCount` default to 0
   - Added `feedbacks` relation to FAQFeedback
   - Added indexes for `upvoteCount` and `downvoteCount`

2. **New FAQFeedback Model:**
   - Tracks individual feedback submissions
   - Prevents duplicate feedback via unique constraints
   - Supports both logged-in users and anonymous sessions
   - Tracks IP address and user agent

3. **User Model Updates:**
   - Added `faqFeedbacks` relation

## Migration Steps

### 1. Generate Prisma Client

```bash
cd dataLayer
npx prisma generate
```

### 2. Create Migration

```bash
cd dataLayer
npx prisma migrate dev --name add_faq_feedback
```

This will:
- Create a new migration file
- Apply the migration to your database
- Regenerate the Prisma client

### 3. Update Existing FAQs (Optional)

If you have existing FAQs with null `upvoteCount` values, you may want to set them to 0:

```javascript
// Run this in a script or MongoDB shell
db.general_faqs.updateMany(
  { upvoteCount: null },
  { $set: { upvoteCount: 0, downvoteCount: 0 } }
)
```

Or using Prisma:

```typescript
await db.fAQ.updateMany({
  where: {
    OR: [
      { upvoteCount: null },
      { downvoteCount: null },
    ],
  },
  data: {
    upvoteCount: 0,
    downvoteCount: 0,
  },
});
```

## Verification

After migration, verify:

1. ✅ FAQFeedback model exists in database
2. ✅ FAQ model has downvoteCount field
3. ✅ Unique constraints work (try submitting duplicate feedback)
4. ✅ Relations are properly set up
5. ✅ Indexes are created

## Rollback (if needed)

If you need to rollback:

```bash
cd dataLayer
npx prisma migrate resolve --rolled-back <migration_name>
```

Then manually remove:
- FAQFeedback collection
- downvoteCount field from FAQ model
- faqFeedbacks relation from User model

## Testing

After migration, test:

1. Submit helpful feedback - should increment upvoteCount
2. Submit not helpful feedback - should increment downvoteCount
3. Try duplicate feedback - should be prevented
4. Check feedback tracking for logged-in users
5. Check feedback tracking for anonymous users (via session)

## Notes

- The migration is non-destructive (adds new fields/collections)
- Existing FAQs will have upvoteCount: 0 and downvoteCount: 0
- No data loss will occur
- The FAQFeedback collection will be empty initially
