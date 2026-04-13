# FAQ Counters Showing Zero - Troubleshooting Guide

## Problem
The FAQ page shows counters as 0 even when there should be feedback counts from the database.

## Root Causes

### 1. Database Schema Not Pushed
The `downvoteCount` field and `FAQFeedback` model don't exist in the database yet.

**Solution:**
```bash
cd dataLayer
npx prisma db push
```

This will:
- Add `downvoteCount` field to existing FAQs
- Create `faq_feedback` collection
- Set default values (upvoteCount: 0, downvoteCount: 0)

### 2. Existing FAQs Have Null Values
Existing FAQs might have `null` for `upvoteCount` or `downvoteCount`.

**Solution:**
After pushing the schema, run this script to update existing FAQs:

```typescript
// In a script or API route
import { updateFAQDefaults } from "./actions/update-faq-defaults";

await updateFAQDefaults();
```

Or manually in MongoDB:
```javascript
db.general_faqs.updateMany(
  { $or: [{ upvoteCount: null }, { downvoteCount: null }] },
  { $set: { upvoteCount: 0, downvoteCount: 0 } }
)
```

### 3. Prisma Client Not Regenerated
If you updated the schema but didn't regenerate the client.

**Solution:**
```bash
cd dataLayer
npx prisma generate
```

## Verification Steps

1. **Check Database Schema:**
   ```bash
   cd dataLayer
   npx prisma studio
   ```
   - Open a FAQ record
   - Verify `upvoteCount` and `downvoteCount` fields exist
   - Check their values

2. **Check Console Logs:**
   - Open browser DevTools
   - Check server console (where Next.js is running)
   - Look for "FAQ counts:" log message
   - Verify the counts are being fetched

3. **Test Feedback Submission:**
   - Submit feedback on a FAQ
   - Check if count increments
   - Verify in database that the count updated

## Quick Fix Script

Create a file `scripts/fix-faq-counts.ts`:

```typescript
import { db } from "@/lib/db";

async function fixFAQCounts() {
  // Update null values
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

  // Recalculate counts from feedback
  const faqs = await db.fAQ.findMany({
    include: {
      feedbacks: true,
    },
  });

  for (const faq of faqs) {
    const helpfulCount = faq.feedbacks.filter(f => f.isHelpful).length;
    const notHelpfulCount = faq.feedbacks.filter(f => !f.isHelpful).length;

    await db.fAQ.update({
      where: { id: faq.id },
      data: {
        upvoteCount: helpfulCount,
        downvoteCount: notHelpfulCount,
      },
    });
  }

  console.log("✅ FAQ counts updated!");
}

fixFAQCounts();
```

Run it:
```bash
cd modonty
npx tsx app/help/faq/scripts/fix-faq-counts.ts
```

## Expected Behavior

After fixing:
- ✅ Counters show actual numbers from database
- ✅ Submitting feedback increments the correct counter
- ✅ Counts persist after page reload
- ✅ No more infinite requests

## Still Not Working?

1. Check if `getActiveFAQs()` is returning the counts
2. Verify the data is passed through `FAQPageContent` → `FAQAccordion`
3. Check browser console for errors
4. Verify Prisma client types match the schema
