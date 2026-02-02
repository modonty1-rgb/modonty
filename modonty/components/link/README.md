## components/link directory overview

### components/link/index.tsx
- **Exports**: `Link` (default)
- **Purpose**: Project-wide wrapper over Next.js `Link` that prefetches on hover and respects custom props.
- **Runtime**: Client
- **Depends on**: `next/link`, React
- **Used by**: App-wide navigation links (per project rule to always use custom Link)
- **DB models**: none
- **SAFE TO DELETE**: NO

## Usage audit (direct vs indirect)
- Direct imports: widespread across pages/components (navigation, actions, headers/menus).
- Indirect usage: none.

## Final deletion flags (based on deep scan)
- `components/link/index.tsx` → SAFE TO DELETE: NO


