[**Documentation v0.1.16**](../../../README.md)

***

[Documentation](../../../README.md) / [@dependabit/github-client](../README.md) / IssueManager

# Class: IssueManager

Defined in: [packages/github-client/src/issues.ts:37](https://github.com/pradeepmouli/dependabit/blob/7a951f605034a11422e43adf0f167eebf18155ad/packages/github-client/src/issues.ts#L37)

## Constructors

### Constructor

> **new IssueManager**(`auth?`): `IssueManager`

Defined in: [packages/github-client/src/issues.ts:40](https://github.com/pradeepmouli/dependabit/blob/7a951f605034a11422e43adf0f167eebf18155ad/packages/github-client/src/issues.ts#L40)

#### Parameters

##### auth?

`string`

#### Returns

`IssueManager`

## Methods

### createIssue()

> **createIssue**(`data`): `Promise`\<[`IssueResult`](../interfaces/IssueResult.md)\>

Defined in: [packages/github-client/src/issues.ts:49](https://github.com/pradeepmouli/dependabit/blob/7a951f605034a11422e43adf0f167eebf18155ad/packages/github-client/src/issues.ts#L49)

Creates a new issue for a dependency change

#### Parameters

##### data

[`IssueData`](../interfaces/IssueData.md)

#### Returns

`Promise`\<[`IssueResult`](../interfaces/IssueResult.md)\>

***

### findExistingIssue()

> **findExistingIssue**(`params`): `Promise`\<[`IssueResult`](../interfaces/IssueResult.md) \| `null`\>

Defined in: [packages/github-client/src/issues.ts:76](https://github.com/pradeepmouli/dependabit/blob/7a951f605034a11422e43adf0f167eebf18155ad/packages/github-client/src/issues.ts#L76)

Finds an existing issue for a dependency

#### Parameters

##### params

###### dependencyId

`string`

###### owner

`string`

###### repo

`string`

#### Returns

`Promise`\<[`IssueResult`](../interfaces/IssueResult.md) \| `null`\>

***

### updateIssue()

> **updateIssue**(`data`): `Promise`\<[`IssueResult`](../interfaces/IssueResult.md)\>

Defined in: [packages/github-client/src/issues.ts:115](https://github.com/pradeepmouli/dependabit/blob/7a951f605034a11422e43adf0f167eebf18155ad/packages/github-client/src/issues.ts#L115)

Updates an existing issue

#### Parameters

##### data

[`UpdateIssueData`](../interfaces/UpdateIssueData.md)

#### Returns

`Promise`\<[`IssueResult`](../interfaces/IssueResult.md)\>
