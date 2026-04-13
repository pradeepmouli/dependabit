[**Documentation v0.1.16**](../../../README.md)

***

[Documentation](../../../README.md) / [@dependabit/github-client](../README.md) / FeedbackListener

# Class: FeedbackListener

Defined in: [packages/github-client/src/feedback.ts:44](https://github.com/pradeepmouli/dependabit/blob/2f586b74942347a0d6cf8cd13709400ab545830b/packages/github-client/src/feedback.ts#L44)

Listener that monitors issue labels for false positive feedback

## Constructors

### Constructor

> **new FeedbackListener**(`issueManager`, `config?`): `FeedbackListener`

Defined in: [packages/github-client/src/feedback.ts:49](https://github.com/pradeepmouli/dependabit/blob/2f586b74942347a0d6cf8cd13709400ab545830b/packages/github-client/src/feedback.ts#L49)

#### Parameters

##### issueManager

`IssueManagerInterface`

##### config?

[`FeedbackConfig`](../interfaces/FeedbackConfig.md) = `{}`

#### Returns

`FeedbackListener`

## Methods

### collectFeedback()

> **collectFeedback**(`options?`): `Promise`\<[`FeedbackData`](../interfaces/FeedbackData.md)\>

Defined in: [packages/github-client/src/feedback.ts:58](https://github.com/pradeepmouli/dependabit/blob/2f586b74942347a0d6cf8cd13709400ab545830b/packages/github-client/src/feedback.ts#L58)

Collect feedback from issues with feedback labels

#### Parameters

##### options?

`CollectOptions` = `{}`

#### Returns

`Promise`\<[`FeedbackData`](../interfaces/FeedbackData.md)\>

***

### getFeedbackRate()

> **getFeedbackRate**(`options?`): `Promise`\<[`FeedbackRate`](../interfaces/FeedbackRate.md)\>

Defined in: [packages/github-client/src/feedback.ts:123](https://github.com/pradeepmouli/dependabit/blob/2f586b74942347a0d6cf8cd13709400ab545830b/packages/github-client/src/feedback.ts#L123)

Calculate false positive rate from collected feedback

#### Parameters

##### options?

`CollectOptions` = `{}`

#### Returns

`Promise`\<[`FeedbackRate`](../interfaces/FeedbackRate.md)\>

***

### getRecentFeedback()

> **getRecentFeedback**(`days`, `referenceDate?`): `Promise`\<[`FeedbackData`](../interfaces/FeedbackData.md)\>

Defined in: [packages/github-client/src/feedback.ts:144](https://github.com/pradeepmouli/dependabit/blob/2f586b74942347a0d6cf8cd13709400ab545830b/packages/github-client/src/feedback.ts#L144)

Get feedback from recent time window (e.g., last 30 days)

#### Parameters

##### days

`number`

##### referenceDate?

`Date`

#### Returns

`Promise`\<[`FeedbackData`](../interfaces/FeedbackData.md)\>

***

### monitorIssue()

> **monitorIssue**(`issueNumber`): `Promise`\<`boolean`\>

Defined in: [packages/github-client/src/feedback.ts:155](https://github.com/pradeepmouli/dependabit/blob/2f586b74942347a0d6cf8cd13709400ab545830b/packages/github-client/src/feedback.ts#L155)

Check if a specific issue has feedback label

#### Parameters

##### issueNumber

`number`

#### Returns

`Promise`\<`boolean`\>
