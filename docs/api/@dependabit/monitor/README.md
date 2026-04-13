[**Documentation v0.1.16**](../../README.md)

***

[Documentation](../../README.md) / @dependabit/monitor

# @dependabit/monitor

Change detection and monitoring logic for external dependencies.

## Overview

This package implements the monitoring and change detection logic for tracking updates to external dependencies.

## Features

- Multi-strategy dependency checking
- GitHub repository monitoring
- Documentation URL content tracking
- OpenAPI spec semantic diffing
- Severity classification

## Installation

```bash
pnpm add @dependabit/monitor
```

## Usage

```typescript
import { monitor } from '@dependabit/monitor';

// Coming soon in Phase 5
```

## License

MIT

## Classes

- [GitHubRepoChecker](classes/GitHubRepoChecker.md)
- [Monitor](classes/Monitor.md)
- [OpenAPIChecker](classes/OpenAPIChecker.md)
- [Scheduler](classes/Scheduler.md)
- [SeverityClassifier](classes/SeverityClassifier.md)
- [StateComparator](classes/StateComparator.md)
- [URLContentChecker](classes/URLContentChecker.md)

## Interfaces

- [AccessConfig](interfaces/AccessConfig.md)
- [ChangeDetection](interfaces/ChangeDetection.md)
- [Checker](interfaces/Checker.md)
- [CheckResult](interfaces/CheckResult.md)
- [DependencyConfig](interfaces/DependencyConfig.md)
- [DependencySnapshot](interfaces/DependencySnapshot.md)

## Type Aliases

- [Severity](type-aliases/Severity.md)

## Functions

- [normalizeHTML](functions/normalizeHTML.md)
- [normalizeURL](functions/normalizeURL.md)
