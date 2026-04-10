[**Documentation v0.1.16**](../../../README.md)

***

[Documentation](../../../README.md) / [@dependabit/detector](../README.md) / getChangedFiles

# Function: getChangedFiles()

> **getChangedFiles**(`files`): [`ChangedFilesResult`](../interfaces/ChangedFilesResult.md)

Defined in: [detector/src/diff-parser.ts:154](https://github.com/pradeepmouli/dependabit/blob/7a951f605034a11422e43adf0f167eebf18155ad/packages/detector/src/diff-parser.ts#L154)

Identify files relevant for dependency analysis

Note: Filenames in relevantFiles preserve their original case from the commit.
Case-insensitive matching is used for identification, but original casing is maintained
for consistency with file system operations.

## Parameters

### files

[`CommitFile`](../../github-client/interfaces/CommitFile.md)[]

## Returns

[`ChangedFilesResult`](../interfaces/ChangedFilesResult.md)
