# Troubleshooting Guide

## Common Issues

### Manifest Not Generated

**Symptoms**:
- Workflow completes but no `.dependabit/` folder created
- Action output shows 0 dependencies found

**Possible Causes & Solutions**:

1. **LLM Provider Not Available**
   ```
   Error: GitHub Copilot CLI not found
   ```
   - Ensure GitHub Copilot is enabled for your organization
   - Check that the `gh` CLI is installed on the runner
   - Verify authentication: `gh auth status`

2. **No Discoverable Dependencies**
   - Repository may not have external documentation links
   - Check README.md and code comments for URLs
   - Try running with `debug: true` for verbose output

3. **Permission Issues**
   ```
   Error: Resource not accessible by integration
   ```
   - Add `contents: write` permission to workflow
   - Check repository settings for Actions permissions

**Debug Command**:
```yaml
- uses: pradeepmouli/dependabit@v1
  with:
    action: generate
    debug: 'true'  # Enable verbose logging
```

---

### No Issues Created on Change Detection

**Symptoms**:
- Check action detects changes
- No GitHub issues appear
- Logs show "Issue creation skipped"

**Possible Causes & Solutions**:

1. **Missing Permissions**
   ```yaml
   permissions:
     issues: write  # Required for issue creation
   ```

2. **Issue Already Exists**
   - Dependabit prevents duplicate issues
   - Check for existing open issues with `dependabit` label
   - Close or resolve existing issues first

3. **Monitoring Disabled**
   ```yaml
   # .dependabit/config.yml
   monitoring:
     enabled: true  # Must be true
   ```

4. **Severity Filter Too High**
   ```yaml
   - uses: pradeepmouli/dependabit@v1
     with:
       action: check
       severity_filter: minor  # Allow all severities
   ```

---

### High False Positive Rate

**Symptoms**:
- Many issues created for non-meaningful changes
- Content change detected but not relevant
- User reports issues as false positives

**Possible Causes & Solutions**:

1. **Noisy URLs (ads, analytics, timestamps)**
   ```yaml
   # .dependabit/config.yml
   ignore:
     patterns:
       - ".*analytics.*"
       - ".*tracking.*"
       - ".*timestamp=.*"
   ```

2. **Volatile Content (news, feeds)**
   ```yaml
   dependencies:
     - url: "https://volatile-site.com/feed"
       monitoring:
         ignoreChanges: true  # Track but don't alert
   ```

3. **Low Detection Confidence**
   ```yaml
   monitoring:
     falsePositiveThreshold: 0.2  # Require higher confidence
   ```

4. **HTML Normalization Issues**
   - Dynamic content causing hash changes
   - Contact maintainers for improved normalizer

**Reporting False Positives**:
- Add `false-positive` label to generated issues
- Dependabit tracks this for accuracy metrics
- Feedback helps improve detection

---

### Rate Limit Exceeded

**Symptoms**:
```
Error: GitHub API rate limit exceeded
You have exceeded a secondary rate limit
```

**Possible Causes & Solutions**:

1. **Too Many Dependencies**
   - Reduce check frequency for large manifests
   ```yaml
   schedule:
     interval: weekly  # Instead of daily
   ```

2. **Concurrent Workflows**
   - Add concurrency control:
   ```yaml
   concurrency:
     group: dependabit-${{ github.ref }}
     cancel-in-progress: true
   ```

3. **Per-Dependency Rate Limiting**
   ```yaml
   dependencies:
     - url: "https://frequently-checked.com"
       schedule:
         interval: weekly  # Reduce frequency
   ```

4. **Use Authenticated Requests**
   ```yaml
   - uses: pradeepmouli/dependabit@v1
     with:
       github_token: ${{ secrets.GITHUB_TOKEN }}
   ```

**Checking Rate Limit**:
```bash
gh api rate_limit
```

---

### Manifest Validation Fails

**Symptoms**:
```
Error: Schema validation failed
Error: Duplicate dependency IDs found
Error: Invalid URL format
```

**Common Validation Errors**:

1. **Invalid UUID**
   ```json
   {
     "id": "not-a-uuid"  // ❌ Wrong
     "id": "550e8400-e29b-41d4-a716-446655440000"  // ✓ Correct
   }
   ```

2. **Missing Required Fields**
   ```json
   {
     "url": "https://example.com",
     // Missing: type, accessMethod, name, currentStateHash, etc.
   }
   ```

