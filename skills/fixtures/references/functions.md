# Functions

## `createMockUser`
Creates mock user data for testing
```ts
createMockUser(overrides?: Partial<any>): any
```
**Parameters:**
- `overrides: Partial<any>` (optional) — Partial user data to override defaults
**Returns:** `any`
```ts
const user = createMockUser({ name: 'John' });
expect(user.name).toBe('John');
expect(user.email).toBe('user@example.com');
```

## `createMockEmail`
Creates mock email data for testing
```ts
createMockEmail(overrides?: Partial<any>): any
```
**Parameters:**
- `overrides: Partial<any>` (optional) — Partial email data to override defaults
**Returns:** `any`
```ts
const email = createMockEmail({ to: 'john@example.com' });
expect(email.to).toBe('john@example.com');
```

## `createMockApiResponse`
Creates mock API response for testing
```ts
createMockApiResponse(overrides?: Partial<any>): any
```
**Parameters:**
- `overrides: Partial<any>` (optional) — Partial response data to override defaults
**Returns:** `any`
```ts
const response = createMockApiResponse({ status: 201 });
expect(response.status).toBe(201);
```

## `createMockErrorResponse`
Creates mock error response for testing
```ts
createMockErrorResponse(message: string): any
```
**Parameters:**
- `message: string` — default: `'Test error'` — Error message
**Returns:** `any`
```ts
const error = createMockErrorResponse('Not found');
expect(error.success).toBe(false);
```

## `createMockArray`
Creates an array of mock items
```ts
createMockArray<T>(count: number, factory: (index: number) => T): T[]
```
**Parameters:**
- `count: number` — Number of items to create
- `factory: (index: number) => T` — Function to create individual items
**Returns:** `T[]`
```ts
const users = createMockArray(5, (i) => ({ id: i, name: `User${i}` }));
expect(users).toHaveLength(5);
```
