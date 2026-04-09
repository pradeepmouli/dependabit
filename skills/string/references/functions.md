# Functions

## `capitalize`
Capitalizes the first letter of a string
```ts
capitalize(str: string): string
```
**Parameters:**
- `str: string` — The string to capitalize
**Returns:** `string`
```ts
capitalize('hello'); // 'Hello'
```

## `camelCase`
Converts a string to camelCase
```ts
camelCase(str: string): string
```
**Parameters:**
- `str: string` — The string to convert
**Returns:** `string`
```ts
camelCase('hello-world'); // 'helloWorld'
```

## `kebabCase`
Converts a string to kebab-case
```ts
kebabCase(str: string): string
```
**Parameters:**
- `str: string` — The string to convert
**Returns:** `string`
```ts
kebabCase('HelloWorld'); // 'hello-world'
```

## `truncate`
Truncates a string to a maximum length
```ts
truncate(str: string, maxLength: number, suffix: string): string
```
**Parameters:**
- `str: string` — The string to truncate
- `maxLength: number` — Maximum length
- `suffix: string` — default: `'...'` — Suffix to add if truncated (default: '...')
**Returns:** `string`
```ts
truncate('Hello World', 8); // 'Hello...'
```
