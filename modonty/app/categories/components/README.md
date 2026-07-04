# Categories Components

Route-specific components for the categories page.

## Server Components
- `enhanced-category-card.tsx` — individual category card, used by the `[slug]/related-categories` widget.

> The listing page itself (`app/categories/page.tsx`) now uses the shared
> `components/shared/ListingHero`, `EntityCard`, `EntitySearchForm`,
> `EntitySortFilter`, and `InfiniteEntityGrid` — the old route-specific hero,
> search, filter, list-item, skeleton, empty-state, and featured components were
> removed in favor of that unified pattern.
