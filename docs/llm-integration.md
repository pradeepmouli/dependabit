# LLM Integration Guide

## Overview

Dependabit uses Large Language Models (LLMs) to intelligently analyze codebases and detect external dependencies that aren't captured by traditional dependency managers. This document covers the LLM integration architecture, supported providers, and best practices.

## Supported LLM Providers

### GitHub Copilot (Default)
**Recommended for GitHub Actions environments**

```yaml
# .dependabit/config.yml
llm:
  provider: github-copilot
```

**Advantages**:
- Pre-installed on GitHub Actions runners
- No additional API keys required
- Native GitHub authentication
- Integrated rate limiting

**Usage via gh CLI**:
```bash
gh copilot suggest "Analyze this code for external dependencies"
```

### Claude (Anthropic)
**High accuracy for complex analysis**

```yaml
llm:
  provider: claude
  model: claude-opus-4-5
```

**Required Secret**: `ANTHROPIC_API_KEY`

### OpenAI
**General-purpose analysis**

```yaml
llm:
  provider: openai
  model: gpt-4
```

**Required Secret**: `OPENAI_API_KEY`

### Azure OpenAI
**Enterprise deployments**

```yaml
llm:
  provider: azure-openai
  model: deployment-name
```

**Required Secrets**:
- `AZURE_OPENAI_API_KEY`
- `AZURE_OPENAI_ENDPOINT`

## LLM Integration Architecture

```
┌─────────────────────────────────────────────────┐
│                  Detector                        │
│                                                 │
│  ┌───────────────┐   ┌───────────────────────┐  │
│  │  Programmatic │   │   LLM-Based Analysis  │  │
│  │   Parsers     │   │                       │  │
│  │               │   │  ┌─────────────────┐  │  │
│  │ - README      │   │  │  Prompt Builder │  │  │
│  │ - Comments    │   │  └────────┬────────┘  │  │
│  │ - package.json│   │           │           │  │
│  │ - imports     │   │  ┌────────▼────────┐  │  │
│  └───────┬───────┘   │  │   LLM Client    │  │  │
│          │           │  │  (abstraction)  │  │  │
│          │           │  └────────┬────────┘  │  │
│          │           │           │           │  │
│          │           │  ┌────────▼────────┐  │  │
│          │           │  │    Provider     │  │  │
│          │           │  │ Implementation  │  │  │
│          │           │  └─────────────────┘  │  │
│          │           └───────────────────────┘  │
│          │                       │              │
│          └───────────┬───────────┘              │
│                      │                          │
│              ┌───────▼───────┐                  │
│              │   Combiner    │                  │
│              │  (dedup,merge)│                  │
│              └───────────────┘                  │
└─────────────────────────────────────────────────┘
```

## LLM Client Interface

```typescript
// packages/detector/src/llm/client.ts

export interface LLMClient {
  /**
   * Analyze code content for dependencies
   */
  analyzeForDependencies(
    content: string,
    context: AnalysisContext
  ): Promise<LLMAnalysisResult>;

  /**
   * Categorize a detected URL
   */
  categorizeDependency(
    url: string,
    surroundingContext: string
  ): Promise<DependencyCategorizationResult>;

  /**
   * Generate change summary
   */
  summarizeChange(
    dependency: DependencyEntry,
    changes: ChangeDetails
  ): Promise<ChangeSummary>;
}

export interface AnalysisContext {
  filename: string;
  language: string;
  projectContext?: string;
}

export interface LLMAnalysisResult {
  dependencies: DetectedDependency[];
  confidence: number;
  reasoning?: string;
}
```

## Prompt Templates

### Dependency Detection Prompt

```typescript
const DEPENDENCY_DETECTION_PROMPT = `
You are analyzing code to find external dependencies that are NOT typically tracked
by package managers. These include:

1. Documentation URLs (API docs, tutorials, guides)
2. Research papers (arXiv, academic papers)
3. Reference implementations (GitHub repos used as examples)
4. API schemas (OpenAPI specs, GraphQL schemas)
5. Blog posts with implementation guidance

For each dependency found, extract:
- URL: The exact URL referenced
- Type: One of [documentation, research-paper, reference-implementation, schema, api-example]
- Context: Why this dependency matters to the code
- Confidence: Your confidence in this being a meaningful dependency (0.0-1.0)

Do NOT include:
- Package dependencies (npm, pip, cargo, etc.)
- Internal project links
- Generic search results
- Social media links

