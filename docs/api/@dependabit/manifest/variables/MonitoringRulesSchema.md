[**Documentation v0.1.16**](../../../README.md)

***

[Documentation](../../../README.md) / [@dependabit/manifest](../README.md) / MonitoringRulesSchema

# Variable: MonitoringRulesSchema

> `const` **MonitoringRulesSchema**: `ZodObject`\<\{ `checkFrequency`: `ZodDefault`\<`ZodEnum`\<\{ `daily`: `"daily"`; `hourly`: `"hourly"`; `monthly`: `"monthly"`; `weekly`: `"weekly"`; \}\>\>; `enabled`: `ZodDefault`\<`ZodBoolean`\>; `ignoreChanges`: `ZodDefault`\<`ZodBoolean`\>; `severityOverride`: `ZodOptional`\<`ZodEnum`\<\{ `breaking`: `"breaking"`; `major`: `"major"`; `minor`: `"minor"`; \}\>\>; \}, `$strip`\>

Defined in: [packages/manifest/src/schema.ts:42](https://github.com/pradeepmouli/dependabit/blob/12b63d7aa2de6ab4cf236695ba391228bb4f0775/packages/manifest/src/schema.ts#L42)
