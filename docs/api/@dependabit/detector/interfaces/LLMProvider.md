[**Documentation v0.1.16**](../../../README.md)

***

[Documentation](../../../README.md) / [@dependabit/detector](../README.md) / LLMProvider

# Interface: LLMProvider

Defined in: [detector/src/llm/client.ts:54](https://github.com/pradeepmouli/dependabit/blob/2f586b74942347a0d6cf8cd13709400ab545830b/packages/detector/src/llm/client.ts#L54)

Base interface that all LLM providers must implement

## Methods

### analyze()

> **analyze**(`content`, `prompt`): `Promise`\<[`LLMResponse`](LLMResponse.md)\>

Defined in: [detector/src/llm/client.ts:61](https://github.com/pradeepmouli/dependabit/blob/2f586b74942347a0d6cf8cd13709400ab545830b/packages/detector/src/llm/client.ts#L61)

Analyze content and detect external dependencies

#### Parameters

##### content

`string`

Text content to analyze (README, code, etc.)

##### prompt

`string`

Detection prompt template

#### Returns

`Promise`\<[`LLMResponse`](LLMResponse.md)\>

LLM response with detected dependencies

***

### getRateLimit()

> **getRateLimit**(): `Promise`\<[`RateLimitInfo`](RateLimitInfo.md)\>

Defined in: [detector/src/llm/client.ts:71](https://github.com/pradeepmouli/dependabit/blob/2f586b74942347a0d6cf8cd13709400ab545830b/packages/detector/src/llm/client.ts#L71)

Get current rate limit status

#### Returns

`Promise`\<[`RateLimitInfo`](RateLimitInfo.md)\>

***

### getSupportedModels()

> **getSupportedModels**(): `string`[]

Defined in: [detector/src/llm/client.ts:66](https://github.com/pradeepmouli/dependabit/blob/2f586b74942347a0d6cf8cd13709400ab545830b/packages/detector/src/llm/client.ts#L66)

Get list of supported models for this provider

#### Returns

`string`[]

***

### validateConfig()

> **validateConfig**(): `boolean`

Defined in: [detector/src/llm/client.ts:76](https://github.com/pradeepmouli/dependabit/blob/2f586b74942347a0d6cf8cd13709400ab545830b/packages/detector/src/llm/client.ts#L76)

Validate provider configuration

#### Returns

`boolean`
