[**Documentation v0.1.16**](../../../README.md)

***

[Documentation](../../../README.md) / [@dependabit/manifest](../README.md) / ScheduleSchema

# Variable: ScheduleSchema

> `const` **ScheduleSchema**: `ZodObject`\<\{ `day`: `ZodOptional`\<`ZodEnum`\<\{ `friday`: `"friday"`; `monday`: `"monday"`; `saturday`: `"saturday"`; `sunday`: `"sunday"`; `thursday`: `"thursday"`; `tuesday`: `"tuesday"`; `wednesday`: `"wednesday"`; \}\>\>; `interval`: `ZodEnum`\<\{ `daily`: `"daily"`; `hourly`: `"hourly"`; `monthly`: `"monthly"`; `weekly`: `"weekly"`; \}\>; `time`: `ZodOptional`\<`ZodString`\>; `timezone`: `ZodDefault`\<`ZodString`\>; \}, `$strip`\>

Defined in: [packages/manifest/src/schema.ts:128](https://github.com/pradeepmouli/dependabit/blob/12b63d7aa2de6ab4cf236695ba391228bb4f0775/packages/manifest/src/schema.ts#L128)
