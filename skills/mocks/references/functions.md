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
