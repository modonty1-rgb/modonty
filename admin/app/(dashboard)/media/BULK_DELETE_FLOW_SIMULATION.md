# Bulk Delete Media Flow Simulation

## Scenario 1: User Selects 5 Media Items - Mixed Usage

### Initial State
- User has selected 5 media items:
  - `logo-client-a.png` (ID: `media-1`)
  - `article-featured.jpg` (ID: `media-2`)
  - `og-image-b.png` (ID: `media-3`)
  - `unused-image.jpg` (ID: `media-4`)
  - `twitter-card.png` (ID: `media-5`)

### Step 1: User Clicks "Delete Selected" Button
```
User Action: Click "Delete Selected (5)" button
UI State: Button shows loading spinner
```

### Step 2: Pre-Delete Validation (handleBulkDelete)
```javascript
// Frontend calls canDeleteMedia for each selected item
const checks = await Promise.all([
  canDeleteMedia('media-1'), // logo-client-a.png
  canDeleteMedia('media-2'), // article-featured.jpg
  canDeleteMedia('media-3'), // og-image-b.png
  canDeleteMedia('media-4'), // unused-image.jpg
  canDeleteMedia('media-5'), // twitter-card.png
]);
```

### Step 3: Backend Checks (canDeleteMedia → getMediaUsage)

#### Check 1: `logo-client-a.png` (media-1)
```javascript
// getMediaUsage('media-1') checks:
1. Featured Articles: [] (none)
2. Client Logo Usage: 
   - Found: Used as logoMedia by Client "Acme Corp" (client-abc)
   
Result: {
  canDelete: false,
  reason: "This media is used as logo for client 'Acme Corp'. Please change the client's media settings first.",
  usage: {
    featuredIn: [],
    clientUsage: {
      logoClient: { id: 'client-abc', name: 'Acme Corp' }
    }
  }
}
```

#### Check 2: `article-featured.jpg` (media-2)
```javascript
// getMediaUsage('media-2') checks:
1. Featured Articles: 
   - Article "How to Build APIs" (PUBLISHED)
   - Article "Best Practices" (DRAFT)
2. Client Media Usage: [] (none)

Result: {
  canDelete: false,
  reason: "This media is used in 1 published article(s). Please remove it from articles first.",
  usage: {
    featuredIn: [{ id: 'article-1', title: 'How to Build APIs', status: 'PUBLISHED' }],
    clientUsage: {}
  }
}
```

#### Check 3: `og-image-b.png` (media-3)
```javascript
// getMediaUsage('media-3') checks:
1. Featured Articles: [] (none)
2. Client OG Image Usage:
   - Found: Used as ogImageMedia by Client "Tech Solutions" (client-xyz)

Result: {
  canDelete: false,
  reason: "This media is used as OG image for client 'Tech Solutions'. Please change the client's media settings first.",
  usage: {
    featuredIn: [],
    clientUsage: {
      ogImageClient: { id: 'client-xyz', name: 'Tech Solutions' }
    }
  }
}
```

#### Check 4: `unused-image.jpg` (media-4)
```javascript
// getMediaUsage('media-4') checks:
1. Featured Articles: [] (none)
2. Client Media Usage: [] (none)

Result: {
  canDelete: true,
  usage: {
    featuredIn: [],
    clientUsage: {}
  }
}
```

#### Check 5: `twitter-card.png` (media-5)
```javascript
// getMediaUsage('media-5') checks:
1. Featured Articles: [] (none)
2. Client Twitter Image Usage:
   - Found: Used as twitterImageMedia by Client "Startup Inc" (client-123)

Result: {
  canDelete: false,
  reason: "This media is used as Twitter image for client 'Startup Inc'. Please change the client's media settings first.",
  usage: {
    featuredIn: [],
    clientUsage: {
      twitterImageClient: { id: 'client-123', name: 'Startup Inc' }
    }
  }
}
```

### Step 4: Frontend Processes Results
```javascript
const cannotDelete = [
  { check: {...}, id: 'media-1' }, // logo-client-a.png
  { check: {...}, id: 'media-2' }, // article-featured.jpg
  { check: {...}, id: 'media-3' }, // og-image-b.png
  { check: {...}, id: 'media-5' }, // twitter-card.png
];

// Only media-4 can be deleted
```

### Step 5: Error Dialog Display
```
┌─────────────────────────────────────────────────────────┐
│  ⚠️  Cannot Delete Media                                │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  4 media file(s) cannot be deleted:                    │
│                                                         │
│  📋 Cannot Delete:                                     │
│  • logo-client-a.png                                   │
│    Used as logo for client "Acme Corp"                │
│    → Please change the client's media settings first   │
│                                                         │
│  • article-featured.jpg                                │
│    Used in 1 published article(s)                     │
│    → Please remove it from articles first              │
│                                                         │
│  • og-image-b.png                                      │
│    Used as OG image for client "Tech Solutions"        │
│    → Please change the client's media settings first   │
│                                                         │
│  • twitter-card.png                                    │
│    Used as Twitter image for client "Startup Inc"      │
│    → Please change the client's media settings first   │
│                                                         │
│  ✅ Can Delete:                                         │
│  • unused-image.jpg                                    │
│                                                         │
│  ────────────────────────────────────────────────────  │
│                                                         │
│  💡 Tip: Remove media from client settings or articles  │
│     before attempting to delete.                       │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                    [ Close ]                           │
└─────────────────────────────────────────────────────────┘
```

### Step 6: User Action Options
**Option A: User closes dialog and fixes issues**
- User goes to Client settings and changes logo/OG/Twitter images
- User removes media from articles
- User returns and tries again

**Option B: User wants to delete only deletable items**
- System should offer: "Delete 1 item that can be deleted?"
- If confirmed, only `unused-image.jpg` gets deleted

