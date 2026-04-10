[**Documentation v0.1.16**](../../../README.md)

***

[Documentation](../../../README.md) / [@dependabit/detector](../README.md) / parseGoMod

# Function: parseGoMod()

> **parseGoMod**(`content`): [`PackageMetadata`](../interfaces/PackageMetadata.md)

Defined in: [detector/src/parsers/package-files.ts:130](https://github.com/pradeepmouli/dependabit/blob/2f586b74942347a0d6cf8cd13709400ab545830b/packages/detector/src/parsers/package-files.ts#L130)

Parse go.mod and extract URLs from comments
EXCLUDES actual dependencies (handled by dependabot)

## Parameters

### content

`string`

## Returns

[`PackageMetadata`](../interfaces/PackageMetadata.md)
