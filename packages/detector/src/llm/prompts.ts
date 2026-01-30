/**
 * Detection Prompts for LLM
 * T035 [P] [US1] Implement detection prompts
 */

/**
 * System prompt for dependency detection
 */
export const SYSTEM_PROMPT = `You are an expert at analyzing source code and documentation to identify external informational dependencies.

Your task is to identify URLs and references to:
- Documentation websites and API references
- Research papers (arXiv, academic publications)
- Reference implementations (GitHub repos, code examples)
- Schema definitions (OpenAPI, JSON Schema, Protocol Buffers)
- API examples and tutorials

IMPORTANT EXCLUSIONS (DO NOT include these):
- Package manager dependencies (npm, PyPI, Cargo, etc.) - these are tracked separately
- Standard library references
- Internal project files or modules
- Generic domains (google.com, stackoverflow.com without specific articles)

For each dependency you detect:
1. Extract the full URL
2. Classify the type (documentation, research-paper, reference-implementation, schema, api-example, other)
3. Provide a confidence score (0.0-1.0)
4. Include brief context about why this is a dependency

Return your response as a JSON array of dependencies.`;

/**
 * Create a user prompt for analyzing content
 */
export function createAnalysisPrompt(
  content: string,
  context?: {
    filePath?: string;
    fileType?: string;
    repoName?: string;
  }
): string {
  let prompt = 'Analyze the following content and identify all external informational dependencies:\n\n';

  if (context?.filePath) {
    prompt += `File: ${context.filePath}\n`;
  }
  if (context?.fileType) {
    prompt += `Type: ${context.fileType}\n`;
  }
  if (context?.repoName) {
    prompt += `Repository: ${context.repoName}\n`;
  }

  prompt += '\n```\n';
  prompt += content;
  prompt += '\n```\n\n';

  prompt += `Return a JSON array with this exact structure:
[
  {
    "url": "https://example.com/resource",
    "type": "documentation" | "research-paper" | "reference-implementation" | "schema" | "api-example" | "other",
    "name": "Brief name for this resource",
    "description": "Optional description",
    "confidence": 0.95,
    "context": "Text excerpt showing where this was mentioned"
  }
]

If no dependencies are found, return an empty array: []`;

  return prompt;
}

/**
 * Example response format for LLM guidance
 */
export const EXAMPLE_RESPONSE = {
  dependencies: [
    {
      url: 'https://arxiv.org/abs/1706.03762',
      type: 'research-paper',
      name: 'Attention Is All You Need',
      description: 'Original Transformer architecture paper',
      confidence: 0.98,
      context: 'Based on the Transformer architecture from https://arxiv.org/abs/1706.03762'
    },
    {
      url: 'https://github.com/openai/tiktoken',
      type: 'reference-implementation',
      name: 'tiktoken',
      description: 'BPE tokenizer implementation',
      confidence: 0.92,
      context: 'Uses tokenization approach similar to https://github.com/openai/tiktoken'
    }
  ]
};
