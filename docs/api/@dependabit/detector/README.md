[**Documentation v0.1.16**](../../README.md)

***

[Documentation](../../README.md) / @dependabit/detector

# @dependabit/detector

LLM-based dependency detection for external resources.

## Overview

This package provides intelligent dependency detection using Large Language Models (LLMs) to analyze codebases and identify external dependencies, APIs, and resources.

## Features

- LLM-powered dependency detection
- README parser for extracting references
- Code comment parser for inline documentation
- Package file parser for standard dependency files

## Installation

```bash
pnpm add @dependabit/detector
```

## Usage

```typescript
import { detect } from '@dependabit/detector';

// Coming soon in Phase 3
```

## License

MIT

## Classes

- [Detector](classes/Detector.md)
- [GitHubCopilotProvider](classes/GitHubCopilotProvider.md)

## Interfaces

- [ChangedFilesResult](interfaces/ChangedFilesResult.md)
- [CommentReference](interfaces/CommentReference.md)
- [DetectedDependency](interfaces/DetectedDependency.md)
- [DetectionResult](interfaces/DetectionResult.md)
- [DetectorOptions](interfaces/DetectorOptions.md)
- [DiffParseResult](interfaces/DiffParseResult.md)
- [ExtractedContent](interfaces/ExtractedContent.md)
- [ExtractedReference](interfaces/ExtractedReference.md)
- [LLMProvider](interfaces/LLMProvider.md)
- [LLMProviderConfig](interfaces/LLMProviderConfig.md)
- [LLMResponse](interfaces/LLMResponse.md)
- [LLMUsageMetadata](interfaces/LLMUsageMetadata.md)
- [PackageMetadata](interfaces/PackageMetadata.md)
- [RateLimitInfo](interfaces/RateLimitInfo.md)

## Variables

- [SYSTEM\_PROMPT](variables/SYSTEM_PROMPT.md)

## Functions

- [createClassificationPrompt](functions/createClassificationPrompt.md)
- [createDetectionPrompt](functions/createDetectionPrompt.md)
- [extractAddedContent](functions/extractAddedContent.md)
- [extractDependencyChanges](functions/extractDependencyChanges.md)
- [extractGitHubReferences](functions/extractGitHubReferences.md)
- [extractRemovedContent](functions/extractRemovedContent.md)
- [extractSpecReferences](functions/extractSpecReferences.md)
- [getChangedFiles](functions/getChangedFiles.md)
- [parseCargoToml](functions/parseCargoToml.md)
- [parseCodeComments](functions/parseCodeComments.md)
- [parseCommitDiffs](functions/parseCommitDiffs.md)
- [parseDiff](functions/parseDiff.md)
- [parseGoMod](functions/parseGoMod.md)
- [parsePackageJson](functions/parsePackageJson.md)
- [parseReadme](functions/parseReadme.md)
- [parseRequirementsTxt](functions/parseRequirementsTxt.md)
