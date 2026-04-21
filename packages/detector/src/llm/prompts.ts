/**
 * Detection prompts for LLM-based dependency analysis.
 *
 * @remarks
 * All exported constants and functions in this module are the source of truth
 * for what the LLM is instructed to do.  Changing them changes detection
 * behaviour globally — run the full detector integration tests before
 * modifying prompt templates in production.
 *
 * @never
 * - Editing prompt templates can silently break the JSON parsing in the
 *   detector; always verify that the LLM still returns a
 *   `{ "dependencies": [...] }` top-level key after changes.
 * - The `{content}` placeholder in `DETECTION_PROMPT_TEMPLATE` is replaced
 *   with raw file content.  Content containing curly braces can confuse
 *   naive `String.replace` substitution — the current implementation uses
 *   a single-pass replace, which is safe but will break if additional
 *   `{...}` placeholders are introduced.
 *
 * @category Detector
 */

export const SYSTEM_PROMPT = `You are an expert at analyzing code repositories to identify external informational dependencies.

Your task is to identify external resources that developers reference but are NOT tracked by package managers (npm, PyPI, Cargo, etc.).

INCLUDE these types of dependencies:
- GitHub repositories referenced but not declared in package files
- Documentation sites and API references
- OpenAPI/GraphQL schemas
- Research papers and arXiv preprints
- Reference implementations and code examples
- Technical specifications and RFCs

EXCLUDE these (handled by dependabot):
- NPM packages in package.json
- Python packages in requirements.txt
- Rust crates in Cargo.toml
- Docker images in Dockerfile
- Any declared package manager dependencies

ALSO EXCLUDE (false positives):
- URLs that reference the repository itself (self-references)
- Relative file paths (e.g., CONTRIBUTING.md, docs/guide.md, ./src/utils)
- Placeholder URLs used in documentation examples (example.com, example.org, localhost)
- Internal documentation links within the same repository
- URLs with template variables or placeholders (e.g., issues/[NUMBER], user/repo)

Only return dependencies with confidence >= 0.7.

For each dependency found, provide:
1. url: The complete URL
2. name: A descriptive name
3. description: What this dependency is used for
4. type: One of [reference-implementation, schema, documentation, research-paper, api-example, other]
5. confidence: A score from 0.0 to 1.0 indicating detection confidence
6. reasoning: Brief explanation of why this is a dependency

Return ONLY valid JSON in this format:
{
  "dependencies": [
    {
      "url": "https://example.com/resource",
      "name": "Resource Name",
      "description": "Purpose in the project",
      "type": "documentation",
      "confidence": 0.95,
      "reasoning": "Referenced in README as API documentation"
    }
  ]
}`;

export const DETECTION_PROMPT_TEMPLATE = `Analyze the following content from a code repository and identify external informational dependencies:

## Content Type: {contentType}
## File Path: {filePath}

## Content:
{content}

Remember:
- Focus on external resources NOT in package managers
- Provide confidence scores based on clarity of references
- Include context about how each dependency is used
- Return valid JSON only

Analyze and respond:`;

/**
 * Renders a detection prompt by substituting the content-type, file path,
 * and raw content into `DETECTION_PROMPT_TEMPLATE`.
 *
 * @param contentType - Human-readable label for the content (e.g. `"README"`).
 * @param filePath - Repository-relative file path for context.
 * @param content - Raw file content to analyze (not truncated here — callers
 *   should truncate before passing to stay within token budgets).
 * @returns Rendered prompt string ready to send to an LLM provider.
 *
 * @category Detector
 */
export function createDetectionPrompt(
  contentType: string,
  filePath: string,
  content: string
): string {
  return DETECTION_PROMPT_TEMPLATE.replace('{contentType}', contentType)
    .replace('{filePath}', filePath)
    .replace('{content}', content);
}

export const CLASSIFICATION_PROMPT_TEMPLATE = `Given this URL, classify its dependency type and suggest the best access method:

URL: {url}
Context: {context}

Classify as one of:
- reference-implementation: Example code demonstrating usage
- schema: OpenAPI, JSON Schema, GraphQL, Protocol Buffers  
- documentation: API docs, tutorials, guides
- research-paper: Academic papers, arXiv preprints
- api-example: Code snippets from documentation
- other: If none of the above fit

Also determine the best access method:
- github-api: For GitHub repositories
- arxiv: For arXiv papers
- openapi: For OpenAPI specifications
- http: For generic web content

Return JSON:
{
  "type": "documentation",
  "accessMethod": "http",
  "confidence": 0.9,
  "reasoning": "URL structure suggests API documentation"
}`;

/**
 * Renders a classification prompt for a single URL, asking the LLM to
 * determine the dependency type and best access method.
 *
 * @param url - The URL to classify.
 * @param context - Surrounding text or code comments that mention the URL,
 *   used to improve classification accuracy.
 * @returns Rendered prompt string.
 *
 * @category Detector
 */
export function createClassificationPrompt(url: string, context: string): string {
  return CLASSIFICATION_PROMPT_TEMPLATE.replace('{url}', url).replace('{context}', context);
}
