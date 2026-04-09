# Functions

## `createMockFn`
Creates a mock function
```ts
createMockFn(): Mock<Procedure | Constructable>
```
**Returns:** `Mock<Procedure | Constructable>`
```ts
const mockFn = createMockFn()
  .mockResolvedValue('test');
```

## `spyOn`
Creates a spy on a method
```ts
spyOn<T, K>(obj: T, method: K): any
```
**Parameters:**
- `obj: T` — Object to spy on
- `method: K` — Method name
**Returns:** `any`
```ts
const consoleSpy = spyOn(console, 'log');
console.log('test');
expect(consoleSpy).toHaveBeenCalledWith('test');
```

## `createMockTimer`
Creates a mock timer
```ts
createMockTimer(): { runAll: () => VitestUtils; runOnlyPendingTimers: () => VitestUtils; advanceTimersByTime: (ms: number) => VitestUtils; restore: () => VitestUtils }
```
**Returns:** `{ runAll: () => VitestUtils; runOnlyPendingTimers: () => VitestUtils; advanceTimersByTime: (ms: number) => VitestUtils; restore: () => VitestUtils }`
```ts
const timer = createMockTimer();
timer.runAll();
```

## `mockFetch`
Mocks a fetch request
```ts
mockFetch(url: string, response: any): void
```
**Parameters:**
- `url: string` — URL to mock
- `response: any` — Response data
```ts
mockFetch('/api/users', { success: true });
const res = await fetch('/api/users');
expect(res.json()).resolves.toEqual({ success: true });
```

## `createMockUser`
Creates mock user data for testing
```ts
createMockUser(overrides?: Partial<any>): any
```
**Parameters:**
- `overrides: Partial<any>` (optional) — Partial user data to override defaults
**Returns:** `any` — Mock user object
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
**Returns:** `any` — Mock email object
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
**Returns:** `any` — Mock API response
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
**Returns:** `any` — Mock error response
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
**Returns:** `T[]` — Array of mock items
```ts
const users = createMockArray(5, (i) => ({ id: i, name: `User${i}` }));
expect(users).toHaveLength(5);
```
