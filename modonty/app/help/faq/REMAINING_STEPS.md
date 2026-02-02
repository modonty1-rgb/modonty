# Remaining Steps After Prisma Generate

## ✅ Completed
- [x] Prisma schema updated (FAQFeedback model, downvoteCount field)
- [x] Prisma client generated
- [x] Session helper created
- [x] FAQ feedback actions implemented
- [x] FAQ actions updated
- [x] FAQ accordion component updated

## 🔄 Remaining Steps

### 1. Apply Database Schema Changes

Since this project uses **MongoDB**, you have two options:

#### Option A: Use Prisma DB Push (Recommended for MongoDB)
```bash
cd dataLayer
npx prisma db push
```

This will:
- Apply schema changes directly to MongoDB
- Create the `faq_feedback` collection
- Add `downvoteCount` field to existing FAQs
- Set default values (upvoteCount: 0, downvoteCount: 0)

#### Option B: Use Prisma Migrate (If migrations are configured)
```bash
cd dataLayer
npx prisma migrate dev --name add_faq_feedback
```

**Note**: MongoDB typically uses `db push` instead of migrations.

### 2. Update Existing FAQs (Optional but Recommended)

If you have existing FAQs with null values, update them:

```bash
# Using MongoDB shell
mongosh your-database-name
db.general_faqs.updateMany(
  { $or: [{ upvoteCount: null }, { downvoteCount: null }] },
  { $set: { upvoteCount: 0, downvoteCount: 0 } }
)
```

Or create a script:

```typescript
// scripts/update-faq-defaults.ts
import { db } from "@/lib/db";

async function updateFAQDefaults() {
  const result = await db.fAQ.updateMany({
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
  
  console.log(`Updated ${result.count} FAQs`);
}

updateFAQDefaults();
```

### 3. Test the Functionality

After applying schema changes, test:

1. **Submit Helpful Feedback:**
   - Go to `/help/faq`
   - Click "مفيد" on any FAQ
   - Verify upvoteCount increments
   - Verify feedback is saved in database

2. **Submit Not Helpful Feedback:**
   - Click "غير مفيد" on any FAQ
   - Verify downvoteCount increments
   - Verify feedback is saved

3. **Test Duplicate Prevention:**
   - Try to submit feedback again on same FAQ
   - Should show "لقد قمت بتقييم هذا السؤال مسبقاً"
   - Buttons should be disabled

4. **Test Session Tracking:**
   - Submit feedback as anonymous user
   - Check that sessionId is stored
   - Try to submit again - should be prevented

5. **Test User Tracking:**
   - Login and submit feedback
   - Check that userId is stored
   - Try to submit again - should be prevented

### 4. Verify Database Structure

Check that:
- ✅ `faq_feedback` collection exists
- ✅ `general_faqs` collection has `downvoteCount` field
- ✅ Unique indexes are created:
  - `faqId + sessionId` (unique)
  - `faqId + userId` (unique)
- ✅ Regular indexes are created:
  - `faqId + createdAt`
  - `userId`
  - `sessionId`
  - `isHelpful`

## Quick Command Summary

```bash
# 1. Apply schema changes (choose one)
cd dataLayer
npx prisma db push                    # For MongoDB (recommended)
# OR
npx prisma migrate dev --name add_faq_feedback  # If using migrations

# 2. Verify schema
npx prisma studio                     # Open Prisma Studio to check

# 3. Test the app
cd ../modonty
pnpm dev                              # Start dev server
# Visit http://localhost:3001/help/faq
```

## Troubleshooting

### Issue: "Field downvoteCount does not exist"
**Solution**: Run `npx prisma db push` again

### Issue: "Unique constraint violation"
**Solution**: This is expected - it means duplicate prevention is working!

### Issue: "Cannot find module '@prisma/client'"
**Solution**: Run `pnpm install` from root, then `pnpm prisma:generate`

### Issue: Session ID not persisting
**Solution**: Check that cookies are enabled in browser, check cookie settings in `session-helper.ts`

## Next Steps After Testing

Once everything works:
1. ✅ Commit all changes
2. ✅ Deploy to staging/production
3. ✅ Monitor feedback submissions
4. ✅ Consider adding analytics dashboard for FAQ feedback
