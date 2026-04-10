[**Documentation v0.1.16**](../../../README.md)

***

[Documentation](../../../README.md) / [@dependabit/manifest](../README.md) / ChangeDetectionRecordSchema

# Variable: ChangeDetectionRecordSchema

> `const` **ChangeDetectionRecordSchema**: `ZodObject`\<\{ `breakingChanges`: `ZodOptional`\<`ZodArray`\<`ZodString`\>\>; `changeType`: `ZodEnum`\<\{ `content-changed`: `"content-changed"`; `deprecated`: `"deprecated"`; `released`: `"released"`; `unavailable`: `"unavailable"`; `unknown`: `"unknown"`; `version-bump`: `"version-bump"`; \}\>; `dependencyId`: `ZodString`; `dependencyName`: `ZodString`; `dependencyUrl`: `ZodString`; `details`: `ZodOptional`\<`ZodString`\>; `id`: `ZodString`; `issueCreated`: `ZodDefault`\<`ZodBoolean`\>; `issueNumber`: `ZodOptional`\<`ZodNumber`\>; `issueUrl`: `ZodOptional`\<`ZodString`\>; `newState`: `ZodObject`\<\{ `checkedAt`: `ZodString`; `hash`: `ZodString`; `version`: `ZodOptional`\<`ZodString`\>; \}, `$strip`\>; `oldState`: `ZodObject`\<\{ `checkedAt`: `ZodString`; `hash`: `ZodString`; `version`: `ZodOptional`\<`ZodString`\>; \}, `$strip`\>; `severity`: `ZodEnum`\<\{ `breaking`: `"breaking"`; `major`: `"major"`; `minor`: `"minor"`; \}\>; `summary`: `ZodString`; `timestamp`: `ZodString`; \}, `$strip`\>

Defined in: [packages/manifest/src/schema.ts:216](https://github.com/pradeepmouli/dependabit/blob/4918d1ad177242efd82cc7d7c13c4be62c454ef5/packages/manifest/src/schema.ts#L216)
