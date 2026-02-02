# Shared Type Definitions

This directory contains shared TypeScript type definitions used across the admin codebase.

## Files

- **form-types.ts** - Form data interfaces for all entity forms (Article, Client, Author, etc.)
- **prisma-types.ts** - Extended Prisma types with relations using `Prisma.XGetPayload`
- **table-types.ts** - Types for table components and sorting
- **structured-data-types.ts** - Types for JSON-LD structured data objects
- **index.ts** - Barrel export for all types

## Usage

Import types from the index file:

```typescript
import { ArticleFormData, ClientWithCount, StructuredData } from "@/lib/types";
```
