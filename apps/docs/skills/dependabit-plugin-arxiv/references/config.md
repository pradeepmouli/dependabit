# Configuration

## ArxivConfig

Configuration for the ArxivChecker.

### Properties

#### url

Abstract or PDF URL, or a bare arXiv ID (e.g. `2301.00001`).

**Type:** `string`

**Required:** yes

#### arxivId

Explicit arXiv ID (e.g. `2301.00001`) — parsed from `url` when omitted.

**Type:** `string`

### Use when
- Monitoring an arXiv preprint for new versions or abstract revisions.

### Pitfalls
- `url` should point to the abstract page (`/abs/`) not the PDF (`/pdf/`).
- The ID extractor supports both, but the canonical URL in the manifest
- should use the abstract form.
- arXiv IDs do not carry version numbers; the checker always fetches the
- **latest** version.  If a paper is withdrawn, the API returns an empty
- entry and the checker throws.