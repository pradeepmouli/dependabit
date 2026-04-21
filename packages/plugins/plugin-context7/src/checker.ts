/**
 * Context7 Checker
 * Monitors documentation via Context7 API for version and content changes
 *
 * Context7 is a documentation API that provides structured access to library docs.
 * This checker tracks library versions and content changes in documentation.
 */

import crypto from 'node:crypto';
import { z } from 'zod';
import semver from 'semver';

/**
 * Configuration for the {@link Context7Checker}.
 *
 * @config
 * @category plugin-context7
 *
 * @useWhen
 * Monitoring a library's structured documentation via the Context7 API.
 *
 * @never
 * - `libraryId` must match the exact Context7 library identifier.  If the
 *   API returns 404 for a valid URL, try extracting the ID from the URL
 *   manually and providing it explicitly rather than relying on URL parsing.
 * - When `auth.secret` is omitted, the checker makes unauthenticated
 *   requests, which may have lower rate limits or restricted access.
 */
export interface Context7Config {
  url: string;
  libraryId?: string;
  auth?: {
    type: 'token' | 'none';
    secret?: string;
  };
}

/**
 * Context7 library metadata
 */
export interface Context7Library {
  id: string;
  name: string;
  version: string;
  lastUpdated: string;
  description?: string;
}

/**
 * Context7 snapshot result
 */
export interface Context7Snapshot {
  version: string;
  stateHash: string;
  fetchedAt: Date;
  metadata: {
    libraryId: string;
    libraryName: string;
    lastUpdated: string;
    description?: string;
    contentHash?: string;
  };
}

/**
 * Context7 change detection result
 */
export interface Context7ChangeDetection {
  hasChanged: boolean;
  changes: string[];
  oldVersion?: string;
  newVersion?: string;
  severity?: 'breaking' | 'major' | 'minor';
}

/**
 * Context7 API response schema
 */
const Context7ResponseSchema = z.object({
  library: z.object({
    id: z.string(),
    name: z.string(),
    version: z.string(),
    lastUpdated: z.string(),
    description: z.string().optional()
  }),
  content: z
    .object({
      sections: z.array(z.unknown()).optional(),
      hash: z.string().optional()
    })
    .optional()
});

/**
 * Monitors library documentation changes via the Context7 API, with a
 * fallback to direct URL content hashing when the API is unavailable.
 *
 * @remarks
 * The checker first tries `https://api.context7.io/v1/libraries/:id`.  On
 * 404 or 503 it silently falls back to fetching the documentation URL
 * directly and hashing the full response body.
 *
 * Version severity is determined via `semver.diff` — major semver bumps are
 * classified as `breaking`, minor as `major`, patch/pre-release as `minor`.
 * Non-semver versions (e.g. `unknown`) default to `minor`.
 *
 * @category plugin-context7
 *
 * @useWhen
 * Tracking libraries whose documentation is indexed by Context7 (e.g.,
 * React, Next.js, Prisma).
 *
 * @avoidWhen
 * Monitoring libraries without a Context7 entry — the fallback URL hash
 * is very sensitive to dynamic page content.  Prefer a specific HTTP
 * checker with normalised content in that case.
 *
 * @never
 * - **Fallback URL hash instability**: when the API is unavailable and the
 *   checker falls back to direct URL hashing, any dynamic content on the
 *   documentation page (e.g., timestamps, ads, CDN-injected nonces) will
 *   produce false positive changes.
 * - **Zod schema mismatches**: if Context7 changes its API response shape,
 *   `Context7ResponseSchema.parse` will throw a `ZodError` and the checker
 *   silently falls back to URL hashing without logging the schema error.
 * - **`lastUpdated` change without version bump**: some Context7 libraries
 *   update their `lastUpdated` field without bumping the version number.
 *   This produces a `changes: ['lastUpdated']` result with `severity: 'minor'`.
 */
export class Context7Checker {
  private baseUrl = 'https://api.context7.io';

  /**
   * Extract library ID from Context7 URL
   */
  private extractLibraryId(url: string): string | null {
    // Handle various Context7 URL patterns
    // e.g., https://context7.io/docs/react or https://context7.io/library/react
    const patterns = [
      /context7\.io\/docs\/([^/]+)/,
      /context7\.io\/library\/([^/]+)/,
      /context7\.io\/([^/]+)$/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match?.[1]) {
        return match[1];
      }
    }

