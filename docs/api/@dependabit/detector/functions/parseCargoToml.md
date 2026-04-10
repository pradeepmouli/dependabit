[**Documentation v0.1.16**](../../../README.md)

***

[Documentation](../../../README.md) / [@dependabit/detector](../README.md) / parseCargoToml

# Function: parseCargoToml()

> **parseCargoToml**(`content`): [`PackageMetadata`](../interfaces/PackageMetadata.md)

Defined in: [detector/src/parsers/package-files.ts:80](https://github.com/pradeepmouli/dependabit/blob/2f586b74942347a0d6cf8cd13709400ab545830b/packages/detector/src/parsers/package-files.ts#L80)

Parse Cargo.toml and extract metadata URLs
EXCLUDES actual dependencies (handled by dependabot)

## Parameters

### content

`string`

## Returns

[`PackageMetadata`](../interfaces/PackageMetadata.md)
