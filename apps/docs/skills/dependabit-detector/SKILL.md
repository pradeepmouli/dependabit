---
description: "Documentation site for dependabit Use when: You need to plug in a custom or self-hosted language model as the...."
name: dependabit-detector
---

# @dependabit/detector

Documentation site for dependabit

## When to Use

**Use this skill when:**
- You need to plug in a custom or self-hosted language model as the classification backend for the detector. → use `GitHubCopilotProvider`
- Scanning a freshly-cloned or locally-checked-out repository to build an initial manifest, or during CI to detect newly-introduced dependencies from a commit diff. → use `Detector`

**Do NOT use when:**
- You only need programmatic heuristics — constructing a stub provider that always returns an empty `dependencies` array has a small overhead but is safe. (`GitHubCopilotProvider`)
- The repository is very large (> 10 000 source files) — source file scanning is hard-capped at 50 files per run. (`Detector`)
- You need deterministic, reproducible output across model versions — LLM classifications are non-deterministic even with `temperature: 0`. (`Detector`)

API surface: 16 functions, 2 classes, 12 types, 1 constants

## NEVER

- Provider implementations must return valid JSON matching the `LLMResponse` shape.  Returning plain text causes the detector to silently produce zero LLM-sourced results.
- Do NOT cache the `analyze` response across different `model` values — classification schemes differ between model versions.
- **LLM output format instability**: the detector parses raw JSON from the LLM response; a model update that changes the output schema will silently produce zero LLM-sourced results rather than throwing.  Pin the model version in `DetectorOptions.llmProvider` when reproducibility matters.
- **Non-determinism**: identical inputs across two runs may produce different `dependencies` arrays if LLM classification is involved. Never diff two manifests by dependency count alone.
- **Token budget exhaustion**: manifests with large README files are truncated to 5 000 characters before being sent to the LLM.  URLs that appear only in the truncated portion will not be discovered by the LLM pass (they may still be found by the programmatic parser).
- **Source file cap**: only the first 50 source files returned by the directory traversal are scanned for code-comment references.  Repositories with many source files may have incomplete coverage.

## Configuration

2 configuration interfaces — see references/config.md for details.

## Quick Reference

**Key functions:** `createDetectionPrompt` (Renders a detection prompt by substituting the content-type, file path,
and raw content into `DETECTION_PROMPT_TEMPLATE`), `createClassificationPrompt` (Renders a classification prompt for a single URL, asking the LLM to
determine the dependency type and best access method)
**Key classes:** `GitHubCopilotProvider` (Contract that all LLM provider implementations must satisfy), `Detector` (Orchestrates multi-stage detection of informational external dependencies
inside a local repository clone)

*31 exports total — see references/ for full API.*

## References

Load these on demand — do NOT read all at once:

- When calling any function → read `references/functions.md` for full signatures, parameters, and return types
- When using a class → read `references/classes.md` for properties, methods, and inheritance
- When defining typed variables or function parameters → read `references/types.md`
- When using exported constants → read `references/variables.md`
- When configuring options → read `references/config.md` for all settings and defaults

## Links

- Author: Pradeep Mouli <pmouli@mac.com> (https://github.com/pradeepmouli)