---
'@dependabit/detector': patch
'@dependabit/action': patch
---

Fix manifest generation to properly detect and retain GitHub repository URLs

- Add support for parsing non-README documentation files (.md, .txt, .rst, .adoc) in full-scan mode
- Add deterministic GitHub repository URL classification with high confidence (0.9)
- Filter placeholder URLs: YOUR-USERNAME, you/your-project, and other template patterns
- Skip self-references to avoid including the current repository in detected dependencies
- Ensure GitHub repo links are retained even when LLM analysis doesn't provide classification
