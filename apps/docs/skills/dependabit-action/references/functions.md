# Functions

## `main`
```ts
main(): Promise<void>
```
**Returns:** `Promise<void>`

## logger

### `createLogger`
Create a new logger instance
```ts
createLogger(config?: LoggerConfig): Logger
```
**Parameters:**
- `config: LoggerConfig` (optional)
**Returns:** `Logger`

### `withTiming`
Measure and log operation duration
```ts
withTiming<T>(logger: Logger, operation: string, fn: () => Promise<T>): Promise<T>
```
**Parameters:**
- `logger: Logger`
- `operation: string`
- `fn: () => Promise<T>`
**Returns:** `Promise<T>`
