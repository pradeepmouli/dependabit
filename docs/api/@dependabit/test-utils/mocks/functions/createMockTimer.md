[**Documentation v0.1.16**](../../../../README.md)

***

[Documentation](../../../../README.md) / [@dependabit/test-utils](../../README.md) / [mocks](../README.md) / createMockTimer

# Function: createMockTimer()

> **createMockTimer**(): `object`

Defined in: [mocks.ts:46](https://github.com/pradeepmouli/dependabit/blob/12b63d7aa2de6ab4cf236695ba391228bb4f0775/packages/test-utils/src/mocks.ts#L46)

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
