// Entry point for @dependabit/detector

// LLM Provider
export type {
  LLMProvider,
  LLMProviderConfig,
  LLMResponse,
  RateLimitInfo,
  DetectedDependency,
  LLMUsageMetadata
} from './llm/client.js';
export { GitHubCopilotProvider } from './llm/copilot.js';
export { SYSTEM_PROMPT, createDetectionPrompt, createClassificationPrompt } from './llm/prompts.js';

// Parsers
export type { ExtractedReference } from './parsers/readme.js';
export { parseReadme, extractGitHubReferences } from './parsers/readme.js';

export type { CommentReference } from './parsers/code-comments.js';
export { parseCodeComments, extractSpecReferences } from './parsers/code-comments.js';

export type { PackageMetadata } from './parsers/package-files.js';
export {
  parsePackageJson,
  parseRequirementsTxt,
  parseCargoToml,
  parseGoMod
} from './parsers/package-files.js';

// Diff Parser
export type { DiffParseResult, ExtractedContent, ChangedFilesResult } from './diff-parser.js';
export {
  parseDiff,
  extractAddedContent,
  extractRemovedContent,
  getChangedFiles,
  parseCommitDiffs,
  extractDependencyChanges
} from './diff-parser.js';

// Detector
export type { DetectorOptions, DetectionResult } from './detector.js';
export { Detector } from './detector.js';