Code to analyze:
\`\`\`{language}
{content}
\`\`\`

Return JSON array of dependencies.
`;
```

### Categorization Prompt

```typescript
const CATEGORIZATION_PROMPT = `
Given this URL and surrounding context, categorize the dependency:

URL: {url}
Context: {context}

Determine:
1. Type: [documentation, research-paper, reference-implementation, schema, api-example, other]
2. Access Method: [http, github-api, arxiv, openapi, context7]
3. Importance: [high, medium, low]
4. Suggested Name: Human-readable name for this dependency

Return JSON object.
`;
```

### Change Summary Prompt

```typescript
const CHANGE_SUMMARY_PROMPT = `
A dependency has changed. Generate a concise summary:

Dependency: {name}
URL: {url}
Previous Version: {oldVersion}
New Version: {newVersion}
Changes Detected: {changes}

Generate:
1. A brief summary (1-2 sentences) of what changed
2. Impact assessment (breaking, major, minor)
3. Recommended actions for developers
4. Key points to review

Return structured JSON.
`;
```

## Hybrid Detection Strategy

Dependabit uses a **hybrid approach** to minimize LLM costs while maintaining accuracy:

### Phase 1: Programmatic Detection (Fast, Cheap)

```typescript
// Extract URLs from README
const readmeUrls = extractMarkdownLinks(readmeContent);

// Extract URLs from code comments
const commentUrls = extractCommentUrls(sourceCode);

// Extract from package.json homepage/repository
const packageUrls = extractPackageUrls(packageJson);
```

**Confidence**: 0.9 (high, deterministic)

### Phase 2: LLM Classification (Smart, Costly)

For each extracted URL:
1. Determine if it's a meaningful dependency
2. Categorize the type
3. Determine access method
4. Generate description

**Confidence**: 0.5-0.9 (varies based on context)

### Phase 3: LLM Discovery (Comprehensive, Most Costly)

Full content analysis for:
- Implicit dependencies (code patterns)
- Context-dependent references
- Domain-specific knowledge

**Confidence**: 0.3-0.8 (depends on clarity)

## Token Budget Management

```yaml
# .dependabit/config.yml
llm:
  provider: github-copilot
  maxTokens: 4000      # Per request
  temperature: 0.3     # Lower = more deterministic
```

### Budget Allocation Strategy

| Phase | % of Budget | Typical Tokens |
|-------|-------------|----------------|
| Categorization | 40% | 500-1000 |
| Discovery | 40% | 1000-2000 |
| Summarization | 20% | 500-1000 |

### Token Optimization Tips

1. **Batch Similar Files**: Group files by language/type
2. **Progressive Detail**: Start with summaries, drill down
3. **Cache Results**: Don't re-analyze unchanged files
4. **Early Termination**: Stop when confidence is high

## Response Parsing

```typescript
// Parse LLM response with error handling
function parseLLMResponse(response: string): DetectedDependency[] {
  try {
    // Try JSON parsing first
    return JSON.parse(response);
  } catch {
    // Fallback: extract structured data from text
    return extractStructuredData(response);
  }
}

// Validate and normalize
function validateDependency(dep: unknown): DetectedDependency | null {
  const result = DetectedDependencySchema.safeParse(dep);
  if (result.success) {
    return result.data;
  }
  console.warn('Invalid dependency:', result.error);
  return null;
}
```

## Error Handling

### Retry Strategy

```typescript
async function llmWithRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (isRateLimitError(error)) {
        await sleep(2 ** i * 1000); // Exponential backoff
        continue;
      }
      throw error;
    }
  }
  throw new Error('Max retries exceeded');
}
```

### Fallback Behavior

When LLM is unavailable:
1. Use programmatic detection only
2. Set confidence to 0.9 for extracted URLs
3. Skip categorization (mark as "unknown")
4. Log warning for manual review

## Testing LLM Integration

### Mock Provider for Tests

```typescript
// packages/detector/src/llm/__mocks__/client.ts
export class MockLLMClient implements LLMClient {
  async analyzeForDependencies(content: string): Promise<LLMAnalysisResult> {
    // Return deterministic results for testing
    return {
      dependencies: [
        {
          url: 'https://example.com/docs',
          type: 'documentation',
          confidence: 0.9,
        },
      ],
      confidence: 0.85,
    };
  }
}
```

### Integration Test with Real LLM

```typescript
describe('LLM Integration', () => {
  it('should detect dependencies from README', async () => {
    const client = createLLMClient({ provider: 'github-copilot' });

    const result = await client.analyzeForDependencies(
      fs.readFileSync('fixtures/sample-readme.md', 'utf8'),
      { filename: 'README.md', language: 'markdown' }
    );

    expect(result.dependencies.length).toBeGreaterThan(0);
    expect(result.confidence).toBeGreaterThan(0.5);
  });
});
```

## Best Practices

### 1. Minimize LLM Calls
- Cache responses for unchanged content
- Use programmatic detection first
- Batch multiple files when possible

### 2. Validate Responses
- Always parse with Zod schemas
- Handle malformed JSON gracefully
- Log and skip invalid entries

### 3. Monitor Costs
- Track token usage per run
- Set budget limits
- Alert on excessive usage

### 4. Handle Failures Gracefully
- Don't block on LLM failures
- Fall back to programmatic detection
- Queue for retry on rate limits

### 5. Improve Over Time
- Log false positives/negatives
- Adjust prompts based on feedback
- Track accuracy metrics
