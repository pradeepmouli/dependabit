# Types & Enums

## logger

### `LogEntry`
Structured log entry
**Properties:**
- `timestamp: string`
- `level: LogLevel`
- `message: string`
- `correlationId: string` (optional)

### `LogLevel`
Log level enumeration
- `DEBUG` = `"debug"`
- `INFO` = `"info"`
- `WARNING` = `"warning"`
- `ERROR` = `"error"`
