[**Documentation v0.1.16**](../../../README.md)

***

[Documentation](../../../README.md) / [@dependabit/detector](../README.md) / parseGoMod

# Function: parseGoMod()

> **parseGoMod**(`content`): [`PackageMetadata`](../interfaces/PackageMetadata.md)

Defined in: [detector/src/parsers/package-files.ts:130](https://github.com/pradeepmouli/dependabit/blob/593f80b1a52a09f3a829e289daa81800eaa7d5b0/packages/detector/src/parsers/package-files.ts#L130)

Parse go.mod and extract URLs from comments
EXCLUDES actual dependencies (handled by dependabot)

## Parameters

### content

`string`

## Returns

[`PackageMetadata`](../interfaces/PackageMetadata.md)
