[**Documentation v0.1.16**](../../../README.md)

***

[Documentation](../../../README.md) / [@dependabit/monitor](../README.md) / Scheduler

# Class: Scheduler

Defined in: [monitor/src/scheduler.ts:21](https://github.com/pradeepmouli/dependabit/blob/12b63d7aa2de6ab4cf236695ba391228bb4f0775/packages/monitor/src/scheduler.ts#L21)

Scheduler for per-dependency monitoring

Determines which dependencies should be checked based on:
- Check frequency (hourly, daily, weekly, monthly)
- Last checked timestamp
- Enabled/disabled status
- IgnoreChanges flag
- Config overrides

## Constructors

### Constructor

> **new Scheduler**(): `Scheduler`

#### Returns

`Scheduler`

## Methods

### filterDependenciesToCheck()

> **filterDependenciesToCheck**(`dependencies`, `config`, `currentTime?`): `object`[]

Defined in: [monitor/src/scheduler.ts:80](https://github.com/pradeepmouli/dependabit/blob/12b63d7aa2de6ab4cf236695ba391228bb4f0775/packages/monitor/src/scheduler.ts#L80)

Filter dependencies that should be checked

#### Parameters

##### dependencies

`object`[]

Array of dependencies

##### config

Configuration

###### dependencies?

`object`[]

###### ignore?

\{ `patterns?`: `string`[]; `types?`: (`"api-example"` \| `"documentation"` \| `"other"` \| `"reference-implementation"` \| `"research-paper"` \| `"schema"`)[]; `urls?`: `string`[]; `useGitExcludes`: `boolean`; \}

###### ignore.patterns?

`string`[]

###### ignore.types?

(`"api-example"` \| `"documentation"` \| `"other"` \| `"reference-implementation"` \| `"research-paper"` \| `"schema"`)[]

###### ignore.urls?

`string`[]

###### ignore.useGitExcludes

`boolean`

###### issues?

\{ `aiAgentAssignment?`: \{ `breaking?`: `string`; `enabled`: `boolean`; `major?`: `string`; `minor?`: `string`; \}; `assignees`: `string`[]; `bodyTemplate?`: `string`; `labels`: `string`[]; `titleTemplate`: `string`; \}

###### issues.aiAgentAssignment?

\{ `breaking?`: `string`; `enabled`: `boolean`; `major?`: `string`; `minor?`: `string`; \}

###### issues.aiAgentAssignment.breaking?

`string`

###### issues.aiAgentAssignment.enabled

`boolean`

###### issues.aiAgentAssignment.major?

`string`

###### issues.aiAgentAssignment.minor?

`string`

###### issues.assignees

`string`[]

###### issues.bodyTemplate?

`string`

###### issues.labels

`string`[]

###### issues.titleTemplate

`string`

###### llm?

\{ `maxTokens`: `number`; `model?`: `string`; `provider`: `"azure-openai"` \| `"claude"` \| `"github-copilot"` \| `"openai"`; `temperature`: `number`; \}

###### llm.maxTokens

`number`

###### llm.model?

`string`

###### llm.provider

`"azure-openai"` \| `"claude"` \| `"github-copilot"` \| `"openai"`

###### llm.temperature

`number`

###### monitoring?

\{ `autoUpdate`: `boolean`; `enabled`: `boolean`; `falsePositiveThreshold`: `number`; \}

###### monitoring.autoUpdate

`boolean`

###### monitoring.enabled

`boolean`

###### monitoring.falsePositiveThreshold

`number`

###### schedule

\{ `day?`: `"friday"` \| `"monday"` \| `"saturday"` \| `"sunday"` \| `"thursday"` \| `"tuesday"` \| `"wednesday"`; `interval`: `"daily"` \| `"hourly"` \| `"monthly"` \| `"weekly"`; `time?`: `string`; `timezone`: `string`; \}

###### schedule.day?

`"friday"` \| `"monday"` \| `"saturday"` \| `"sunday"` \| `"thursday"` \| `"tuesday"` \| `"wednesday"`

###### schedule.interval

`"daily"` \| `"hourly"` \| `"monthly"` \| `"weekly"`

###### schedule.time?

`string`

###### schedule.timezone

`string`

###### version

`"1"`

##### currentTime?

`Date` = `...`

Current time (defaults to now)

#### Returns

`object`[]

Filtered array of dependencies to check

***

### getNextCheckTime()

> **getNextCheckTime**(`dependency`, `config`): `Date`

Defined in: [monitor/src/scheduler.ts:116](https://github.com/pradeepmouli/dependabit/blob/12b63d7aa2de6ab4cf236695ba391228bb4f0775/packages/monitor/src/scheduler.ts#L116)

Get next check time for a dependency

#### Parameters

##### dependency

Dependency entry

###### accessMethod

`"github-api"` \| `"http"` \| `"openapi"` \| `"context7"` \| `"arxiv"`

###### auth?

\{ `secretEnvVar?`: `string`; `type`: `"token"` \| `"basic"` \| `"oauth"` \| `"none"`; \}

###### auth.secretEnvVar?

`string`

###### auth.type

`"token"` \| `"basic"` \| `"oauth"` \| `"none"`

###### changeHistory

`object`[]

###### currentStateHash

`string`

###### currentVersion?

`string`

###### description?

`string`

###### detectedAt

`string`

###### detectionConfidence

`number`

###### detectionMethod

`"code-comment"` \| `"llm-analysis"` \| `"manual"` \| `"package-json"` \| `"requirements-txt"`

###### id

`string`

###### lastChanged?

`string`

###### lastChecked

`string`

###### monitoring?

\{ `checkFrequency`: `"daily"` \| `"hourly"` \| `"monthly"` \| `"weekly"`; `enabled`: `boolean`; `ignoreChanges`: `boolean`; `severityOverride?`: `"breaking"` \| `"major"` \| `"minor"`; \}

###### monitoring.checkFrequency

`"daily"` \| `"hourly"` \| `"monthly"` \| `"weekly"`

###### monitoring.enabled

`boolean`

###### monitoring.ignoreChanges

`boolean`

###### monitoring.severityOverride?

`"breaking"` \| `"major"` \| `"minor"`

###### name

`string`

###### referencedIn

`object`[]

###### type

`"api-example"` \| `"documentation"` \| `"other"` \| `"reference-implementation"` \| `"research-paper"` \| `"schema"`

###### url

`string`

##### config

Configuration

###### dependencies?

`object`[]

###### ignore?

\{ `patterns?`: `string`[]; `types?`: (`"api-example"` \| `"documentation"` \| `"other"` \| `"reference-implementation"` \| `"research-paper"` \| `"schema"`)[]; `urls?`: `string`[]; `useGitExcludes`: `boolean`; \}

###### ignore.patterns?

`string`[]

###### ignore.types?

(`"api-example"` \| `"documentation"` \| `"other"` \| `"reference-implementation"` \| `"research-paper"` \| `"schema"`)[]

###### ignore.urls?

`string`[]

###### ignore.useGitExcludes

`boolean`

###### issues?

\{ `aiAgentAssignment?`: \{ `breaking?`: `string`; `enabled`: `boolean`; `major?`: `string`; `minor?`: `string`; \}; `assignees`: `string`[]; `bodyTemplate?`: `string`; `labels`: `string`[]; `titleTemplate`: `string`; \}

###### issues.aiAgentAssignment?

\{ `breaking?`: `string`; `enabled`: `boolean`; `major?`: `string`; `minor?`: `string`; \}

###### issues.aiAgentAssignment.breaking?

`string`

###### issues.aiAgentAssignment.enabled

`boolean`

###### issues.aiAgentAssignment.major?

`string`

###### issues.aiAgentAssignment.minor?

`string`

###### issues.assignees

`string`[]

###### issues.bodyTemplate?

`string`

###### issues.labels

`string`[]

###### issues.titleTemplate

`string`

###### llm?

\{ `maxTokens`: `number`; `model?`: `string`; `provider`: `"azure-openai"` \| `"claude"` \| `"github-copilot"` \| `"openai"`; `temperature`: `number`; \}

###### llm.maxTokens

`number`

###### llm.model?

`string`

###### llm.provider

`"azure-openai"` \| `"claude"` \| `"github-copilot"` \| `"openai"`

###### llm.temperature

`number`

###### monitoring?

\{ `autoUpdate`: `boolean`; `enabled`: `boolean`; `falsePositiveThreshold`: `number`; \}

###### monitoring.autoUpdate

`boolean`

###### monitoring.enabled

`boolean`

###### monitoring.falsePositiveThreshold

`number`

###### schedule

\{ `day?`: `"friday"` \| `"monday"` \| `"saturday"` \| `"sunday"` \| `"thursday"` \| `"tuesday"` \| `"wednesday"`; `interval`: `"daily"` \| `"hourly"` \| `"monthly"` \| `"weekly"`; `time?`: `string`; `timezone`: `string`; \}

###### schedule.day?

`"friday"` \| `"monday"` \| `"saturday"` \| `"sunday"` \| `"thursday"` \| `"tuesday"` \| `"wednesday"`

###### schedule.interval

`"daily"` \| `"hourly"` \| `"monthly"` \| `"weekly"`

###### schedule.time?

`string`

###### schedule.timezone

`string`

###### version

`"1"`

#### Returns

`Date`

Next check time

***

### getScheduleSummary()

> **getScheduleSummary**(`dependencies`, `config`): `object`

Defined in: [monitor/src/scheduler.ts:134](https://github.com/pradeepmouli/dependabit/blob/12b63d7aa2de6ab4cf236695ba391228bb4f0775/packages/monitor/src/scheduler.ts#L134)

Get schedule summary for all dependencies

#### Parameters

##### dependencies

`object`[]

Array of dependencies

##### config

Configuration

###### dependencies?

`object`[]

###### ignore?

\{ `patterns?`: `string`[]; `types?`: (`"api-example"` \| `"documentation"` \| `"other"` \| `"reference-implementation"` \| `"research-paper"` \| `"schema"`)[]; `urls?`: `string`[]; `useGitExcludes`: `boolean`; \}

###### ignore.patterns?

`string`[]

###### ignore.types?

(`"api-example"` \| `"documentation"` \| `"other"` \| `"reference-implementation"` \| `"research-paper"` \| `"schema"`)[]

###### ignore.urls?

`string`[]

###### ignore.useGitExcludes

`boolean`

###### issues?

\{ `aiAgentAssignment?`: \{ `breaking?`: `string`; `enabled`: `boolean`; `major?`: `string`; `minor?`: `string`; \}; `assignees`: `string`[]; `bodyTemplate?`: `string`; `labels`: `string`[]; `titleTemplate`: `string`; \}

###### issues.aiAgentAssignment?

\{ `breaking?`: `string`; `enabled`: `boolean`; `major?`: `string`; `minor?`: `string`; \}

###### issues.aiAgentAssignment.breaking?

`string`

###### issues.aiAgentAssignment.enabled

`boolean`

###### issues.aiAgentAssignment.major?

`string`

###### issues.aiAgentAssignment.minor?

`string`

###### issues.assignees

`string`[]

###### issues.bodyTemplate?

`string`

###### issues.labels

`string`[]

###### issues.titleTemplate

`string`

###### llm?

\{ `maxTokens`: `number`; `model?`: `string`; `provider`: `"azure-openai"` \| `"claude"` \| `"github-copilot"` \| `"openai"`; `temperature`: `number`; \}

###### llm.maxTokens

`number`

###### llm.model?

`string`

###### llm.provider

`"azure-openai"` \| `"claude"` \| `"github-copilot"` \| `"openai"`

###### llm.temperature

`number`

###### monitoring?

\{ `autoUpdate`: `boolean`; `enabled`: `boolean`; `falsePositiveThreshold`: `number`; \}

###### monitoring.autoUpdate

`boolean`

###### monitoring.enabled

`boolean`

###### monitoring.falsePositiveThreshold

`number`

###### schedule

\{ `day?`: `"friday"` \| `"monday"` \| `"saturday"` \| `"sunday"` \| `"thursday"` \| `"tuesday"` \| `"wednesday"`; `interval`: `"daily"` \| `"hourly"` \| `"monthly"` \| `"weekly"`; `time?`: `string`; `timezone`: `string`; \}

###### schedule.day?

`"friday"` \| `"monday"` \| `"saturday"` \| `"sunday"` \| `"thursday"` \| `"tuesday"` \| `"wednesday"`

###### schedule.interval

`"daily"` \| `"hourly"` \| `"monthly"` \| `"weekly"`

###### schedule.time?

`string`

###### schedule.timezone

`string`

###### version

`"1"`

#### Returns

`object`

Schedule summary grouped by frequency

##### daily

> **daily**: `number`

##### disabled

> **disabled**: `number`

##### hourly

> **hourly**: `number`

##### monthly

> **monthly**: `number`

##### weekly

> **weekly**: `number`

***

### shouldCheckDependency()

> **shouldCheckDependency**(`dependency`, `config`, `currentTime?`): `boolean`

Defined in: [monitor/src/scheduler.ts:30](https://github.com/pradeepmouli/dependabit/blob/12b63d7aa2de6ab4cf236695ba391228bb4f0775/packages/monitor/src/scheduler.ts#L30)

Check if a dependency should be checked now

#### Parameters

##### dependency

Dependency entry

###### accessMethod

`"github-api"` \| `"http"` \| `"openapi"` \| `"context7"` \| `"arxiv"`

###### auth?

\{ `secretEnvVar?`: `string`; `type`: `"token"` \| `"basic"` \| `"oauth"` \| `"none"`; \}

###### auth.secretEnvVar?

`string`

###### auth.type

`"token"` \| `"basic"` \| `"oauth"` \| `"none"`

###### changeHistory

`object`[]

###### currentStateHash

`string`

###### currentVersion?

`string`

###### description?

`string`

###### detectedAt

`string`

###### detectionConfidence

`number`

###### detectionMethod

`"code-comment"` \| `"llm-analysis"` \| `"manual"` \| `"package-json"` \| `"requirements-txt"`

###### id

`string`

###### lastChanged?

`string`

###### lastChecked

`string`

###### monitoring?

\{ `checkFrequency`: `"daily"` \| `"hourly"` \| `"monthly"` \| `"weekly"`; `enabled`: `boolean`; `ignoreChanges`: `boolean`; `severityOverride?`: `"breaking"` \| `"major"` \| `"minor"`; \}

###### monitoring.checkFrequency

`"daily"` \| `"hourly"` \| `"monthly"` \| `"weekly"`

###### monitoring.enabled

`boolean`

###### monitoring.ignoreChanges

`boolean`

###### monitoring.severityOverride?

`"breaking"` \| `"major"` \| `"minor"`

###### name

`string`

###### referencedIn

`object`[]

###### type

`"api-example"` \| `"documentation"` \| `"other"` \| `"reference-implementation"` \| `"research-paper"` \| `"schema"`

###### url

`string`

##### config

Configuration

###### dependencies?

`object`[]

###### ignore?

\{ `patterns?`: `string`[]; `types?`: (`"api-example"` \| `"documentation"` \| `"other"` \| `"reference-implementation"` \| `"research-paper"` \| `"schema"`)[]; `urls?`: `string`[]; `useGitExcludes`: `boolean`; \}

###### ignore.patterns?

`string`[]

###### ignore.types?

(`"api-example"` \| `"documentation"` \| `"other"` \| `"reference-implementation"` \| `"research-paper"` \| `"schema"`)[]

###### ignore.urls?

`string`[]

###### ignore.useGitExcludes

`boolean`

###### issues?

\{ `aiAgentAssignment?`: \{ `breaking?`: `string`; `enabled`: `boolean`; `major?`: `string`; `minor?`: `string`; \}; `assignees`: `string`[]; `bodyTemplate?`: `string`; `labels`: `string`[]; `titleTemplate`: `string`; \}

###### issues.aiAgentAssignment?

\{ `breaking?`: `string`; `enabled`: `boolean`; `major?`: `string`; `minor?`: `string`; \}

###### issues.aiAgentAssignment.breaking?

`string`

###### issues.aiAgentAssignment.enabled

`boolean`

###### issues.aiAgentAssignment.major?

`string`

###### issues.aiAgentAssignment.minor?

`string`

###### issues.assignees

`string`[]

###### issues.bodyTemplate?

`string`

###### issues.labels

`string`[]

###### issues.titleTemplate

`string`

###### llm?

\{ `maxTokens`: `number`; `model?`: `string`; `provider`: `"azure-openai"` \| `"claude"` \| `"github-copilot"` \| `"openai"`; `temperature`: `number`; \}

###### llm.maxTokens

`number`

###### llm.model?

`string`

###### llm.provider

`"azure-openai"` \| `"claude"` \| `"github-copilot"` \| `"openai"`

###### llm.temperature

`number`

###### monitoring?

\{ `autoUpdate`: `boolean`; `enabled`: `boolean`; `falsePositiveThreshold`: `number`; \}

###### monitoring.autoUpdate

`boolean`

###### monitoring.enabled

`boolean`

###### monitoring.falsePositiveThreshold

`number`

###### schedule

\{ `day?`: `"friday"` \| `"monday"` \| `"saturday"` \| `"sunday"` \| `"thursday"` \| `"tuesday"` \| `"wednesday"`; `interval`: `"daily"` \| `"hourly"` \| `"monthly"` \| `"weekly"`; `time?`: `string`; `timezone`: `string`; \}

###### schedule.day?

`"friday"` \| `"monday"` \| `"saturday"` \| `"sunday"` \| `"thursday"` \| `"tuesday"` \| `"wednesday"`

###### schedule.interval

`"daily"` \| `"hourly"` \| `"monthly"` \| `"weekly"`

###### schedule.time?

`string`

###### schedule.timezone

`string`

###### version

`"1"`

##### currentTime?

`Date` = `...`

Current time (defaults to now)

#### Returns

`boolean`

true if dependency should be checked
