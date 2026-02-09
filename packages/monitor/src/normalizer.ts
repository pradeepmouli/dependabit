/**
 * HTML Normalizer for content-based change detection
 *
 * Implements 6-step normalization to reduce false positives:
 * 1. Remove <script> and <style> tags
 * 2. Strip HTML comments
 * 3. Normalize whitespace
 * 4. Remove timestamp patterns
 * 5. Remove analytics/tracking parameters
 * 6. Preserve meaningful content
 */

/**
 * Normalizes HTML content for consistent comparison
 * @param html Raw HTML content
 * @returns Normalized HTML string
 */
export function normalizeHTML(html: string): string {
  if (!html || html.trim() === '') {
    return '';
  }

  let normalized = html;

  // Step 1: Remove script and style tags (with content)
  // Use a simpler, more secure approach - remove everything between opening and closing tags
  // This handles variations like </script >, </script\n>, etc.
  let prevLength = 0;
  while (normalized.length !== prevLength) {
    prevLength = normalized.length;
    // Match <script...> then any content, then </script with any whitespace/attributes before >
    normalized = normalized.replace(/<script\b[^>]*>[\s\S]*?<\/script\s*[^>]*>/gi, '');
  }
  prevLength = 0;
  while (normalized.length !== prevLength) {
    prevLength = normalized.length;
    normalized = normalized.replace(/<style\b[^>]*>[\s\S]*?<\/style\s*[^>]*>/gi, '');
  }

  // Step 2: Strip HTML comments - iterative to handle nested comments
  prevLength = 0;
  while (normalized.length !== prevLength) {
    prevLength = normalized.length;
    normalized = normalized.replace(/<!--[\s\S]*?-->/g, '');
  }

  // Step 3: Normalize whitespace (collapse multiple spaces/newlines)
  normalized = normalized.replace(/\s+/g, ' ');
  normalized = normalized.trim();

  // Step 4: Remove common timestamp patterns
  // Patterns like "Updated: 2024-01-01" or "Last modified: Jan 1, 2024"
  normalized = normalized.replace(
    /\b(Updated|Last\s+modified|Modified|Created|Published):\s*[^<\n]+/gi,
    ''
  );

  // Remove ISO timestamps
  normalized = normalized.replace(
    /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})?/g,
    ''
  );

  // Remove common date formats
  normalized = normalized.replace(
    /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2},?\s+\d{4}\b/gi,
    ''
  );

  // Step 5: Remove analytics/tracking parameters from URLs
  // UTM parameters, tracking IDs, session IDs, etc.
  normalized = normalized.replace(
    /[?&](utm_[^&\s"']+|fbclid|gclid|msclkid|mc_[^&\s"']+|_ga|sessionid)[^&\s"']*/gi,
    ''
  );

  // Step 6: Final cleanup - preserve meaningful content structure
  // Remove extra spaces that may have been introduced
  normalized = normalized.replace(/\s+/g, ' ');
  normalized = normalized.trim();

  return normalized;
}

/**
 * Normalizes a URL by removing tracking parameters
 * @param url URL string
 * @returns Normalized URL
 */
export function normalizeURL(url: string): string {
  try {
    const urlObj = new URL(url);

    // Remove common tracking parameters
    const trackingParams = [
      'utm_source',
      'utm_medium',
      'utm_campaign',
      'utm_term',
      'utm_content',
      'fbclid',
      'gclid',
      'msclkid',
      'mc_cid',
      'mc_eid',
      '_ga',
      '_gac',
      'sessionid',
      'sid',
      'SSID'
    ];

    trackingParams.forEach((param) => {
      urlObj.searchParams.delete(param);
    });

    return urlObj.toString();
  } catch  {
    // If URL parsing fails, return original
    return url;
  }
}