---

## Scenario 2: All Selected Items Can Be Deleted

### Initial State
- User selected 3 unused media items:
  - `test-image-1.jpg` (ID: `media-10`)
  - `test-image-2.jpg` (ID: `media-11`)
  - `test-image-3.jpg` (ID: `media-12`)

### Step 1-3: Validation Checks
All 3 items return `canDelete: true`

### Step 4: Confirmation Dialog
```
┌─────────────────────────────────────────────────────────┐
│  ⚠️  Confirm Delete                                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Are you sure you want to delete 3 media file(s)?      │
│  This action cannot be undone.                          │
│                                                         │
│  Files to delete:                                       │
│  • test-image-1.jpg                                    │
│  • test-image-2.jpg                                    │
│  • test-image-3.jpg                                    │
│                                                         │
├─────────────────────────────────────────────────────────┤
│            [ Cancel ]        [ Delete ]                 │
└─────────────────────────────────────────────────────────┘
```

### Step 5: User Confirms - Deletion Process

#### 5.1: Frontend calls bulkDeleteMedia
```javascript
const result = await bulkDeleteMedia(['media-10', 'media-11', 'media-12']);
```

#### 5.2: Backend Final Validation (bulkDeleteMedia)
```javascript
// Double-check all items (safety)
const mediaList = await db.media.findMany({
  where: { id: { in: ['media-10', 'media-11', 'media-12'] } },
  include: {
    featuredArticles: { where: { status: 'PUBLISHED' } },
    // NEW: Check client relations
    logoClient: { select: { id: true, name: true } },
    ogImageClient: { select: { id: true, name: true } },
    twitterImageClient: { select: { id: true, name: true } },
  }
});

// All checks pass - proceed
```

#### 5.3: Cloudinary Deletion
```javascript
// Delete from Cloudinary (parallel)
await Promise.allSettled([
  deleteCloudinaryAsset('media/test-image-1', 'image'),
  deleteCloudinaryAsset('media/test-image-2', 'image'),
  deleteCloudinaryAsset('media/test-image-3', 'image'),
]);
// Result: All successful
```

#### 5.4: Database Deletion
```javascript
await db.media.deleteMany({
  where: { id: { in: ['media-10', 'media-11', 'media-12'] } }
});
// Result: 3 records deleted
```

#### 5.5: Success Feedback
```
┌─────────────────────────────────────────────────────────┐
│  ✅ Success                                              │
├─────────────────────────────────────────────────────────┤
│  Successfully deleted 3 media file(s).                  │
└─────────────────────────────────────────────────────────┘
```

---

## Scenario 3: Partial Deletion (Enhanced UX)

### Initial State
- User selected 5 items, 2 cannot be deleted, 3 can be deleted

### Enhanced UX Flow
```
┌─────────────────────────────────────────────────────────┐
│  ⚠️  Some Media Cannot Be Deleted                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  2 of 5 selected items cannot be deleted:              │
│                                                         │
│  ❌ Cannot Delete:                                      │
│  • logo.png - Used as logo for "Acme Corp"            │
│  • featured.jpg - Used in 2 published articles         │
│                                                         │
│  ✅ Can Delete (3 items):                              │
│  • unused-1.jpg                                        │
│  • unused-2.jpg                                        │
│  • unused-3.jpg                                        │
│                                                         │
│  ────────────────────────────────────────────────────  │
│                                                         │
│  Would you like to delete the 3 items that can be      │
│  deleted?                                               │
│                                                         │
├─────────────────────────────────────────────────────────┤
│     [ Cancel ]  [ Delete 3 Items ]                     │
└─────────────────────────────────────────────────────────┘
```

### User Confirms Partial Deletion
- Only the 3 deletable items are deleted
- The 2 protected items remain
- Success message: "Successfully deleted 3 of 5 selected items. 2 items were protected and could not be deleted."

---

## Data Flow Diagram

```
┌─────────────┐
│ User Selects│
│ Media Items │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│ Click "Delete"   │
│ Button          │
└──────┬──────────┘
       │
       ▼
┌─────────────────────────────┐
│ handleBulkDelete()          │
│ - Get selected IDs          │
│ - Call canDeleteMedia()     │
│   for each item             │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│ canDeleteMedia(id)           │
│ - Calls getMediaUsage()      │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│ getMediaUsage(id)            │
│ - Check featuredArticles    │
│ - Check logoClient          │ ← NEW
│ - Check ogImageClient       │ ← NEW
│ - Check twitterImageClient  │ ← NEW
│ - Return usage data         │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│ Process Results              │
│ - Group deletable/non-       │
│   deletable items           │
│ - Build error messages      │
└──────┬──────────────────────┘
       │
       ├─── Cannot Delete ────► Show Error Dialog
       │                        (with details)
       │
       └─── Can Delete ────────► Show Confirm Dialog
                                 │
                                 ▼
                          ┌──────────────┐
                          │ User Confirms│
                          └──────┬───────┘
                                 │
                                 ▼
                          ┌─────────────────────┐
                          │ bulkDeleteMedia()   │
                          │ - Final validation  │
                          │ - Delete Cloudinary │
                          │ - Delete Database   │
                          └──────┬──────────────┘
                                 │
                                 ▼
                          ┌──────────────┐
                          │ Success Toast│
                          │ Refresh Page │
                          └──────────────┘
```

---

## Key Improvements

1. **Pre-deletion validation** - Checks happen before any deletion attempts
2. **Detailed error messages** - Shows exactly why each item can't be deleted
3. **Client name display** - Users know which client is using the media
4. **Usage type clarity** - Distinguishes between logo/OG/Twitter image usage
5. **Partial deletion option** - Users can delete what's possible
6. **Safety checks** - Multiple validation layers prevent data loss
