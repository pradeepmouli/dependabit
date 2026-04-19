# Examples

This directory contains examples demonstrating how to use the packages in this monorepo.

## String Utilities

```typescript
import { capitalize, camelCase, kebabCase, truncate } from '@dependabit/utils';

// Capitalize
capitalize('hello');        // 'Hello'
capitalize('world');        // 'World'

// camelCase
camelCase('hello-world');   // 'helloWorld'
camelCase('hello_world');   // 'helloWorld'
camelCase('HelloWorld');    // 'helloWorld'

// kebabCase
kebabCase('HelloWorld');    // 'hello-world'
kebabCase('helloWorld');    // 'hello-world'

// Truncate
truncate('Hello World', 8); // 'Hello...'
truncate('Hi', 8);          // 'Hi'
```

## Array Utilities

```typescript
import { unique, groupBy, flatten, chunk } from '@dependabit/utils';

// Remove duplicates
unique([1, 2, 2, 3, 3, 3]);           // [1, 2, 3]
unique(['a', 'b', 'a']);              // ['a', 'b']

// Group by key
const users = [
  { id: 1, role: 'admin' },
  { id: 2, role: 'user' },
  { id: 3, role: 'admin' },
];
groupBy(users, (u) => u.role);
// { admin: [{id:1,...}, {id:3,...}], user: [{id:2,...}] }

// Flatten nested arrays
flatten([[1, 2], [3, [4, 5]]], 1);    // [1, 2, 3, [4, 5]]
flatten([[1, 2], [3, [4, 5]]], 2);    // [1, 2, 3, 4, 5]

// Split into chunks
chunk([1, 2, 3, 4, 5], 2);            // [[1, 2], [3, 4], [5]]
chunk('hello', 2);                    // ['he', 'll', 'o']
```

## Manifest Utilities

### Reading and Parsing Config

```typescript
import { readConfig, parseConfig } from '@dependabit/manifest';

// Parse YAML config from a string
const config = parseConfig('version: "1.0.0"\n');

// Or load from disk
const loaded = await readConfig('./dependabit.yml');
```

### Manifest Operations

See the full API for manifest reading, writing, merging, and dependency
mutation at <https://pradeepmouli.github.io/dependabit/api/>.

## Cross-Package Usage

```typescript
import { parseConfig } from '@dependabit/manifest';
import { capitalize } from '@dependabit/utils';

// Combine utilities
function describeConfig(yaml: string): string {
  const config = parseConfig(yaml);
  return `${capitalize('config')} version ${config.version}`;
}

describeConfig('version: "1.0.0"\n');  // 'Config version 1.0.0'
```

## Testing with Test Utilities

```typescript
import { describe, it, expect } from 'vitest';
import {
  createMockUser,
  createMockApiResponse,
  createMockFn,
} from '@dependabit/test-utils';

describe('User Service', () => {
  it('should fetch and process user', async () => {
    const mockUser = createMockUser({ name: 'Alice' });
    const mockFn = createMockFn();
    mockFn.mockResolvedValue(createMockApiResponse({ user: mockUser }));

    const response = await mockFn();

    expect(response.success).toBe(true);
    expect(response.data.user.name).toBe('Alice');
  });
});
```

## Monorepo Development Example

Creating a new feature across packages:

```typescript
// 1. Add a helper in @dependabit/manifest
// packages/manifest/src/version.ts
export function isValidVersion(v: string): boolean {
  return /^\d+\.\d+\.\d+$/.test(v);
}

// 2. Use in @dependabit/utils for formatting
// packages/utils/src/version.ts
import { isValidVersion } from '@dependabit/manifest';

export function formatVersion(v: string): string {
  if (!isValidVersion(v)) throw new Error('Invalid version');
  return `v${v}`;
}

// 3. Test integration
// integration.test.ts
import { isValidVersion } from '@dependabit/manifest';
import { formatVersion } from '@dependabit/utils';

it('should validate and format versions', () => {
  expect(formatVersion('1.2.3')).toBe('v1.2.3');
  expect(() => formatVersion('nope')).toThrow();
});
```

## Real-World Scenarios

### User Data Processing

```typescript
import { capitalize, unique } from '@dependabit/utils';

const users = [
  { name: 'john' },
  { name: 'jane' },
  { name: 'bob' },
  { name: 'jane' },
];

const displayNames = unique(users.map((u) => capitalize(u.name)));
// ['John', 'Jane', 'Bob']
```

### Data Batch Processing

```typescript
import { chunk } from '@dependabit/utils';

const items = Array.from({ length: 1000 }, (_, i) => i);
const batches = chunk(items, 100);

for (const batch of batches) {
  await processBatch(batch);
}
```

### API Error Handling

For HTTP fetch patterns and response shapes used by Dependabit, see the
live API reference at <https://pradeepmouli.github.io/dependabit/api/>
(for example, `@dependabit/github-client` and `@dependabit/monitor`).

## Running Examples

All examples are part of the test suite:

```bash
# Run integration tests with examples
pnpm run test integration.test.ts

# Run specific example
pnpm run test -- --grep "should process user data"

# Watch examples as you edit
pnpm run test:watch -- integration.test.ts
```

## More Information

- [Manifest Package](../packages/manifest/README.md)
- [Utils Package](../packages/utils/README.md)
- [Test Utils Package](../packages/test-utils/README.md)
- [Workspace Guide](./WORKSPACE.md)
- [Testing Guide](./TESTING.md)
- [Development Workflow](./DEVELOPMENT.md)
