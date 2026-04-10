[**Documentation v0.1.16**](../../../README.md)

***

[Documentation](../../../README.md) / [@dependabit/detector](../README.md) / getChangedFiles

# Function: getChangedFiles()

> **getChangedFiles**(`files`): [`ChangedFilesResult`](../interfaces/ChangedFilesResult.md)

Defined in: [detector/src/diff-parser.ts:154](https://github.com/pradeepmouli/dependabit/blob/4918d1ad177242efd82cc7d7c13c4be62c454ef5/packages/detector/src/diff-parser.ts#L154)

Identify files relevant for dependency analysis

Note: Filenames in relevantFiles preserve their original case from the commit.
Case-insensitive matching is used for identification, but original casing is maintained
for consistency with file system operations.

## Parameters

### files

[`CommitFile`](../../github-client/interfaces/CommitFile.md)[]

## Returns

[`ChangedFilesResult`](../interfaces/ChangedFilesResult.md)
