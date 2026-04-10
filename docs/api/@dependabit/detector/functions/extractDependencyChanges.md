[**Documentation v0.1.16**](../../../README.md)

***

[Documentation](../../../README.md) / [@dependabit/detector](../README.md) / extractDependencyChanges

# Function: extractDependencyChanges()

> **extractDependencyChanges**(`files`): `object`

Defined in: [detector/src/diff-parser.ts:218](https://github.com/pradeepmouli/dependabit/blob/4918d1ad177242efd82cc7d7c13c4be62c454ef5/packages/detector/src/diff-parser.ts#L218)

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
