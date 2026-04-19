# Functions

## Test Utilities

### `createMockFn`
Creates a Vitest mock function.
```ts
createMockFn(): Mock<Procedure | Constructable>
```
**Returns:** `Mock<Procedure | Constructable>` — A `vi.fn()` spy ready to be configured.
```ts
const mockFn = createMockFn()
  .mockResolvedValue('test');
```

### `spyOn`
Creates a Vitest spy on an object method.
```ts
spyOn<T, K>(obj: T, method: K): any
```
**Parameters:**
- `obj: T` — Object to spy on.
- `method: K` — Method name to spy on.
**Returns:** `any`
```ts
const consoleSpy = spyOn(console, 'log');
console.log('test');
expect(consoleSpy).toHaveBeenCalledWith('test');
```

### `createMockTimer`
Activates Vitest fake timers and returns a helper object.

Call `restore()` in an `afterEach` hook to reset real timers.
```ts
createMockTimer(): { runAll: () => VitestUtils; runOnlyPendingTimers: () => VitestUtils; advanceTimersByTime: (ms: number) => VitestUtils; restore: () => VitestUtils }
```
**Returns:** `{ runAll: () => VitestUtils; runOnlyPendingTimers: () => VitestUtils; advanceTimersByTime: (ms: number) => VitestUtils; restore: () => VitestUtils }`
```ts
const timer = createMockTimer();
timer.runAll();
```

### `mockFetch`
Replaces the global `fetch` with a Vitest mock that returns `response`
as JSON when `url` is requested.

This mutates `global.fetch`; reset it in `afterEach` with
`vi.restoreAllMocks()`.
```ts
mockFetch(url: string, response: any): void
```
**Parameters:**
- `url: string` — The URL string to match.
- `response: any` — JSON-serialisable response body.
```ts
mockFetch('/api/users', { success: true });
const res = await fetch('/api/users');
expect(res.json()).resolves.toEqual({ success: true });
```

### `createMockUser`
Creates generic mock user data for testing.
```ts
createMockUser(overrides?: Partial<any>): any
```
**Parameters:**
- `overrides: Partial<any>` (optional) — Partial user data to override defaults.
**Returns:** `any` — Mock user object.
```ts
const user = createMockUser({ name: 'John' });
expect(user.name).toBe('John');
expect(user.email).toBe('user@example.com');
```

### `createMockEmail`
Creates generic mock email data for testing.
```ts
createMockEmail(overrides?: Partial<any>): any
```
**Parameters:**
- `overrides: Partial<any>` (optional) — Partial email data to override defaults.
**Returns:** `any` — Mock email object.
```ts
const email = createMockEmail({ to: 'john@example.com' });
expect(email.to).toBe('john@example.com');
```

### `createMockApiResponse`
Creates a generic mock API response envelope for testing.
```ts
createMockApiResponse(overrides?: Partial<any>): any
```
**Parameters:**
- `overrides: Partial<any>` (optional) — Partial response data to override defaults.
**Returns:** `any` — Mock API response.
```ts
const response = createMockApiResponse({ status: 201 });
expect(response.status).toBe(201);
```

### `createMockErrorResponse`
Creates a generic mock error response envelope for testing.
```ts
createMockErrorResponse(message: string): any
```
**Parameters:**
- `message: string` — default: `'Test error'` — Error message string.
**Returns:** `any` — Mock error response with `success: false`.
```ts
const error = createMockErrorResponse('Not found');
expect(error.success).toBe(false);
```

### `createMockArray`
Creates an array of mock items using a factory function.
```ts
createMockArray<T>(count: number, factory: (index: number) => T): T[]
```
**Parameters:**
- `count: number` — Number of items to create.
- `factory: (index: number) => T` — Function called with each zero-based index to produce an item.
**Returns:** `T[]` — Array of `count` items.
```ts
const users = createMockArray(5, (i) => ({ id: i, name: `User${i}` }));
expect(users).toHaveLength(5);
```
