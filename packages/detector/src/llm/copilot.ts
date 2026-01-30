/**
 * GitHub Copilot / Azure OpenAI Provider Implementation
 * Integrates with GitHub Copilot via Azure OpenAI SDK
 */

import { AzureOpenAI } from '@azure/openai';
import type {
  LLMProvider,
  LLMProviderConfig,
  LLMResponse,
  RateLimitInfo,
  DetectedDependency,
  LLMUsageMetadata
} from './client.js';
import { SYSTEM_PROMPT } from './prompts.js';

export class GitHubCopilotProvider implements LLMProvider {
  private client: AzureOpenAI;
  private config: Required<LLMProviderConfig>;
  private model: string;

  constructor(config: LLMProviderConfig = {}) {
    // Default configuration
    this.config = {
      apiKey: config.apiKey || process.env['GITHUB_TOKEN'] || process.env['AZURE_OPENAI_API_KEY'] || '',
      endpoint: config.endpoint || process.env['AZURE_OPENAI_ENDPOINT'] || 'https://api.openai.com',
      model: config.model || 'gpt-4',
      maxTokens: config.maxTokens || 4000,
      temperature: config.temperature || 0.3
    };

    this.model = this.config.model;

    if (!this.config.apiKey) {
      throw new Error('API key required: set GITHUB_TOKEN or AZURE_OPENAI_API_KEY environment variable');
    }

    // Initialize Azure OpenAI client
    this.client = new AzureOpenAI({
      apiKey: this.config.apiKey
    });
  }

  async analyze(content: string, prompt: string): Promise<LLMResponse> {
    const startTime = Date.now();

    try {
      const messages = [
        { role: 'system' as const, content: SYSTEM_PROMPT },
        { role: 'user' as const, content: prompt }
      ];

      const response = await this.client.chat.completions.create({
        model: this.model,
        messages,
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature,
        response_format: { type: 'json_object' }
      });

      const latencyMs = Date.now() - startTime;

      if (!response.choices || response.choices.length === 0) {
        throw new Error('No response from LLM');
      }

      const content_text = response.choices[0].message?.content || '{}';
      let parsed: { dependencies: DetectedDependency[] };

      try {
        parsed = JSON.parse(content_text);
      } catch (parseError) {
        console.error('Failed to parse LLM response:', content_text);
        // Return empty result on parse failure
        parsed = { dependencies: [] };
      }

      const usage: LLMUsageMetadata = {
        promptTokens: response.usage?.prompt_tokens || 0,
        completionTokens: response.usage?.completion_tokens || 0,
        totalTokens: response.usage?.total_tokens || 0,
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
      console.error('LLM analysis failed:', error);
      
      // Return empty result on error, with usage stats
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
    return [
      'gpt-4',
      'gpt-4-turbo',
      'gpt-4o',
      'gpt-3.5-turbo',
      'gpt-3.5-turbo-16k'
    ];
  }

  async getRateLimit(): Promise<RateLimitInfo> {
    // Note: Azure OpenAI doesn't expose rate limits via SDK
    // This is a placeholder implementation
    return {
      remaining: 1000,
      limit: 1000,
      resetAt: new Date(Date.now() + 3600000) // 1 hour from now
    };
  }

  validateConfig(): boolean {
    return !!(this.config.apiKey && this.config.endpoint && this.config.model);
  }
}
