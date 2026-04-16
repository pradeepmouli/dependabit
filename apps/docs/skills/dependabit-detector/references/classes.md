# Classes

## Detector

### `GitHubCopilotProvider`
Contract that all LLM provider implementations must satisfy.
*implements `LLMProvider`*
```ts
constructor(config: LLMProviderConfig): GitHubCopilotProvider
```
**Methods:**
- `analyze(content: string, prompt: string): Promise<LLMResponse>` — Analyze content and detect external dependencies
- `getSupportedModels(): string[]` — Get list of supported models for this provider
- `getRateLimit(): Promise<RateLimitInfo>` — Get current rate limit status
- `validateConfig(): boolean` — Validate provider configuration

### `Detector`
Orchestrates multi-stage detection of informational external dependencies
inside a local repository clone.
```ts
constructor(options: DetectorOptions): Detector
```
**Methods:**
- `detectDependencies(): Promise<DetectionResult>` — Performs a full-repository scan and returns all detected informational
dependencies as a DetectionResult.
- `analyzeFiles(filePaths: string[]): Promise<DetectionResult>` — Analyzes a specific list of files for dependencies rather than scanning
the entire repository.  Prefer this over Detector.detectDependencies
when only a handful of files changed (e.g., in a pull-request diff).
```ts
import { Detector } from '@dependabit/detector';
import { GitHubCopilotProvider } from '@dependabit/detector';

const detector = new Detector({
  repoPath: '/path/to/repo',
  llmProvider: new GitHubCopilotProvider({ model: 'gpt-4o' }),
  repoOwner: 'my-org',
  repoName: 'my-repo',
});

const result = await detector.detectDependencies();
console.log(`Found ${result.dependencies.length} dependencies`);
```
