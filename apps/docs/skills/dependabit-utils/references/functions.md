# Functions

## Utils

### `capitalize`
Capitalizes the first letter of a string.
```ts
capitalize(str: string): string
```
**Parameters:**
- `str: string` — The string to capitalize.
**Returns:** `string` — The capitalized string.
```ts
capitalize('hello'); // 'Hello'
```

### `camelCase`
Converts a string to camelCase.
```ts
camelCase(str: string): string
```
**Parameters:**
- `str: string` — The string to convert.
**Returns:** `string` — The camelCase string.
```ts
camelCase('hello-world'); // 'helloWorld'
```

### `kebabCase`
Converts a string to kebab-case.
```ts
kebabCase(str: string): string
```
**Parameters:**
- `str: string` — The string to convert.
**Returns:** `string` — The kebab-case string.
```ts
kebabCase('HelloWorld'); // 'hello-world'
```

### `truncate`
Truncates a string to a maximum length, appending a suffix if truncated.
```ts
truncate(str: string, maxLength: number, suffix: string): string
```
**Parameters:**
- `str: string` — The string to truncate.
- `maxLength: number` — Maximum total output length, including the suffix.
- `suffix: string` — default: `'...'` — Suffix to append when truncation occurs.
**Returns:** `string` — The truncated string.
```ts
truncate('Hello World', 8); // 'Hello...'
```

### `unique`
Removes duplicates from an array using `Set` equality.
```ts
unique<T>(arr: T[]): T[]
```
**Parameters:**
- `arr: T[]` — The array to deduplicate.
**Returns:** `T[]` — Array with unique elements, preserving insertion order.
```ts
unique([1, 2, 2, 3]); // [1, 2, 3]
```

### `groupBy`
Groups array elements by a key function.
```ts
groupBy<T, K>(arr: T[], keyFn: (item: T) => K): Record<K, T[]>
```
**Parameters:**
- `arr: T[]` — The array to group.
- `keyFn: (item: T) => K` — Function that maps each element to a group key.
**Returns:** `Record<K, T[]>` — An object with grouped elements.
```ts
groupBy([1, 2, 3], n => n % 2); // { '0': [2], '1': [1, 3] }
```

### `flatten`
Flattens a nested array up to the given depth.
```ts
flatten<T>(arr: (T | T[])[], depth: number): T[]
```
**Parameters:**
- `arr: (T | T[])[]` — The array to flatten.
- `depth: number` — default: `1` — Depth to flatten.
**Returns:** `T[]` — Flattened array.
```ts
flatten([[1, 2], [3, [4, 5]]], 1); // [1, 2, 3, [4, 5]]
```

### `chunk`
Splits an array into consecutive chunks of the given size.
```ts
chunk<T>(arr: T[], size: number): T[][]
```
**Parameters:**
- `arr: T[]` — The array to chunk.
- `size: number` — Maximum number of elements per chunk.
**Returns:** `T[][]` — Array of chunks; the last chunk may be smaller than `size`.
```ts
chunk([1, 2, 3, 4, 5], 2); // [[1, 2], [3, 4], [5]]
```
