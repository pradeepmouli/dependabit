# Functions

## string

### `capitalize`
Capitalizes the first letter of a string
```ts
capitalize(str: string): string
```
**Parameters:**
- `str: string` — The string to capitalize
**Returns:** `string` — The capitalized string
```ts
capitalize('hello'); // 'Hello'
```

### `camelCase`
Converts a string to camelCase
```ts
camelCase(str: string): string
```
**Parameters:**
- `str: string` — The string to convert
**Returns:** `string` — The camelCase string
```ts
camelCase('hello-world'); // 'helloWorld'
```

### `kebabCase`
Converts a string to kebab-case
```ts
kebabCase(str: string): string
```
**Parameters:**
- `str: string` — The string to convert
**Returns:** `string` — The kebab-case string
```ts
kebabCase('HelloWorld'); // 'hello-world'
```

### `truncate`
Truncates a string to a maximum length
```ts
truncate(str: string, maxLength: number, suffix: string): string
```
**Parameters:**
- `str: string` — The string to truncate
- `maxLength: number` — Maximum length
- `suffix: string` — default: `'...'` — Suffix to add if truncated (default: '...')
**Returns:** `string` — The truncated string
```ts
truncate('Hello World', 8); // 'Hello...'
```

## array

### `unique`
Removes duplicates from an array
```ts
unique<T>(arr: T[]): T[]
```
**Parameters:**
- `arr: T[]` — The array to deduplicate
**Returns:** `T[]` — Array with unique elements
```ts
unique([1, 2, 2, 3]); // [1, 2, 3]
```

### `groupBy`
Groups array elements by a key function
```ts
groupBy<T, K>(arr: T[], keyFn: (item: T) => K): Record<K, T[]>
```
**Parameters:**
- `arr: T[]` — The array to group
- `keyFn: (item: T) => K` — Function to determine group key
**Returns:** `Record<K, T[]>` — Object with grouped elements
```ts
groupBy([1, 2, 3], n => n % 2); // { '0': [2], '1': [1, 3] }
```

### `flatten`
Flattens a nested array
```ts
flatten<T>(arr: (T | T[])[], depth: number): T[]
```
**Parameters:**
- `arr: (T | T[])[]` — The array to flatten
- `depth: number` — default: `1` — Depth to flatten (default: 1)
**Returns:** `T[]` — Flattened array
```ts
flatten([[1, 2], [3, [4, 5]]], 1); // [1, 2, 3, [4, 5]]
```

### `chunk`
Chunks an array into smaller arrays
```ts
chunk<T>(arr: T[], size: number): T[][]
```
**Parameters:**
- `arr: T[]` — The array to chunk
- `size: number` — Size of each chunk
**Returns:** `T[][]` — Array of chunks
```ts
chunk([1, 2, 3, 4, 5], 2); // [[1, 2], [3, 4], [5]]
```
