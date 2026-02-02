# Client Seed Module

Standalone module for creating client seed data (Phase 1 of seeding process).

## Structure

```
client-seed/
├── actions/
│   └── client-seed-actions.ts    # Server actions for client seed
├── components/
│   └── client-seed-button.tsx    # Client seed button component
└── README.md                      # This file
```

## Usage

### Using the Button Component

```tsx
import { ClientSeedButton } from "./client-seed/components/client-seed-button";

// Basic usage
<ClientSeedButton />

// With custom options
<ClientSeedButton
  defaultClientCount={10}
  useOpenAI={true}
  industryBrief="Technology sector"
  clearDatabase={true}
/>
```

### Using the Action Directly

```tsx
import { createClientSeed } from "./client-seed/actions/client-seed-actions";

const result = await createClientSeed({
  clientCount: 5,
  useOpenAI: false,
  clearDatabase: true,
});
```

## Features

- Creates clients with media (logos and OG images)
- Validates client count (1-50)
- Reuses existing seed infrastructure (DRY)
- Standalone and reusable component

## Dependencies

- Uses `runFullSeed` from `../../actions/seed-core` with `seedPhase: "clients-only"`
