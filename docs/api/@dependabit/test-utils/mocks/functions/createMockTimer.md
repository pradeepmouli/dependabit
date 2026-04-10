[**Documentation v0.1.16**](../../../../README.md)

***

[Documentation](../../../../README.md) / [@dependabit/test-utils](../../README.md) / [mocks](../README.md) / createMockTimer

# Function: createMockTimer()

> **createMockTimer**(): `object`

Defined in: [mocks.ts:46](https://github.com/pradeepmouli/dependabit/blob/593f80b1a52a09f3a829e289daa81800eaa7d5b0/packages/test-utils/src/mocks.ts#L46)

Creates a mock timer

## Returns

`object`

### advanceTimersByTime

> **advanceTimersByTime**: (`ms`) => `VitestUtils`

#### Parameters

##### ms

`number`

#### Returns

`VitestUtils`

### restore

> **restore**: () => `VitestUtils`

#### Returns

`VitestUtils`

### runAll

> **runAll**: () => `VitestUtils`

#### Returns

`VitestUtils`

### runOnlyPendingTimers

> **runOnlyPendingTimers**: () => `VitestUtils`

#### Returns

`VitestUtils`

## Example

```ts
const timer = createMockTimer();
timer.runAll();
```