3. **Invalid Timestamps**
   ```json
   {
     "lastChecked": "2024-01-15"  // ❌ Missing time
     "lastChecked": "2024-01-15T00:00:00Z"  // ✓ ISO 8601
   }
   ```

4. **Statistics Mismatch**
   - `totalDependencies` must equal `dependencies.length`
   - Counts in `byType` must sum to total

**Validation Command**:
```yaml
- uses: pradeepmouli/dependabit@v1
  with:
    action: validate
    manifest_path: .dependabit/manifest.json
```

---

### LLM Analysis Fails

**Symptoms**:
```
Error: LLM request failed
Error: Token limit exceeded
Error: Rate limit for Copilot CLI
```

**Possible Causes & Solutions**:

1. **Token Budget Exceeded**
   ```yaml
   llm:
     maxTokens: 8000  # Increase limit
   ```

2. **Copilot Rate Limited**
   - Wait and retry (automatic with backoff)
   - Reduce analysis frequency
   - Use batch processing

3. **Invalid API Key** (for non-Copilot providers)
   - Verify secret is set: Settings → Secrets → Actions
   - Check key hasn't expired
   - Ensure key has required permissions

4. **Network Issues**
   - Add retry logic (built-in)
   - Check GitHub Actions status page

---

### Workflow Timeout

**Symptoms**:
```
Error: The job running on runner has exceeded the maximum execution time
```

**Solutions**:

1. **Reduce Dependency Count**
   ```yaml
   dependencies:
     - url: "https://low-priority.com"
       monitoring:
         enabled: false  # Skip low-priority deps
   ```

2. **Increase Timeout**
   ```yaml
   jobs:
     check:
       timeout-minutes: 30  # Default is 360
   ```

3. **Optimize Check Frequency**
   - Not all deps need daily checks
   - Use per-dependency schedules

4. **Parallelize**
   - Split manifest into multiple workflows
   - Use matrix strategy for parallel checks

---

## Debug Mode

Enable comprehensive logging:

```yaml
- uses: pradeepmouli/dependabit@v1
  with:
    action: check
    debug: 'true'
  env:
    ACTIONS_STEP_DEBUG: true
```

Debug output includes:
- LLM prompts and responses
- API request/response details
- Timing information
- Rate limit status
- Content normalization steps

---

## Log Analysis

### Finding the Root Cause

1. **Check Action Outputs**
   ```
   Run pradeepmouli/dependabit@v1
   with:
     action: check
   ```
   Look for error messages after this line.

2. **Review Annotations**
   - Warnings appear as yellow annotations
   - Errors appear as red annotations

3. **Download Artifacts**
   - Debug logs often saved as artifacts
   - Download for local analysis

### Common Log Patterns

**Successful Check**:
```
Checking 15 dependencies (2 skipped)...
✓ react.dev/reference: no changes
✓ github.com/vercel/ai: version 3.0.0 → 3.1.0 (minor)
Changes detected: 1
Issues created: 1
```

**Rate Limit Warning**:
```
⚠ GitHub API rate limit: 50/5000 remaining
Waiting 30 seconds for rate limit reset...
```

**LLM Fallback**:
```
⚠ LLM analysis unavailable, using programmatic detection only
Detection confidence may be lower
```

---

## Getting Help

### Before Asking for Help

1. **Check this guide** for common issues
2. **Enable debug mode** and review logs
3. **Validate your manifest** manually
4. **Check GitHub Actions status** for platform issues

### Filing an Issue

Include:
1. **Workflow file** (sanitize secrets)
2. **Action version** (e.g., `pradeepmouli/dependabit@v1.2.3`)
3. **Error messages** (full log preferred)
4. **Manifest snippet** (if relevant)
5. **Expected vs actual behavior**

**Issue Template**:
```markdown
## Description
Brief description of the issue

## Reproduction Steps
1. Configure workflow with...
2. Run generate action...
3. Observe error...

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Logs
\`\`\`
[Paste relevant logs here]
\`\`\`

## Environment
- Dependabit version: v1.x.x
- Runner: ubuntu-latest
- Node version: 20
```

### Support Resources

- **Documentation**: `docs/ai-dependency-tracker/`
- **Issues**: https://github.com/pradeepmouli/dependabit/issues
- **Discussions**: https://github.com/pradeepmouli/dependabit/discussions
