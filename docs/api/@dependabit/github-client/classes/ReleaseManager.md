[**Documentation v0.1.16**](../../../README.md)

***

[Documentation](../../../README.md) / [@dependabit/github-client](../README.md) / ReleaseManager

# Class: ReleaseManager

Defined in: [packages/github-client/src/releases.ts:23](https://github.com/pradeepmouli/dependabit/blob/593f80b1a52a09f3a829e289daa81800eaa7d5b0/packages/github-client/src/releases.ts#L23)

## Constructors

### Constructor

> **new ReleaseManager**(`auth?`): `ReleaseManager`

Defined in: [packages/github-client/src/releases.ts:26](https://github.com/pradeepmouli/dependabit/blob/593f80b1a52a09f3a829e289daa81800eaa7d5b0/packages/github-client/src/releases.ts#L26)

#### Parameters

##### auth?

`string`

#### Returns

`ReleaseManager`

## Methods

### compareReleases()

> **compareReleases**(`oldReleases`, `newReleases`): [`ReleaseComparison`](../interfaces/ReleaseComparison.md)

Defined in: [packages/github-client/src/releases.ts:100](https://github.com/pradeepmouli/dependabit/blob/593f80b1a52a09f3a829e289daa81800eaa7d5b0/packages/github-client/src/releases.ts#L100)

Compares two sets of releases to find new ones

#### Parameters

##### oldReleases

[`Release`](../interfaces/Release.md)[]

##### newReleases

[`Release`](../interfaces/Release.md)[]

#### Returns

[`ReleaseComparison`](../interfaces/ReleaseComparison.md)

***

### getAllReleases()

> **getAllReleases**(`params`): `Promise`\<[`Release`](../interfaces/Release.md)[]\>

Defined in: [packages/github-client/src/releases.ts:64](https://github.com/pradeepmouli/dependabit/blob/593f80b1a52a09f3a829e289daa81800eaa7d5b0/packages/github-client/src/releases.ts#L64)

Fetches all releases from a repository

#### Parameters

##### params

###### owner

`string`

###### page?

`number`

###### perPage?

`number`

###### repo

`string`

#### Returns

`Promise`\<[`Release`](../interfaces/Release.md)[]\>

***

### getLatestRelease()

> **getLatestRelease**(`params`): `Promise`\<[`Release`](../interfaces/Release.md) \| `null`\>

Defined in: [packages/github-client/src/releases.ts:35](https://github.com/pradeepmouli/dependabit/blob/593f80b1a52a09f3a829e289daa81800eaa7d5b0/packages/github-client/src/releases.ts#L35)

Fetches the latest release from a repository

#### Parameters

##### params

###### owner

`string`

###### repo

`string`

#### Returns

`Promise`\<[`Release`](../interfaces/Release.md) \| `null`\>

***

### getReleaseByTag()

> **getReleaseByTag**(`params`): `Promise`\<[`Release`](../interfaces/Release.md) \| `null`\>

Defined in: [packages/github-client/src/releases.ts:119](https://github.com/pradeepmouli/dependabit/blob/593f80b1a52a09f3a829e289daa81800eaa7d5b0/packages/github-client/src/releases.ts#L119)

Fetches release notes for a specific tag

#### Parameters

##### params

###### owner

`string`

###### repo

`string`

###### tag

`string`

#### Returns

`Promise`\<[`Release`](../interfaces/Release.md) \| `null`\>
