[**Documentation v0.1.16**](../../../README.md)

***

[Documentation](../../../README.md) / [@dependabit/monitor](../README.md) / CheckResult

# Interface: CheckResult

Defined in: [monitor/src/monitor.ts:25](https://github.com/pradeepmouli/dependabit/blob/12b63d7aa2de6ab4cf236695ba391228bb4f0775/packages/monitor/src/monitor.ts#L25)

## Properties

### changes?

> `optional` **changes?**: [`ChangeDetection`](ChangeDetection.md)

Defined in: [monitor/src/monitor.ts:28](https://github.com/pradeepmouli/dependabit/blob/12b63d7aa2de6ab4cf236695ba391228bb4f0775/packages/monitor/src/monitor.ts#L28)

***

### dependency

> **dependency**: [`DependencyConfig`](DependencyConfig.md)

Defined in: [monitor/src/monitor.ts:26](https://github.com/pradeepmouli/dependabit/blob/12b63d7aa2de6ab4cf236695ba391228bb4f0775/packages/monitor/src/monitor.ts#L26)

***

### error?

> `optional` **error?**: `string`

Defined in: [monitor/src/monitor.ts:31](https://github.com/pradeepmouli/dependabit/blob/12b63d7aa2de6ab4cf236695ba391228bb4f0775/packages/monitor/src/monitor.ts#L31)

***

### hasChanged

> **hasChanged**: `boolean`

Defined in: [monitor/src/monitor.ts:27](https://github.com/pradeepmouli/dependabit/blob/12b63d7aa2de6ab4cf236695ba391228bb4f0775/packages/monitor/src/monitor.ts#L27)

***

### newSnapshot?

> `optional` **newSnapshot?**: [`DependencySnapshot`](DependencySnapshot.md)

Defined in: [monitor/src/monitor.ts:30](https://github.com/pradeepmouli/dependabit/blob/12b63d7aa2de6ab4cf236695ba391228bb4f0775/packages/monitor/src/monitor.ts#L30)

***

### severity?

> `optional` **severity?**: `"breaking"` \| `"major"` \| `"minor"`

Defined in: [monitor/src/monitor.ts:29](https://github.com/pradeepmouli/dependabit/blob/12b63d7aa2de6ab4cf236695ba391228bb4f0775/packages/monitor/src/monitor.ts#L29)
