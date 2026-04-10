[**Documentation v0.1.16**](../../../README.md)

***

[Documentation](../../../README.md) / [@dependabit/manifest](../README.md) / LLMConfigSchema

# Variable: LLMConfigSchema

> `const` **LLMConfigSchema**: `ZodObject`\<\{ `maxTokens`: `ZodDefault`\<`ZodNumber`\>; `model`: `ZodOptional`\<`ZodString`\>; `provider`: `ZodDefault`\<`ZodEnum`\<\{ `azure-openai`: `"azure-openai"`; `claude`: `"claude"`; `github-copilot`: `"github-copilot"`; `openai`: `"openai"`; \}\>\>; `temperature`: `ZodDefault`\<`ZodNumber`\>; \}, `$strip`\>

Defined in: [packages/manifest/src/schema.ts:141](https://github.com/pradeepmouli/dependabit/blob/12b63d7aa2de6ab4cf236695ba391228bb4f0775/packages/manifest/src/schema.ts#L141)
