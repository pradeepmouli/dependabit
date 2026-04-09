# Functions

## `unique`
Removes duplicates from an array
```ts
unique<T>(arr: T[]): T[]
```
**Parameters:**
- `arr: T[]` — The array to deduplicate
**Returns:** `T[]`
```ts
unique([1, 2, 2, 3]); // [1, 2, 3]
```

## `groupBy`
Groups array elements by a key function
```ts
groupBy<T, K>(arr: T[], keyFn: (item: T) => K): Record<K, T[]>
```
**Parameters:**
- `arr: T[]` — The array to group
- `keyFn: (item: T) => K` — Function to determine group key
**Returns:** `Record<K, T[]>`
```ts
groupBy([1, 2, 3], n => n % 2); // { '0': [2], '1': [1, 3] }
```

## `flatten`
Flattens a nested array
```ts
flatten<T>(arr: (T | T[])[], depth: number): T[]
```
**Parameters:**
- `arr: (T | T[])[]` — The array to flatten
- `depth: number` — default: `1` — Depth to flatten (default: 1)
**Returns:** `T[]`
```ts
flatten([[1, 2], [3, [4, 5]]], 1); // [1, 2, 3, [4, 5]]
```

## `chunk`
Chunks an array into smaller arrays
```ts
chunk<T>(arr: T[], size: number): T[][]
```
**Parameters:**
- `arr: T[]` — The array to chunk
- `size: number` — Size of each chunk
**Returns:** `T[][]`
```ts
chunk([1, 2, 3, 4, 5], 2); // [[1, 2], [3, 4], [5]]
```
