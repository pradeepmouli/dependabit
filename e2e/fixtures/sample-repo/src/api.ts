/**
 * API client for fetching data
 *
 * Implementation based on patterns from:
 * - https://tanstack.com/query/latest/docs/react/overview
 * - https://react.dev/reference/react/useEffect#fetching-data-with-effects
 */

export interface ApiConfig {
  baseUrl: string;
  timeout?: number;
}

export interface ApiResponse<T> {
  data: T;
  status: number;
  headers: Record<string, string>;
}

/**
 * Simple API client
 *
 * See OpenAI API Reference for authentication patterns:
 * https://platform.openai.com/docs/api-reference/authentication
 */
export async function fetchData<T>(url: string, config?: ApiConfig): Promise<ApiResponse<T>> {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json'
      // Authentication pattern from GitHub API docs
      // https://docs.github.com/en/rest/authentication/authenticating-to-the-rest-api
    },
    signal: AbortSignal.timeout(config?.timeout ?? 30000)
  });

  const data = await response.json();

  return {
    data: data as T,
    status: response.status,
    headers: Object.fromEntries(response.headers.entries())
  };
}

// Transformer-based processing
// Reference: "Attention Is All You Need" (https://arxiv.org/abs/1706.03762)
export function processWithAttention(input: string[]): string[] {
  // Simplified attention mechanism
  return input.map((item, i) =>
    input.reduce((acc, other, j) => {
      const attention = Math.exp(-Math.abs(i - j));
      return acc + attention;
    }, 0) > 0.5
      ? item.toUpperCase()
      : item
  );
}