    return null;
  }

  /**
   * Fetch library information from Context7 API
   */
  async fetch(config: Context7Config): Promise<Context7Snapshot> {
    const { url, libraryId: providedLibraryId, auth } = config;

    // Extract or use provided library ID
    const libraryId = providedLibraryId || this.extractLibraryId(url);
    if (!libraryId) {
      throw new Error(`Could not extract library ID from URL: ${url}`);
    }

    try {
      // Fetch library metadata from Context7 API
      const apiUrl = `${this.baseUrl}/v1/libraries/${libraryId}`;
      const response = await fetch(apiUrl, {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'dependabit-monitor/1.0',
          ...(auth?.secret && { Authorization: `Bearer ${auth.secret}` })
        }
      });

      if (!response.ok) {
        // If API is unavailable, fall back to URL content check
        if (response.status === 404 || response.status === 503) {
          return this.fallbackFetch(url, libraryId);
        }
        throw new Error(`Context7 API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const parsed = Context7ResponseSchema.parse(data);

      // Create state hash from library metadata + content
      const stateContent = JSON.stringify({
        version: parsed.library.version,
        lastUpdated: parsed.library.lastUpdated,
        contentHash: parsed.content?.hash
      });
      const stateHash = crypto.createHash('sha256').update(stateContent).digest('hex');

      const metadata: Context7Snapshot['metadata'] = {
        libraryId: parsed.library.id,
        libraryName: parsed.library.name,
        lastUpdated: parsed.library.lastUpdated
      };

      if (parsed.library.description !== undefined) {
        metadata.description = parsed.library.description;
      }

      if (parsed.content?.hash !== undefined) {
        metadata.contentHash = parsed.content.hash;
      }

      return {
        version: parsed.library.version,
        stateHash,
        fetchedAt: new Date(),
        metadata
      };
    } catch (error) {
      // Fallback to simple URL check if API fails
      if (error instanceof z.ZodError) {
        return this.fallbackFetch(url, libraryId);
      }
      throw new Error(`Failed to fetch Context7 library: ${(error as Error).message}`);
    }
  }

  /**
   * Fallback: fetch documentation page directly and hash content
   */
  private async fallbackFetch(url: string, libraryId: string): Promise<Context7Snapshot> {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'dependabit-monitor/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
    }

    const content = await response.text();

    // Extract version from page content if possible
    const versionMatch = content.match(/version[:\s]+["']?v?([\d.]+)/i);
    const version = versionMatch?.[1] || 'unknown';

    // Create state hash from content
    const stateHash = crypto.createHash('sha256').update(content).digest('hex');

    return {
      version,
      stateHash,
      fetchedAt: new Date(),
      metadata: {
        libraryId,
        libraryName: libraryId,
        lastUpdated: new Date().toISOString(),
        contentHash: stateHash
      }
    };
  }

  /**
   * Compare two Context7 snapshots to detect changes
   */
  async compare(prev: Context7Snapshot, curr: Context7Snapshot): Promise<Context7ChangeDetection> {
    const changes: string[] = [];
    let severity: 'breaking' | 'major' | 'minor' = 'minor';

    // Check version change
    if (prev.version !== curr.version) {
      changes.push('version');

      // Determine severity based on version change using semver
      if (prev.version && curr.version) {
        // Clean and parse versions - semver handles 'v' prefixes automatically
        const prevVersion = semver.coerce(prev.version);
        const currVersion = semver.coerce(curr.version);

        // Only classify if both versions are valid semver
        if (prevVersion && currVersion) {
          const diffType = semver.diff(prevVersion, currVersion);

          if (diffType === 'major' || diffType === 'premajor') {
            severity = 'breaking'; // Major version change
          } else if (diffType === 'minor' || diffType === 'preminor') {
            severity = 'major'; // Minor version change
          } else {
            severity = 'minor'; // Patch or prerelease change
          }
        }
        // If versions are not valid semver, leave severity as 'minor' (conservative default)
      }
    }

    // Check content hash change
    if (prev.stateHash !== curr.stateHash) {
      if (!changes.includes('version')) {
        changes.push('content');
      }
    }

    // Check last updated change
    if (prev.metadata.lastUpdated !== curr.metadata.lastUpdated) {
      changes.push('lastUpdated');
    }

    const result: Context7ChangeDetection = {
      hasChanged: changes.length > 0,
      changes,
      oldVersion: prev.version,
      newVersion: curr.version
    };

    if (changes.length > 0) {
      result.severity = severity;
    }

    return result;
  }
}

/**
 * Create a Context7 checker instance
 */
export function createContext7Checker(): Context7Checker {
  return new Context7Checker();
}
