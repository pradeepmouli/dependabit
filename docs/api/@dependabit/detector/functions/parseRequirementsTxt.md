[**Documentation v0.1.16**](../../../README.md)

***

[Documentation](../../../README.md) / [@dependabit/detector](../README.md) / parseRequirementsTxt

# Function: parseRequirementsTxt()

> **parseRequirementsTxt**(`content`): [`PackageMetadata`](../interfaces/PackageMetadata.md)

Defined in: [detector/src/parsers/package-files.ts:60](https://github.com/pradeepmouli/dependabit/blob/7a951f605034a11422e43adf0f167eebf18155ad/packages/detector/src/parsers/package-files.ts#L60)

Parse requirements.txt and extract URLs from comments
EXCLUDES actual packages (handled by dependabot)

## Parameters

### content

`string`

## Returns

[`PackageMetadata`](../interfaces/PackageMetadata.md)
