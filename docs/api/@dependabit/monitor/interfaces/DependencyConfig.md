[**Documentation v0.1.16**](../../../README.md)

***

[Documentation](../../../README.md) / [@dependabit/monitor](../README.md) / DependencyConfig

# Interface: DependencyConfig

Defined in: [monitor/src/monitor.ts:12](https://github.com/pradeepmouli/dependabit/blob/4918d1ad177242efd82cc7d7c13c4be62c454ef5/packages/monitor/src/monitor.ts#L12)

## Extends

- [`AccessConfig`](AccessConfig.md)

## Properties

### accessMethod

> **accessMethod**: `"github-api"` \| `"http"` \| `"openapi"` \| `"context7"` \| `"arxiv"`

Defined in: [monitor/src/types.ts:23](https://github.com/pradeepmouli/dependabit/blob/4918d1ad177242efd82cc7d7c13c4be62c454ef5/packages/monitor/src/types.ts#L23)

#### Inherited from

[`AccessConfig`](AccessConfig.md).[`accessMethod`](AccessConfig.md#accessmethod)

***

### auth?

> `optional` **auth?**: `object`

Defined in: [monitor/src/types.ts:24](https://github.com/pradeepmouli/dependabit/blob/4918d1ad177242efd82cc7d7c13c4be62c454ef5/packages/monitor/src/types.ts#L24)

#### secret?

> `optional` **secret?**: `string`

#### type

> **type**: `"token"` \| `"basic"` \| `"oauth"` \| `"none"`

#### Inherited from

[`AccessConfig`](AccessConfig.md).[`auth`](AccessConfig.md#auth)

***

### currentStateHash

> **currentStateHash**: `string`

Defined in: [monitor/src/monitor.ts:16](https://github.com/pradeepmouli/dependabit/blob/4918d1ad177242efd82cc7d7c13c4be62c454ef5/packages/monitor/src/monitor.ts#L16)

***

### currentVersion?

> `optional` **currentVersion?**: `string`

Defined in: [monitor/src/monitor.ts:17](https://github.com/pradeepmouli/dependabit/blob/4918d1ad177242efd82cc7d7c13c4be62c454ef5/packages/monitor/src/monitor.ts#L17)

***

### id

> **id**: `string`

Defined in: [monitor/src/monitor.ts:13](https://github.com/pradeepmouli/dependabit/blob/4918d1ad177242efd82cc7d7c13c4be62c454ef5/packages/monitor/src/monitor.ts#L13)

***

### lastChecked?

> `optional` **lastChecked?**: `string`

Defined in: [monitor/src/monitor.ts:18](https://github.com/pradeepmouli/dependabit/blob/4918d1ad177242efd82cc7d7c13c4be62c454ef5/packages/monitor/src/monitor.ts#L18)

***

### monitoring?

> `optional` **monitoring?**: `object`

Defined in: [monitor/src/monitor.ts:19](https://github.com/pradeepmouli/dependabit/blob/4918d1ad177242efd82cc7d7c13c4be62c454ef5/packages/monitor/src/monitor.ts#L19)

#### enabled?

> `optional` **enabled?**: `boolean`

#### ignoreChanges?

> `optional` **ignoreChanges?**: `boolean`

***

### name?

> `optional` **name?**: `string`

Defined in: [monitor/src/monitor.ts:14](https://github.com/pradeepmouli/dependabit/blob/4918d1ad177242efd82cc7d7c13c4be62c454ef5/packages/monitor/src/monitor.ts#L14)

***

### type?

> `optional` **type?**: `string`

Defined in: [monitor/src/monitor.ts:15](https://github.com/pradeepmouli/dependabit/blob/4918d1ad177242efd82cc7d7c13c4be62c454ef5/packages/monitor/src/monitor.ts#L15)

***

### url

> **url**: `string`

Defined in: [monitor/src/types.ts:22](https://github.com/pradeepmouli/dependabit/blob/4918d1ad177242efd82cc7d7c13c4be62c454ef5/packages/monitor/src/types.ts#L22)

#### Inherited from

[`AccessConfig`](AccessConfig.md).[`url`](AccessConfig.md#url)
