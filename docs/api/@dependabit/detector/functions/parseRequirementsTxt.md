[**Documentation v0.1.16**](../../../README.md)

***

[Documentation](../../../README.md) / [@dependabit/detector](../README.md) / parseRequirementsTxt

# Function: parseRequirementsTxt()

> **parseRequirementsTxt**(`content`): [`PackageMetadata`](../interfaces/PackageMetadata.md)

Defined in: [detector/src/parsers/package-files.ts:60](https://github.com/pradeepmouli/dependabit/blob/593f80b1a52a09f3a829e289daa81800eaa7d5b0/packages/detector/src/parsers/package-files.ts#L60)

Parse requirements.txt and extract URLs from comments
EXCLUDES actual packages (handled by dependabot)

## Parameters

### content

`string`

## Returns

[`PackageMetadata`](../interfaces/PackageMetadata.md)
