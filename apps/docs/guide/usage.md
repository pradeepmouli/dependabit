---
title: Usage
---

# Usage

After [installing](./installation) the packages you need, Dependabit can be used programmatically or via its GitHub Action.

See [Examples](./examples) for end-to-end recipes and [Architecture](./architecture) for how the pieces fit together.

## Programmatic

```ts
import { detect } from '@dependabit/detector';
import { loadManifest, saveManifest } from '@dependabit/manifest';

const manifest = await loadManifest('./dependabit.json');
const detected = await detect({ root: process.cwd() });
await saveManifest('./dependabit.json', { ...manifest, ...detected });
```

## GitHub Action

See [Auto-Update](./auto-update) for the push-triggered workflow configuration.
