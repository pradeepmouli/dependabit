[**Documentation v0.1.16**](../../../README.md)

***

[Documentation](../../../README.md) / [@dependabit/detector](../README.md) / extractDependencyChanges

# Function: extractDependencyChanges()

> **extractDependencyChanges**(`files`): `object`

Defined in: [detector/src/diff-parser.ts:218](https://github.com/pradeepmouli/dependabit/blob/7a951f605034a11422e43adf0f167eebf18155ad/packages/detector/src/diff-parser.ts#L218)

Extract all dependency-related content from commit diffs

## Parameters

### files

[`CommitFile`](../../github-client/interfaces/CommitFile.md)[]

## Returns

`object`

### addedPackages

> **addedPackages**: `string`[]

### addedUrls

> **addedUrls**: `string`[]

### changedFiles

> **changedFiles**: [`ChangedFilesResult`](../interfaces/ChangedFilesResult.md)

### removedPackages

> **removedPackages**: `string`[]

### removedUrls

> **removedUrls**: `string`[]
