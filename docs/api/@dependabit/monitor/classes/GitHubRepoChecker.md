[**Documentation v0.1.16**](../../../README.md)

***

[Documentation](../../../README.md) / [@dependabit/monitor](../README.md) / GitHubRepoChecker

# Class: GitHubRepoChecker

Defined in: [monitor/src/checkers/github-repo.ts:9](https://github.com/pradeepmouli/dependabit/blob/7a951f605034a11422e43adf0f167eebf18155ad/packages/monitor/src/checkers/github-repo.ts#L9)

## Implements

- [`Checker`](../interfaces/Checker.md)

## Constructors

### Constructor

> **new GitHubRepoChecker**(): `GitHubRepoChecker`

#### Returns

`GitHubRepoChecker`

## Methods

### compare()

> **compare**(`prev`, `curr`): `Promise`\<[`ChangeDetection`](../interfaces/ChangeDetection.md)\>

Defined in: [monitor/src/checkers/github-repo.ts:128](https://github.com/pradeepmouli/dependabit/blob/7a951f605034a11422e43adf0f167eebf18155ad/packages/monitor/src/checkers/github-repo.ts#L128)

Compares two snapshots to detect version/state changes

#### Parameters

##### prev

[`DependencySnapshot`](../interfaces/DependencySnapshot.md)

##### curr

[`DependencySnapshot`](../interfaces/DependencySnapshot.md)

#### Returns

`Promise`\<[`ChangeDetection`](../interfaces/ChangeDetection.md)\>

#### Implementation of

[`Checker`](../interfaces/Checker.md).[`compare`](../interfaces/Checker.md#compare)

***

### fetch()

> **fetch**(`config`): `Promise`\<[`DependencySnapshot`](../interfaces/DependencySnapshot.md)\>

Defined in: [monitor/src/checkers/github-repo.ts:13](https://github.com/pradeepmouli/dependabit/blob/7a951f605034a11422e43adf0f167eebf18155ad/packages/monitor/src/checkers/github-repo.ts#L13)

Fetches latest release information from a GitHub repository

#### Parameters

##### config

[`AccessConfig`](../interfaces/AccessConfig.md)

#### Returns

`Promise`\<[`DependencySnapshot`](../interfaces/DependencySnapshot.md)\>

#### Implementation of

[`Checker`](../interfaces/Checker.md).[`fetch`](../interfaces/Checker.md#fetch)
