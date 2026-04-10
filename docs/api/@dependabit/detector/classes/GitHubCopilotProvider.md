[**Documentation v0.1.16**](../../../README.md)

***

[Documentation](../../../README.md) / [@dependabit/detector](../README.md) / GitHubCopilotProvider

# Class: GitHubCopilotProvider

Defined in: [detector/src/llm/copilot.ts:20](https://github.com/pradeepmouli/dependabit/blob/4918d1ad177242efd82cc7d7c13c4be62c454ef5/packages/detector/src/llm/copilot.ts#L20)

Base interface that all LLM providers must implement

## Implements

- [`LLMProvider`](../interfaces/LLMProvider.md)

## Constructors

### Constructor

> **new GitHubCopilotProvider**(`config?`): `GitHubCopilotProvider`

Defined in: [detector/src/llm/copilot.ts:24](https://github.com/pradeepmouli/dependabit/blob/4918d1ad177242efd82cc7d7c13c4be62c454ef5/packages/detector/src/llm/copilot.ts#L24)

#### Parameters

##### config?

[`LLMProviderConfig`](../interfaces/LLMProviderConfig.md) = `{}`

#### Returns

`GitHubCopilotProvider`

## Methods

### analyze()

> **analyze**(`content`, `prompt`): `Promise`\<[`LLMResponse`](../interfaces/LLMResponse.md)\>

Defined in: [detector/src/llm/copilot.ts:40](https://github.com/pradeepmouli/dependabit/blob/4918d1ad177242efd82cc7d7c13c4be62c454ef5/packages/detector/src/llm/copilot.ts#L40)

Analyze content and detect external dependencies

#### Parameters

##### content

`string`

Text content to analyze (README, code, etc.)

##### prompt

`string`

Detection prompt template

#### Returns

`Promise`\<[`LLMResponse`](../interfaces/LLMResponse.md)\>

LLM response with detected dependencies

#### Implementation of

[`LLMProvider`](../interfaces/LLMProvider.md).[`analyze`](../interfaces/LLMProvider.md#analyze)

***

### getRateLimit()

> **getRateLimit**(): `Promise`\<[`RateLimitInfo`](../interfaces/RateLimitInfo.md)\>

Defined in: [detector/src/llm/copilot.ts:135](https://github.com/pradeepmouli/dependabit/blob/4918d1ad177242efd82cc7d7c13c4be62c454ef5/packages/detector/src/llm/copilot.ts#L135)

Get current rate limit status

#### Returns

`Promise`\<[`RateLimitInfo`](../interfaces/RateLimitInfo.md)\>

#### Implementation of

[`LLMProvider`](../interfaces/LLMProvider.md).[`getRateLimit`](../interfaces/LLMProvider.md#getratelimit)

***

### getSupportedModels()

> **getSupportedModels**(): `string`[]

Defined in: [detector/src/llm/copilot.ts:130](https://github.com/pradeepmouli/dependabit/blob/4918d1ad177242efd82cc7d7c13c4be62c454ef5/packages/detector/src/llm/copilot.ts#L130)

Get list of supported models for this provider

#### Returns

`string`[]

#### Implementation of

[`LLMProvider`](../interfaces/LLMProvider.md).[`getSupportedModels`](../interfaces/LLMProvider.md#getsupportedmodels)

***

### validateConfig()

> **validateConfig**(): `boolean`

Defined in: [detector/src/llm/copilot.ts:145](https://github.com/pradeepmouli/dependabit/blob/4918d1ad177242efd82cc7d7c13c4be62c454ef5/packages/detector/src/llm/copilot.ts#L145)

Validate provider configuration

#### Returns

`boolean`

#### Implementation of

[`LLMProvider`](../interfaces/LLMProvider.md).[`validateConfig`](../interfaces/LLMProvider.md#validateconfig)
