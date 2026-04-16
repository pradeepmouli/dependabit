# Classes

## logger

### `Logger`
Structured JSON logger for GitHub Actions
```ts
constructor(config: LoggerConfig): Logger
```
**Methods:**
- `debug(message: string, data?: Record<string, unknown>): void` — Log debug message
- `info(message: string, data?: Record<string, unknown>): void` — Log info message
- `warning(message: string, data?: Record<string, unknown>): void` — Log warning message
- `error(message: string, data?: Record<string, unknown>): void` — Log error message
- `startGroup(name: string): void` — Start a log group
- `endGroup(): void` — End a log group
- `getCorrelationId(): string` — Get correlation ID
- `child(context?: Record<string, unknown>): Logger` — Create a child logger with the same correlation ID
- `logLLMInteraction(data: { provider: string; model?: string; prompt: string; response: string; tokens?: number; latencyMs?: number }): void` — Log LLM interaction
- `logAPICall(data: { endpoint: string; method: string; statusCode?: number; latencyMs?: number; rateLimit?: { remaining: number; limit: number; reset: number } }): void` — Log API call
- `logDuration(operation: string, durationMs: number, data?: Record<string, unknown>): void` — Log operation duration
