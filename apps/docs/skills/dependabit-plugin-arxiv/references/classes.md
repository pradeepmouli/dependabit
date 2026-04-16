# Classes

## plugin-arxiv

### `ArxivChecker`
Monitors arXiv preprints for new versions via the arXiv Atom API.
```ts
constructor(): ArxivChecker
```
**Methods:**
- `fetch(config: ArxivConfig): Promise<ArxivSnapshot>` — Fetch paper information from arXiv API
- `compare(prev: ArxivSnapshot, curr: ArxivSnapshot): Promise<ArxivChangeDetection>` — Compare two arXiv snapshots to detect changes
