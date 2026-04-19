# Types & Enums

## checker

### `ArxivPaper`
arXiv paper metadata
**Properties:**
- `id: string`
- `title: string`
- `authors: string[]`
- `abstract: string`
- `version: number`
- `publishedDate: string`
- `updatedDate: string`
- `pdfUrl: string`

### `ArxivSnapshot`
arXiv snapshot result
**Properties:**
- `version: string`
- `stateHash: string`
- `fetchedAt: Date`
- `metadata: { arxivId: string; title: string; authors: string[]; abstract: string; publishedDate: string; updatedDate: string; pdfUrl: string; versionNumber: number }`

### `ArxivChangeDetection`
arXiv change detection result
**Properties:**
- `hasChanged: boolean`
- `changes: string[]`
- `oldVersion: string` (optional)
- `newVersion: string` (optional)
- `severity: "breaking" | "major" | "minor"` (optional)
