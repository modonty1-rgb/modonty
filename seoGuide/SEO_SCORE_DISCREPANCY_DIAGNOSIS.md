# SEO Score Discrepancy Diagnosis

## Problem
SEO Doctor shows 83% (165/200) while SEO Gauge shows 80% (160/200) for the same client.

## Root Cause Analysis

### Issue 1: Missing Fields in Client Model Schema
- The `Client` model in Prisma schema does NOT have `ogImageWidth` and `ogImageHeight` fields
- These fields only exist on the `Article` model (lines 417-418 in schema.prisma)
- Code attempts to save these fields to Client model, but they don't exist in schema

### Issue 2: Data Source Mismatch
- **SEO Doctor (form)**: Uses `formData` which gets dimensions from `ogImageMedia.width/height` OR `initialData.ogImageWidth/ogImageHeight`
- **SEO Gauge (table)**: Uses database `client` object which:
  - Doesn't have `ogImageWidth`/`ogImageHeight` fields (not in schema)
  - Doesn't include `ogImageMedia` relation in query (so can't get dimensions from Media model)

### Issue 3: Table Query Missing Media Relations
- `getClients()` query only includes `_count` for articles
- Does NOT include `ogImageMedia` relation
- Therefore, dimensions from Media model are not available

## Current Data Flow

### SEO Doctor (Edit Page)
```
getClientById() 
  → includes ogImageMedia (with width/height)
  → initialData has ogImageMedia.width/height
  → formData.ogImageWidth = ogImageMedia.width || initialData.ogImageWidth
  → SEO Doctor uses formData with dimensions
```

### SEO Gauge (Table)
```
getClients()
  → does NOT include ogImageMedia
  → client object has NO ogImageWidth/ogImageHeight (not in schema)
  → SEO Gauge uses client without dimensions
```

## Solution Options

### Option 1: Add Fields to Client Schema (Recommended)
- Add `ogImageWidth Int?` and `ogImageHeight Int?` to Client model
- Run Prisma migration
- Both components will have access to dimensions

### Option 2: Include Media Relations in Table Query
- Update `getClients()` to include `ogImageMedia` relation
- Transform client data to map `ogImageMedia.width/height` to `ogImageWidth/ogImageHeight`
- Pass transformed data to SEO Gauge

### Option 3: Use Media Dimensions Directly
- Update validators to check `ogImageMedia?.width` and `ogImageMedia?.height` instead of `ogImageWidth`/`ogImageHeight`
- Requires changing SEO config validators

## Recommended Fix: Option 1 + Option 2
1. Add `ogImageWidth` and `ogImageHeight` to Client schema
2. Include `ogImageMedia` in table query for consistency
3. Ensure both formData and table client have same structure
