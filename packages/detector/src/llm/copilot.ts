/**
 * GitHub Copilot CLI Provider Implementation
 * Integrates with GitHub Copilot via CLI commands
 */

import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import type {
  LLMProvider,
  LLMProviderConfig,
  LLMResponse,
  RateLimitInfo,
  DetectedDependency,
  LLMUsageMetadata
} from './client.js';
import { SYSTEM_PROMPT } from './prompts.js';

const execFileAsync = promisify(execFile);

export class GitHubCopilotProvider implements LLMProvider {
  private config: Required<LLMProviderConfig>;
  private model: string;

  constructor(config: LLMProviderConfig = {}) {
    // Default configuration for CLI-based approach
    this.config = {
      apiKey: config.apiKey || process.env['GITHUB_TOKEN'] || '',
      endpoint: config.endpoint || '',
      model: config.model || 'gpt-4',
      maxTokens: config.maxTokens || 4000,
      temperature: config.temperature || 0.3
    };

    this.model = this.config.model;

    // GitHub Copilot CLI uses GitHub authentication, not a separate API key
    // The GITHUB_TOKEN is used for authentication with GitHub, not OpenAI
  }

  async analyze(content: string, prompt: string): Promise<LLMResponse> {
    const startTime = Date.now();

    try {
      // Combine system prompt and user prompt for CLI
      const fullPrompt = `${SYSTEM_PROMPT}\n\n${prompt}`;

      // Use execFile to avoid shell escaping issues and command injection
      // Pass prompt directly as an argument without manual escaping
      const args = [
        'copilot',
        '-p',
        fullPrompt,
        '--silent',
        '--allow-all-tools'
      ];

      const { stdout, stderr } = await execFileAsync('gh', args, {
        maxBuffer: 10 * 1024 * 1024, // 10MB buffer for large responses
        timeout: 60000 // 60 second timeout
      });

      const latencyMs = Date.now() - startTime;

      if (stderr && !stdout) {
        throw new Error(`Copilot CLI error: ${stderr}`);
      }

      // Try to parse the output as JSON
      // Copilot CLI may return the JSON directly or wrapped in markdown
      let content_text = stdout.trim();

      // Remove markdown code blocks if present
      if (content_text.includes('```json')) {
        const jsonMatch = content_text.match(/```json\s*([\s\S]*?)```/);
        if (jsonMatch && jsonMatch[1]) {
          content_text = jsonMatch[1].trim();
        }
      } else if (content_text.includes('```')) {
        const codeMatch = content_text.match(/```\s*([\s\S]*?)```/);
        if (codeMatch && codeMatch[1]) {
          content_text = codeMatch[1].trim();
        }
      }

      let parsed: { dependencies: DetectedDependency[] };

      try {
        parsed = JSON.parse(content_text);
      } catch (parseError) {
        console.error('Failed to parse Copilot CLI response:', content_text, parseError);
        // Return empty dependencies if parsing fails
        parsed = { dependencies: [] };
      }

      // Estimate token usage (rough approximation since CLI doesn't provide this)
      const estimatedTokens = Math.ceil(fullPrompt.length / 4) + Math.ceil(content_text.length / 4);

      const usage: LLMUsageMetadata = {
        promptTokens: Math.ceil(fullPrompt.length / 4),
        completionTokens: Math.ceil(content_text.length / 4),
        totalTokens: estimatedTokens,
        model: this.model,
        latencyMs
      };

      return {
        dependencies: parsed.dependencies || [],
        usage,
        rawResponse: content_text
      };
    } catch (error) {
      const latencyMs = Date.now() - startTime;
      console.error('Copilot CLI analysis failed:', error);

      // Return empty result on error
      return {
        dependencies: [],
        usage: {
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0,
          model: this.model,
          latencyMs
        },
        rawResponse: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  getSupportedModels(): string[] {
    // Copilot CLI uses GitHub's models, not directly specified
    return ['github-copilot', 'gpt-4', 'gpt-4-turbo'];
  }

  async getRateLimit(): Promise<RateLimitInfo> {
    // Copilot CLI doesn't expose rate limits directly
    // Rate limiting is handled by GitHub's infrastructure
    return {
      remaining: -1, // Unknown
      limit: -1, // Unknown
      resetAt: new Date(0) // Unknown
    };
  }

  validateConfig(): boolean {
    // For CLI approach, we just need gh CLI to be available
    // Authentication is handled by GitHub CLI itself
    return true;
  }
}
