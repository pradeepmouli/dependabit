// Entry point for @dependabit/detector

export { Detector } from './detector.js';
export type { DetectorOptions, DetectorResult } from './detector.js';

export type { LLMClient, LLMAnalysisResult, DetectedDependency, LLMClientOptions, AnalyzeOptions } from './llm/client.js';
export { CopilotClient } from './llm/copilot.js';
export type { CopilotClientOptions } from './llm/copilot.js';

export { ReadmeParser } from './parsers/readme.js';
export type { ParsedReference } from './parsers/readme.js';

export { CodeCommentParser } from './parsers/code-comments.js';
export type { CommentReference } from './parsers/code-comments.js';

export { PackageFileParser } from './parsers/package-files.js';
export type { PackageDependency } from './parsers/package-files.js';
