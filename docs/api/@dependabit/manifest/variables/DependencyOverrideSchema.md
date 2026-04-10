[**Documentation v0.1.16**](../../../README.md)

***

[Documentation](../../../README.md) / [@dependabit/manifest](../README.md) / DependencyOverrideSchema

# Variable: DependencyOverrideSchema

> `const` **DependencyOverrideSchema**: `ZodObject`\<\{ `issues`: `ZodOptional`\<`ZodObject`\<\{ `aiAgentAssignment`: `ZodOptional`\<`ZodObject`\<\{ `breaking`: `ZodOptional`\<`ZodString`\>; `enabled`: `ZodDefault`\<`ZodBoolean`\>; `major`: `ZodOptional`\<`ZodString`\>; `minor`: `ZodOptional`\<`ZodString`\>; \}, `$strip`\>\>; `assignees`: `ZodDefault`\<`ZodArray`\<`ZodString`\>\>; `bodyTemplate`: `ZodOptional`\<`ZodString`\>; `labels`: `ZodDefault`\<`ZodArray`\<`ZodString`\>\>; `titleTemplate`: `ZodDefault`\<`ZodString`\>; \}, `$strip`\>\>; `monitoring`: `ZodOptional`\<`ZodObject`\<\{ `checkFrequency`: `ZodDefault`\<`ZodEnum`\<\{ `daily`: `"daily"`; `hourly`: `"hourly"`; `monthly`: `"monthly"`; `weekly`: `"weekly"`; \}\>\>; `enabled`: `ZodDefault`\<`ZodBoolean`\>; `ignoreChanges`: `ZodDefault`\<`ZodBoolean`\>; `severityOverride`: `ZodOptional`\<`ZodEnum`\<\{ `breaking`: `"breaking"`; `major`: `"major"`; `minor`: `"minor"`; \}\>\>; \}, `$strip`\>\>; `schedule`: `ZodOptional`\<`ZodObject`\<\{ `day`: `ZodOptional`\<`ZodEnum`\<\{ `friday`: `"friday"`; `monday`: `"monday"`; `saturday`: `"saturday"`; `sunday`: `"sunday"`; `thursday`: `"thursday"`; `tuesday`: `"tuesday"`; `wednesday`: `"wednesday"`; \}\>\>; `interval`: `ZodEnum`\<\{ `daily`: `"daily"`; `hourly`: `"hourly"`; `monthly`: `"monthly"`; `weekly`: `"weekly"`; \}\>; `time`: `ZodOptional`\<`ZodString`\>; `timezone`: `ZodDefault`\<`ZodString`\>; \}, `$strip`\>\>; `url`: `ZodString`; \}, `$strip`\>

Defined in: [packages/manifest/src/schema.ts:167](https://github.com/pradeepmouli/dependabit/blob/593f80b1a52a09f3a829e289daa81800eaa7d5b0/packages/manifest/src/schema.ts#L167)
